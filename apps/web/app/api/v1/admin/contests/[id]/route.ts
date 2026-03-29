import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { z } from 'zod'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'
import { canTransition } from '@/lib/contest'
import type { ContestStatus } from '@/lib/contest'
import { snapshotLeaderboard } from '@/lib/leaderboard'

const patchContestSchema = z.object({
  status: z
    .enum(['draft', 'upcoming', 'active', 'voting', 'completed', 'archived'])
    .optional(),
  title: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  rules: z.string().optional(),
  entryDeadline: z.string().datetime().optional(),
  votingStart: z.string().datetime().optional(),
  votingEnd: z.string().datetime().optional(),
  contestEnd: z.string().datetime().optional(),
  thumbnailUrl: z.string().url().optional().nullable(),
  assetPackageUrl: z.string().url().optional().nullable(),
  maxEntries: z.number().int().positive().optional().nullable(),
})

async function getAdminUser() {
  const { userId, sessionClaims } = auth()
  if (!userId) return { userId: null, isAdminUser: false }
  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  return { userId, isAdminUser: isAdmin(role) }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { userId, isAdminUser } = await getAdminUser()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isAdminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = patchContestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const existing = await db.contest.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 })
    }

    // Validate status transition if status is being changed
    if (parsed.data.status) {
      const from = existing.status as ContestStatus
      const to = parsed.data.status as ContestStatus
      if (!canTransition(from, to)) {
        return NextResponse.json(
          { error: `Cannot transition from ${from} to ${to}` },
          { status: 400 }
        )
      }

      // Fire-and-forget notification when contest goes active
      if (to === 'active') {
        import('@/lib/notify').then(({ createNotification }) => {
          // Notify the sponsor
          if (existing.brandSponsorId) {
            db.user.findUnique({ where: { id: existing.brandSponsorId }, select: { clerkId: true } })
              .then((sponsor) => {
                if (sponsor?.clerkId) {
                  createNotification({
                    recipientClerkId: sponsor.clerkId,
                    type: 'contest_active',
                    title: 'Your contest is live!',
                    body: `"${existing.title}" is now accepting entries.`,
                    link: `/contests/${existing.slug}`,
                  })
                }
              })
              .catch(() => {})
          }
        }).catch(() => {})
      }

      // Snapshot leaderboard when transitioning to completed
      if (to === 'completed') {
        try {
          await snapshotLeaderboard(params.id, db)
        } catch (snapshotErr) {
          console.error('[snapshotLeaderboard]', snapshotErr)
          // Non-fatal — proceed with status update
        }
      }
    }

    const { status, ...rest } = parsed.data
    const updateData: Record<string, unknown> = { ...rest }
    if (status) updateData['status'] = status
    if (rest.entryDeadline) updateData['entryDeadline'] = new Date(rest.entryDeadline)
    if (rest.votingStart) updateData['votingStart'] = new Date(rest.votingStart)
    if (rest.votingEnd) updateData['votingEnd'] = new Date(rest.votingEnd)
    if (rest.contestEnd) updateData['contestEnd'] = new Date(rest.contestEnd)

    const updated = await db.contest.update({
      where: { id: params.id },
      data: updateData,
      include: { prizes: true },
    })

    return NextResponse.json({ data: updated }, { status: 200 })
  } catch (err) {
    console.error('[PATCH /api/v1/admin/contests/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
