import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { updateEntryScoreWithCounts } from '@/lib/leaderboard'
import { createRateLimiter, checkRateLimit } from '@/lib/rateLimit'
import { redis } from '@/lib/redis'

const rateLimiter = createRateLimiter(60, '1 m')

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
      select: { id: true, status: true, contestId: true, likeCount: true },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    if (entry.status !== 'approved') {
      return NextResponse.json({ error: 'Entry must be approved to like' }, { status: 400 })
    }

    // Check if already liked
    const existing = await db.entryEngagement.findFirst({
      where: { entryId: params.id, userId: user.id, type: 'like' },
    })

    let liked: boolean

    if (existing) {
      // Unlike
      await db.entryEngagement.delete({ where: { id: existing.id } })
      liked = false
    } else {
      // Like
      await db.entryEngagement.create({
        data: { entryId: params.id, userId: user.id, type: 'like' },
      })
      liked = true
    }

    const result = await updateEntryScoreWithCounts(params.id, db, redis)

    return NextResponse.json({ liked, likeCount: result.likeCount }, { status: 200 })
  } catch (err) {
    console.error('[POST /api/v1/entries/[id]/like]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
