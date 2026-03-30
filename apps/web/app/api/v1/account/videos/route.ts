import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const querySchema = z.object({
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(['pending', 'approved', 'rejected', 'winner', 'all']).default('all'),
})

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const parsed = querySchema.safeParse({
    page:   searchParams.get('page')   ?? undefined,
    limit:  searchParams.get('limit')  ?? undefined,
    status: searchParams.get('status') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  const { page, limit, status } = parsed.data
  const skip = (page - 1) * limit

  try {
    const user = await db.user.findUnique({ where: { clerkId: userId }, select: { id: true } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const where = {
      creatorId: user.id,
      ...(status !== 'all' ? { status: status as 'pending' | 'approved' | 'rejected' | 'winner' } : {}),
    }

    const [entries, total] = await Promise.all([
      db.contestEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          rejectionReason: true,
          muxPlaybackId: true,
          thumbnailUrl: true,
          voteCount: true,
          likeCount: true,
          commentCount: true,
          shareCount: true,
          viewCount: true,
          compositeScore: true,
          isPrivate: true,
          createdAt: true,
          contest: { select: { id: true, title: true, slug: true, status: true } },
        },
      }),
      db.contestEntry.count({ where }),
    ])

    return NextResponse.json(
      {
        data: entries,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
      { status: 200 }
    )
  } catch (err) {
    logger.error('[GET /api/v1/account/videos]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
