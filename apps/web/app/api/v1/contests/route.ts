import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { z } from 'zod'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'
import { generateSlug } from '@/lib/contest'
import { logger } from '@/lib/logger'

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
    const result = contests.map((c: (typeof contests)[number]) => {
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
    logger.error('[GET /api/v1/contests]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const createContestSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  entryDeadline: z.string().datetime(),
  votingStart: z.string().datetime(),
  votingEnd: z.string().datetime(),
  contestEnd: z.string().datetime(),
  maxEntries: z.number().int().positive().optional(),
  prizes: z
    .array(
      z.object({
        rank: z.number().int().positive(),
        description: z.string().optional(),
        value: z.number().min(0),
      })
    )
    .optional(),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId, sessionClaims } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  if (!isAdmin(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = createContestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { title, description, entryDeadline, votingStart, votingEnd, contestEnd, maxEntries, prizes } =
    parsed.data

  try {
    const adminUser = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    })
    if (!adminUser) return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })

    // Generate unique slug
    let slug = generateSlug(title)
    const existing = await db.contest.findUnique({ where: { slug } })
    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    const prizeTotal = prizes?.reduce((sum, p) => sum + p.value, 0) ?? 0

    const contest = await db.contest.create({
      data: {
        title,
        slug,
        description: description ?? null,
        status: 'draft',
        createdById: adminUser.id,
        entryDeadline: new Date(entryDeadline),
        votingStart: new Date(votingStart),
        votingEnd: new Date(votingEnd),
        contestEnd: new Date(contestEnd),
        maxEntries: maxEntries ?? null,
        prizePoolTotal: prizeTotal,
        prizes: prizes && prizes.length > 0
          ? {
              create: prizes.map((p) => ({
                rank: p.rank,
                prizeAmount: p.value,
                description: p.description ?? null,
              })),
            }
          : undefined,
      },
      include: { prizes: true },
    })

    return NextResponse.json({ data: contest }, { status: 201 })
  } catch (err) {
    logger.error('[POST /api/v1/contests]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
