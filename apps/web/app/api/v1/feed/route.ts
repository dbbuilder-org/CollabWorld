import { NextRequest, NextResponse } from 'next/server'
import { db } from '@collabworld/db'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const querySchema = z.object({
  sort:   z.enum(['trending', 'top', 'new']).default('trending'),
  search: z.string().max(100).optional(),
  page:   z.coerce.number().int().min(1).default(1),
  limit:  z.coerce.number().int().min(1).max(50).default(20),
})

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl
  const parsed = querySchema.safeParse({
    sort:   searchParams.get('sort')   ?? undefined,
    search: searchParams.get('search') ?? undefined,
    page:   searchParams.get('page')   ?? undefined,
    limit:  searchParams.get('limit')  ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid params', details: parsed.error.flatten() }, { status: 400 })
  }

  const { sort, search, page, limit } = parsed.data
  const skip = (page - 1) * limit

  const orderBy =
    sort === 'trending' ? { compositeScore: 'desc' as const } :
    sort === 'top'      ? { likeCount: 'desc' as const } :
                          { createdAt: 'desc' as const }

  try {
    const where = {
      status: 'approved' as const,
      isPrivate: false,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
              { creator: { displayName: { contains: search, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    }

    const [entries, total] = await Promise.all([
      db.contestEntry.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          creator: { select: { id: true, displayName: true, avatarUrl: true, accountType: true } },
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
    logger.error('[GET /api/v1/feed]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
