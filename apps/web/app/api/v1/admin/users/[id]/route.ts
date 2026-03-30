import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { z } from 'zod'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'
import { logger } from '@/lib/logger'

const patchUserSchema = z.object({
  accountType: z
    .enum(['fan', 'creator', 'influencer', 'brand', 'admin'])
    .optional(),
  isActive: z.boolean().optional(),
})

async function getAdminUser() {
  const { userId, sessionClaims } = auth()
  if (!userId) return { userId: null, isAdminUser: false }
  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  return { userId, isAdminUser: isAdmin(role) }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { userId, isAdminUser } = await getAdminUser()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAdminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const user = await db.user.findUnique({
      where: { id: params.id },
      include: {
        creatorProfile: true,
        influencerProfile: true,
        brandProfile: true,
        entries: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            contest: { select: { id: true, title: true, slug: true } },
          },
        },
        influencerAssignments: {
          orderBy: { joinedAt: 'desc' },
          take: 10,
          include: {
            contest: { select: { id: true, title: true, slug: true } },
          },
        },
        _count: {
          select: { entries: true, engagements: true, notifications: true },
        },
      },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({ data: user }, { status: 200 })
  } catch (err) {
    logger.error('[GET /api/v1/admin/users/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { userId, isAdminUser } = await getAdminUser()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAdminUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = patchUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const existing = await db.user.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const updated = await db.user.update({
      where: { id: params.id },
      data: parsed.data,
    })

    return NextResponse.json({ data: updated }, { status: 200 })
  } catch (err) {
    logger.error('[PATCH /api/v1/admin/users/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
