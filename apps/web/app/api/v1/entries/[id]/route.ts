import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { z } from 'zod'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
})

interface RouteContext {
  params: { id: string }
}

export async function GET(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { userId, sessionClaims } = auth()

  try {
    const entry = await db.contestEntry.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: { id: true, displayName: true, avatarUrl: true, referralCode: true },
        },
        contest: {
          select: { id: true, title: true, slug: true, status: true },
        },
      },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    // Public access for approved entries
    if (entry.status === 'approved') {
      return NextResponse.json({ data: entry }, { status: 200 })
    }

    // Non-approved entries: owner or admin only
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
    const user = await db.user.findUnique({ where: { clerkId: userId }, select: { id: true } })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isOwner = entry.creatorId === user.id
    if (!isOwner && !isAdmin(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ data: entry }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/v1/entries/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  try {
    const entry = await db.contestEntry.findUnique({
      where: { id: params.id },
      include: {
        creator: { select: { id: true } },
      },
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    const user = await db.user.findUnique({ where: { clerkId: userId }, select: { id: true } })
    if (!user || entry.creatorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (entry.status === 'approved') {
      return NextResponse.json(
        { error: 'Entry already approved, cannot be edited' },
        { status: 400 }
      )
    }

    const updated = await db.contestEntry.update({
      where: { id: params.id },
      data: parsed.data,
    })

    return NextResponse.json({ data: updated }, { status: 200 })
  } catch (err) {
    console.error('[PATCH /api/v1/entries/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
