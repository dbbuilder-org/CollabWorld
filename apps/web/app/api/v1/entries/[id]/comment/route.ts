import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { z } from 'zod'
import { updateEntryScore } from '@/lib/leaderboard'
import { createRateLimiter, checkRateLimit } from '@/lib/rateLimit'
import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'

const rateLimiter = createRateLimiter(10, '1 m')

const PROFANITY_LIST = ['spam', 'scam']

const commentSchema = z.object({
  content: z.string().min(1).max(500),
})

interface RouteContext {
  params: { id: string }
}

function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase()
  return PROFANITY_LIST.some((word) => lower.includes(word))
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

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = commentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Content must be between 1 and 500 characters' },
      { status: 400 }
    )
  }

  if (containsProfanity(parsed.data.content)) {
    return NextResponse.json(
      { error: 'Comment contains inappropriate content' },
      { status: 400 }
    )
  }

  try {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, displayName: true, avatarUrl: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const entry = await db.contestEntry.findUnique({
      where: { id: params.id },
      select: { id: true, status: true, contestId: true },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    if (entry.status !== 'approved') {
      return NextResponse.json({ error: 'Entry must be approved to comment' }, { status: 400 })
    }

    const engagement = await db.entryEngagement.create({
      data: {
        entryId: params.id,
        userId: user.id,
        type: 'comment',
        content: parsed.data.content,
      },
    })

    await updateEntryScore(params.id, db, redis)

    return NextResponse.json(
      {
        id: engagement.id,
        content: parsed.data.content,
        createdAt: engagement.createdAt,
        user: {
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
        },
      },
      { status: 201 }
    )
  } catch (err) {
    logger.error('[POST /api/v1/entries/[id]/comment]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)
  const offset = parseInt(searchParams.get('offset') ?? '0', 10)

  try {
    const [items, total] = await Promise.all([
      db.entryEngagement.findMany({
        where: { entryId: params.id, type: 'comment' },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: { displayName: true, avatarUrl: true },
          },
        },
      }),
      db.entryEngagement.count({
        where: { entryId: params.id, type: 'comment' },
      }),
    ])

    return NextResponse.json({
      items,
      total,
      hasMore: offset + limit < total,
    })
  } catch (err) {
    logger.error('[GET /api/v1/entries/[id]/comment]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
