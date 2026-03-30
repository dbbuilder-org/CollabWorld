import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { updateEntryScoreWithCounts } from '@/lib/leaderboard'
import { createRateLimiter, checkRateLimit } from '@/lib/rateLimit'
import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'

const rateLimiter = createRateLimiter(30, '1 m')

interface RouteContext {
  params: { id: string }
}

export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit check
  const { success: rateLimitOk } = await checkRateLimit(rateLimiter, userId)
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const user = await db.user.findUnique({ where: { clerkId: userId }, select: { id: true } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const entry = await db.contestEntry.findUnique({
      where: { id: params.id },
      select: { id: true, status: true, contestId: true, voteCount: true, contest: { select: { id: true, status: true } } },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    if (entry.status !== 'approved') {
      return NextResponse.json({ error: 'Entry must be approved to vote' }, { status: 400 })
    }

    if (entry.contest.status !== 'voting') {
      return NextResponse.json(
        { error: 'Contest must be in voting status to cast a vote' },
        { status: 400 }
      )
    }

    // Check if user already voted in this contest
    // Find any vote engagement for any entry in this contest by this user
    const existingVote = await db.entryEngagement.findFirst({
      where: {
        userId: user.id,
        type: 'vote',
        entry: { contestId: entry.contestId },
      },
    })

    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted in this contest' },
        { status: 409 }
      )
    }

    // Create vote engagement
    await db.entryEngagement.create({
      data: { entryId: params.id, userId: user.id, type: 'vote' },
    })

    const result = await updateEntryScoreWithCounts(params.id, db, redis)

    return NextResponse.json({ voted: true, voteCount: result.voteCount }, { status: 201 })
  } catch (err) {
    logger.error('[POST /api/v1/entries/[id]/vote]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
