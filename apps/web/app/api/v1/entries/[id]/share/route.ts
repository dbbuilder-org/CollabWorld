import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { updateEntryScore } from '@/lib/leaderboard'
import { createRateLimiter, checkRateLimit } from '@/lib/rateLimit'
import { redis } from '@/lib/redis'
import { randomBytes } from 'crypto'
import { logger } from '@/lib/logger'

const rateLimiter = createRateLimiter(30, '1 m')

interface RouteContext {
  params: { id: string }
}

function generateShareCode(): string {
  return randomBytes(4).toString('hex') // 8 hex chars
}

export async function POST(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { userId } = auth()

  let platform: string | undefined
  try {
    const body = await req.json().catch(() => ({}))
    platform = typeof body?.platform === 'string' ? body.platform : undefined
  } catch {
    // no body is fine
  }

  try {
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

    // Rate limit for authenticated users
    if (userId) {
      const { success: rateLimitOk } = await checkRateLimit(rateLimiter, userId)
      if (!rateLimitOk) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
      }

      const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { id: true },
      })

      if (user) {
        await db.entryEngagement.create({
          data: { entryId: params.id, userId: user.id, type: 'share' },
        })
        await updateEntryScore(params.id, db, redis)
      }
    }

    // Generate short share code
    const code = generateShareCode()
    const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'

    await db.shareCode.create({
      data: {
        code,
        entryId: params.id,
        userId: userId
          ? (await db.user.findUnique({ where: { clerkId: userId }, select: { id: true } }))?.id
          : undefined,
        platform: platform ?? null,
      },
    })

    const shareUrl = `${appUrl}/s/${code}`

    return NextResponse.json({ shareUrl, code }, { status: 200 })
  } catch (err) {
    logger.error('[POST /api/v1/entries/[id]/share]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
