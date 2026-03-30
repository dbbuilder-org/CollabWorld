import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { z } from 'zod'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'
import { sendEntryApprovedEmail, sendEntryRejectedEmail } from '@/lib/emailTriggers'
import { createNotification } from '@/lib/notify'
import { logger } from '@/lib/logger'

const bulkSchema = z.object({
  entryIds: z.array(z.string()).min(1).max(100),
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId, sessionClaims } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  if (!isAdmin(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = bulkSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { entryIds, action, reason } = parsed.data
  const status = action === 'approve' ? 'approved' : 'rejected'

  const processed: string[] = []
  const errors: string[] = []

  // Load all entries first
  const entries = await db.contestEntry.findMany({
    where: { id: { in: entryIds } },
    include: {
      creator: { select: { clerkId: true, email: true, displayName: true } },
      contest: { select: { title: true, slug: true } },
    },
  })

  try {
    await db.$transaction(
      entries.map((entry: (typeof entries)[number]) =>
        db.contestEntry.update({
          where: { id: entry.id },
          data: {
            status,
            rejectionReason: status === 'rejected' ? (reason ?? null) : null,
          },
        })
      )
    )

    // Send notifications and emails outside transaction (fire-and-forget)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://collabworld.io'

    await Promise.allSettled(
      entries.map(async (entry: (typeof entries)[number]) => {
        const entryUrl = `${appUrl}/contests/${entry.contest.slug}/entries/${entry.id}`

        if (status === 'approved') {
          await sendEntryApprovedEmail({
            to: entry.creator.email,
            creatorName: entry.creator.displayName,
            contestTitle: entry.contest.title,
            entryUrl,
          }).catch(() => null)

          await createNotification({
            recipientClerkId: entry.creator.clerkId,
            type: 'entry_approved',
            title: 'Your entry has been approved!',
            body: `Your entry in "${entry.contest.title}" has been approved.`,
            link: entryUrl,
          })
        } else {
          await sendEntryRejectedEmail({
            to: entry.creator.email,
            creatorName: entry.creator.displayName,
            contestTitle: entry.contest.title,
            reason,
          }).catch(() => null)

          await createNotification({
            recipientClerkId: entry.creator.clerkId,
            type: 'entry_rejected',
            title: 'Your entry was not approved',
            body: reason
              ? `Your entry in "${entry.contest.title}" was rejected: ${reason}`
              : `Your entry in "${entry.contest.title}" was not approved.`,
            link: entryUrl,
          })
        }

        processed.push(entry.id)
      })
    )
  } catch (err) {
    logger.error('[POST /api/v1/admin/entries/bulk]', err)
    return NextResponse.json({ error: 'Transaction failed', details: String(err) }, { status: 500 })
  }

  return NextResponse.json(
    { processed: entries.length, errors },
    { status: 200 }
  )
}
