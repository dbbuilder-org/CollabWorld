import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'

const PUBLIC_STATUSES = ['upcoming', 'active', 'voting'] as const

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)
  const statusParam = searchParams.get('status')

  // Only admins can request ?status=all
  let statusFilter: string[] | undefined

  if (statusParam === 'all') {
    const { userId, sessionClaims } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
    if (!isAdmin(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    statusFilter = undefined // return all
  } else if (statusParam) {
    // Only allow public statuses for non-admin filter
    const allowed = PUBLIC_STATUSES as readonly string[]
    if (allowed.includes(statusParam)) {
      statusFilter = [statusParam]
    } else {
      statusFilter = [...PUBLIC_STATUSES]
    }
  } else {
    statusFilter = [...PUBLIC_STATUSES]
  }

  try {
    const contests = await db.contest.findMany({
      where: statusFilter ? { status: { in: statusFilter as never[] } } : undefined,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        prizePoolTotal: true,
        thumbnailUrl: true,
        contestEnd: true,
        votingStart: true,
        votingEnd: true,
        _count: { select: { entries: true } },
      },
      orderBy: { contestEnd: 'asc' },
    })

    const now = new Date()
    const result = contests.map((c) => {
      const daysRemaining = Math.max(
        0,
        Math.ceil((c.contestEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      )
      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        status: c.status,
        prizePoolTotal: c.prizePoolTotal,
        thumbnailUrl: c.thumbnailUrl,
        entryCount: c._count.entries,
        daysRemaining,
      }
    })

    return NextResponse.json({ data: result }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/v1/contests]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
