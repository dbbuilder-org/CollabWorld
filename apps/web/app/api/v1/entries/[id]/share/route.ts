import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { updateEntryScore } from '@/lib/leaderboard'
import { createRateLimiter, checkRateLimit } from '@/lib/rateLimit'
import { redis } from '@/lib/redis'

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
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, referralCode: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const entry = await db.contestEntry.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        status: true,
        contestId: true,
        contest: { select: { slug: true } },
      },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    // Create share engagement
    await db.entryEngagement.create({
      data: { entryId: params.id, userId: user.id, type: 'share' },
    })

    await updateEntryScore(params.id, db, redis)

    const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'
    const shareUrl = `${appUrl}/contests/${entry.contest.slug}/entries/${entry.id}?ref=${user.referralCode ?? ''}&utm_source=collabworld&utm_medium=share`

    return NextResponse.json({ shareUrl }, { status: 200 })
  } catch (err) {
    console.error('[POST /api/v1/entries/[id]/share]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
