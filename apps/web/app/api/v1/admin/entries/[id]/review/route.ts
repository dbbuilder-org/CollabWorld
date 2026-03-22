import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { z } from 'zod'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'

const reviewSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('approve') }),
  z.object({ action: z.literal('reject'), reason: z.string().min(1) }),
])

interface RouteContext {
  params: { id: string }
}

export async function PATCH(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { userId, sessionClaims } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  if (!isAdmin(role)) {
    return NextResponse.json({ error: 'Forbidden — admin role required' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const entry = await db.contestEntry.findUnique({
      where: { id: params.id },
      select: { id: true, creatorId: true, title: true, contestId: true },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    const reviewData = parsed.data

    if (reviewData.action === 'approve') {
      const [updated] = await Promise.all([
        db.contestEntry.update({
          where: { id: params.id },
          data: { status: 'approved', rejectionReason: null },
        }),
        db.notification.create({
          data: {
            userId: entry.creatorId,
            type: 'entry_approved',
            title: 'Your entry has been approved!',
            body: `"${entry.title}" is now live in the contest.`,
            actionUrl: `/entries/${entry.id}`,
          },
        }),
      ])

      return NextResponse.json({ data: updated }, { status: 200 })
    }

    // action === 'reject'
    const [updated] = await Promise.all([
      db.contestEntry.update({
        where: { id: params.id },
        data: { status: 'rejected', rejectionReason: reviewData.reason },
      }),
      db.notification.create({
        data: {
          userId: entry.creatorId,
          type: 'entry_rejected',
          title: 'Your entry was not approved',
          body: reviewData.reason,
          actionUrl: `/entries/${entry.id}`,
        },
      }),
    ])

    return NextResponse.json({ data: updated }, { status: 200 })
  } catch (err) {
    console.error('[PATCH /api/v1/admin/entries/[id]/review]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
