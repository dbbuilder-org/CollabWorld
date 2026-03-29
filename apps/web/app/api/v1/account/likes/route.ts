import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { z } from 'zod'

const querySchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const parsed = querySchema.safeParse({
    page:  searchParams.get('page')  ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  const { page, limit } = parsed.data
  const skip = (page - 1) * limit

  try {
    const user = await db.user.findUnique({ where: { clerkId: userId }, select: { id: true } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const [engagements, total] = await Promise.all([
      db.entryEngagement.findMany({
        where: { userId: user.id, type: 'like' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          createdAt: true,
          entry: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
              muxPlaybackId: true,
              compositeScore: true,
              likeCount: true,
              viewCount: true,
              createdAt: true,
              contest: { select: { id: true, title: true, slug: true } },
              creator: { select: { id: true, displayName: true, avatarUrl: true } },
            },
          },
        },
      }),
      db.entryEngagement.count({ where: { userId: user.id, type: 'like' } }),
    ])

    return NextResponse.json(
      {
        data: engagements.map((e) => e.entry),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('[GET /api/v1/account/likes]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
