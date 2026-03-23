import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db, Prisma } from '@collabworld/db'
import { z } from 'zod'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'
import { generateSlug } from '@/lib/contest'

const createContestSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
  rules: z.string().optional(),
  entryDeadline: z.string().datetime(),
  votingStart: z.string().datetime(),
  votingEnd: z.string().datetime(),
  contestEnd: z.string().datetime(),
  prizes: z
    .array(
      z.object({
        rank: z.number().int().positive(),
        prizeAmount: z.number().positive(),
        description: z.string().optional(),
      })
    )
    .min(1),
  maxEntries: z.number().int().positive().optional(),
  brandSponsorId: z.string().uuid().optional(),
  assetPackageUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
})

async function getAdminUser() {
  const { userId, sessionClaims } = auth()
  if (!userId) return { userId: null, isAdminUser: false }
  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  return { userId, isAdminUser: isAdmin(role) }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId, isAdminUser } = await getAdminUser()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isAdminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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

  const data = parsed.data

  // Validate date ordering
  const entryDeadline = new Date(data.entryDeadline)
  const votingStart = new Date(data.votingStart)
  const votingEnd = new Date(data.votingEnd)
  const contestEnd = new Date(data.contestEnd)

  if (votingStart <= entryDeadline) {
    return NextResponse.json(
      { error: 'votingStart must be after entryDeadline' },
      { status: 400 }
    )
  }
  if (votingEnd <= votingStart) {
    return NextResponse.json(
      { error: 'votingEnd must be after votingStart' },
      { status: 400 }
    )
  }
  if (contestEnd <= votingEnd) {
    return NextResponse.json(
      { error: 'contestEnd must be after votingEnd' },
      { status: 400 }
    )
  }

  // Find the admin user's DB record
  try {
    const adminUser = await db.user.findUnique({ where: { clerkId: userId } })
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
    }

    // Generate unique slug
    const baseSlug = generateSlug(data.title)
    let slug = baseSlug
    let suffix = 2
    while (true) {
      const existing = await db.contest.findUnique({ where: { slug } })
      if (!existing) break
      slug = `${baseSlug}-${suffix}`
      suffix++
    }

    // Compute prize pool total
    const prizePoolTotal = data.prizes.reduce((sum, p) => sum + p.prizeAmount, 0)

    const contest = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.contest.create({
        data: {
          title: data.title,
          slug,
          description: data.description,
          rules: data.rules,
          entryDeadline,
          votingStart,
          votingEnd,
          contestEnd,
          maxEntries: data.maxEntries,
          brandSponsorId: data.brandSponsorId,
          assetPackageUrl: data.assetPackageUrl,
          thumbnailUrl: data.thumbnailUrl,
          prizePoolTotal,
          createdById: adminUser.id,
          prizes: {
            create: data.prizes.map((p) => ({
              rank: p.rank,
              prizeAmount: p.prizeAmount,
              description: p.description,
            })),
          },
        },
        include: { prizes: true },
      })
      return created
    })

    return NextResponse.json({ data: contest }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/v1/admin/contests]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { userId, isAdminUser } = await getAdminUser()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isAdminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const statusFilter = searchParams.get('status')

  try {
    const contests = await db.contest.findMany({
      where: statusFilter ? { status: statusFilter as never } : undefined,
      include: {
        prizes: true,
        _count: { select: { entries: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: contests }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/v1/admin/contests]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
