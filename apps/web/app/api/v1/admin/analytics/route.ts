import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'
import { logger } from '@/lib/logger'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { userId, sessionClaims } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  if (!isAdmin(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')
  const contestId = searchParams.get('contestId') ?? undefined

  const from = fromParam ? new Date(fromParam) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const to = toParam ? new Date(toParam) : new Date()

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })
  }

  try {
    const entryWhere: Record<string, unknown> = {
      createdAt: { gte: from, lte: to },
    }
    if (contestId) entryWhere['contestId'] = contestId

    const engagementWhere: Record<string, unknown> = {
      createdAt: { gte: from, lte: to },
    }

    // Registrations over time (group by day)
    const registrationsRaw = await db.user.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const registrationsByDay = groupByDay(registrationsRaw.map((r: (typeof registrationsRaw)[number]) => r.createdAt))

    // Entries over time
    const entriesRaw = await db.contestEntry.findMany({
      where: entryWhere,
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const entriesByDay = groupByDay(entriesRaw.map((e: (typeof entriesRaw)[number]) => e.createdAt))

    // Engagement by type
    const engagementsByType = await db.entryEngagement.groupBy({
      by: ['type'],
      where: engagementWhere,
      _count: { type: true },
    })

    // Top contests by engagement
    const topContests = await db.contest.findMany({
      where: {
        entries: {
          some: {
            engagements: { some: { createdAt: { gte: from, lte: to } } },
          },
        },
      },
      include: {
        _count: { select: { entries: true } },
        entries: {
          include: {
            _count: { select: { engagements: true } },
          },
        },
      },
      take: 10,
    })

    const topContestsSummary = topContests
      .map((c: (typeof topContests)[number]) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        status: c.status,
        entryCount: c._count.entries,
        totalEngagements: c.entries.reduce((sum: number, e: (typeof c.entries)[number]) => sum + e._count.engagements, 0),
      }))
      .sort((a: { totalEngagements: number }, b: { totalEngagements: number }) => b.totalEngagements - a.totalEngagements)
      .slice(0, 10)

    // Top creators by composite score
    const topCreators = await db.contestEntry.groupBy({
      by: ['creatorId'],
      where: entryWhere,
      _sum: { compositeScore: true },
      _count: { id: true },
      orderBy: { _sum: { compositeScore: 'desc' } },
      take: 10,
    })

    const creatorIds = topCreators.map((c: (typeof topCreators)[number]) => c.creatorId)
    const creators = await db.user.findMany({
      where: { id: { in: creatorIds } },
      select: { id: true, displayName: true, email: true },
    })

    const creatorMap = new Map(creators.map((c: (typeof creators)[number]) => [c.id, c]))
    const topCreatorsSummary = topCreators.map((tc: (typeof topCreators)[number]) => ({
      ...(creatorMap.get(tc.creatorId) ?? {}),
      totalScore: Number(tc._sum.compositeScore ?? 0),
      entryCount: tc._count.id,
    }))

    return NextResponse.json(
      {
        data: {
          registrationsByDay,
          entriesByDay,
          engagementByType: engagementsByType.map((e: (typeof engagementsByType)[number]) => ({
            type: e.type,
            count: e._count.type,
          })),
          topContests: topContestsSummary,
          topCreators: topCreatorsSummary,
          range: { from: from.toISOString(), to: to.toISOString() },
        },
      },
      { status: 200 }
    )
  } catch (err) {
    logger.error('[GET /api/v1/admin/analytics]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function groupByDay(dates: Date[]): Array<{ date: string; count: number }> {
  const map = new Map<string, number>()
  for (const d of dates) {
    const key = d.toISOString().split('T')[0] ?? d.toISOString().substring(0, 10)
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))
}
