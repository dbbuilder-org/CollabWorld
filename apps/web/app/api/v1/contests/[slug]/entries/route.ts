import { NextRequest, NextResponse } from 'next/server'
import { db } from '@collabworld/db'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
})

interface RouteContext {
  params: { slug: string }
}

export async function GET(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)

  const parsed = querySchema.safeParse({
    page: searchParams.get('page') ?? 1,
    pageSize: searchParams.get('pageSize') ?? 20,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { page, pageSize } = parsed.data
  const skip = (page - 1) * pageSize

  try {
    const contest = await db.contest.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    })

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 })
    }

    const [items, total] = await Promise.all([
      db.contestEntry.findMany({
        where: { contestId: contest.id, status: 'approved' },
        include: {
          creator: {
            select: { displayName: true, avatarUrl: true, referralCode: true },
          },
        },
        orderBy: { compositeScore: 'desc' },
        skip,
        take: pageSize,
      }),
      db.contestEntry.count({
        where: { contestId: contest.id, status: 'approved' },
      }),
    ])

    return NextResponse.json(
      {
        items,
        total,
        page,
        pageSize,
        hasMore: skip + items.length < total,
      },
      { status: 200 }
    )
  } catch (err) {
    logger.error('[GET /api/v1/contests/[slug]/entries]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
