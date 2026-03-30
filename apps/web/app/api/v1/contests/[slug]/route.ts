import { NextRequest, NextResponse } from 'next/server'
import { db } from '@collabworld/db'
import { logger } from '@/lib/logger'

const HIDDEN_STATUSES = ['draft', 'archived']

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
): Promise<NextResponse> {
  try {
    const contest = await db.contest.findUnique({
      where: { slug: params.slug },
      include: {
        prizes: { orderBy: { rank: 'asc' } },
        brandSponsor: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
        _count: {
          select: {
            entries: true,
            influencerAssignments: true,
          },
        },
      },
    })

    if (!contest || HIDDEN_STATUSES.includes(contest.status)) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 })
    }

    const now = new Date()
    const daysRemaining = Math.max(
      0,
      Math.ceil((contest.contestEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    )

    return NextResponse.json(
      {
        data: {
          ...contest,
          entryCount: contest._count.entries,
          influencerCount: contest._count.influencerAssignments,
          daysRemaining,
        },
      },
      { status: 200 }
    )
  } catch (err) {
    logger.error('[GET /api/v1/contests/[slug]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
