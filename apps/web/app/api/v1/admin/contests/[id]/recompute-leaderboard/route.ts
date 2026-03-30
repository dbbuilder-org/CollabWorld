import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'
import { updateEntryScore } from '@/lib/leaderboard'
import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'

interface RouteContext {
  params: { id: string }
}

export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { userId, sessionClaims } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  if (!isAdmin(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const contest = await db.contest.findUnique({
      where: { id: params.id },
      select: { id: true, title: true },
    })

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 })
    }

    const entries = await db.contestEntry.findMany({
      where: { contestId: params.id },
      select: { id: true },
    })

    const results = await Promise.allSettled(
      entries.map((entry: (typeof entries)[number]) => updateEntryScore(entry.id, db, redis))
    )

    const succeeded = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return NextResponse.json({
      contestId: params.id,
      entriesRecomputed: succeeded,
      errors: failed,
    })
  } catch (err) {
    logger.error('[POST /api/v1/admin/contests/[id]/recompute-leaderboard]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
