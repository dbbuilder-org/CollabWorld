import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { z } from 'zod'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'
import { sendEntryApprovedEmail, sendEntryRejectedEmail } from '@/lib/emailTriggers'
import { createNotification } from '@/lib/notify'

const patchEntrySchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reason: z.string().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
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

  const parsed = patchEntrySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const existing = await db.contestEntry.findUnique({
      where: { id: params.id },
      include: {
        creator: { select: { clerkId: true, email: true, displayName: true } },
        contest: { select: { title: true, slug: true } },
      },
    })

    if (!existing) return NextResponse.json({ error: 'Entry not found' }, { status: 404 })

    const { status, reason } = parsed.data

    const updated = await db.contestEntry.update({
      where: { id: params.id },
      data: {
        status,
        rejectionReason: status === 'rejected' ? (reason ?? null) : null,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://collabworld.io'
    const entryUrl = `${appUrl}/contests/${existing.contest.slug}/entries/${params.id}`

    if (status === 'approved') {
      await sendEntryApprovedEmail({
        to: existing.creator.email,
        creatorName: existing.creator.displayName,
        contestTitle: existing.contest.title,
        entryUrl,
      }).catch(() => {/* fire-and-forget */})

      await createNotification({
        recipientClerkId: existing.creator.clerkId,
        type: 'entry_approved',
        title: 'Your entry has been approved!',
        body: `Your entry in "${existing.contest.title}" has been approved.`,
        link: entryUrl,
      })
    } else {
      await sendEntryRejectedEmail({
        to: existing.creator.email,
        creatorName: existing.creator.displayName,
        contestTitle: existing.contest.title,
        reason,
      }).catch(() => {/* fire-and-forget */})

      await createNotification({
        recipientClerkId: existing.creator.clerkId,
        type: 'entry_rejected',
        title: 'Your entry was not approved',
        body: reason
          ? `Your entry in "${existing.contest.title}" was rejected: ${reason}`
          : `Your entry in "${existing.contest.title}" was not approved.`,
        link: entryUrl,
      })
    }

    return NextResponse.json({ data: updated }, { status: 200 })
  } catch (err) {
    console.error('[PATCH /api/v1/admin/entries/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
