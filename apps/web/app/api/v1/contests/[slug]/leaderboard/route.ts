import { NextRequest, NextResponse } from 'next/server'
import { db } from '@collabworld/db'
import { getContestLeaderboard, type TimeFilter } from '@/lib/leaderboard'
import { redis } from '@/lib/redis'

interface RouteContext {
  params: { slug: string }
}

export async function GET(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const timeFilterParam = req.nextUrl.searchParams.get('timeFilter')
  const timeFilter: TimeFilter =
    timeFilterParam === 'today' ? 'today' :
    timeFilterParam === 'week'  ? 'week'  :
    'all'

  try {
    const contest = await db.contest.findUnique({
      where: { slug: params.slug },
      select: { id: true, title: true, slug: true, status: true },
    })

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 })
    }

    const entries = await getContestLeaderboard(contest.id, db, redis, timeFilter)

    return NextResponse.json(
      {
        contestId: contest.id,
        contestTitle: contest.title,
        entries,
        updatedAt: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    )
  } catch (err) {
    console.error('[GET /api/v1/contests/[slug]/leaderboard]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
