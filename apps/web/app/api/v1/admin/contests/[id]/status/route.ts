import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { z } from 'zod'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'
import { canTransition } from '@/lib/contest'
import type { ContestStatus } from '@/lib/contest'
import { sendContestGoLiveEmail, sendVotingOpenEmail } from '@/lib/emailTriggers'

const patchStatusSchema = z.object({
  status: z.enum(['draft', 'upcoming', 'active', 'voting', 'completed', 'archived']),
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

  const parsed = patchStatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const existing = await db.contest.findUnique({
      where: { id: params.id },
      include: {
        entries: {
          include: { creator: { select: { email: true, displayName: true } } },
        },
      },
    })
    if (!existing) return NextResponse.json({ error: 'Contest not found' }, { status: 404 })

    const from = existing.status as ContestStatus
    const to = parsed.data.status as ContestStatus

    if (!canTransition(from, to)) {
      return NextResponse.json(
        { error: `Cannot transition from ${from} to ${to}` },
        { status: 400 }
      )
    }

    const updated = await db.contest.update({
      where: { id: params.id },
      data: { status: to },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://collabworld.io'
    const contestUrl = `${appUrl}/contests/${existing.slug}`

    // Send emails for relevant transitions
    if (to === 'active') {
      await sendContestGoLiveEmail({
        to: '',  // Would normally be brand sponsor email; skip if missing
        contestTitle: existing.title,
        contestUrl,
        endsAt: existing.contestEnd.toISOString().split('T')[0],
      }).catch(() => {/* fire-and-forget */})
    }

    if (to === 'voting') {
      const creatorEmails = existing.entries
        .map((e) => e.creator.email)
        .filter(Boolean)

      if (creatorEmails.length > 0) {
        await sendVotingOpenEmail({
          to: creatorEmails,
          contestTitle: existing.title,
          votingUrl: `${contestUrl}/vote`,
          endsAt: existing.votingEnd.toISOString().split('T')[0],
        }).catch(() => {/* fire-and-forget */})
      }
    }

    return NextResponse.json({ data: updated }, { status: 200 })
  } catch (err) {
    console.error('[PATCH /api/v1/admin/contests/[id]/status]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
