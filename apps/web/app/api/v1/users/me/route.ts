import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const patchSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional().nullable(),
  socialLinks: z.record(z.string(), z.string()).optional(),
})

export async function GET(_req: NextRequest): Promise<NextResponse> {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        creatorProfile: true,
        influencerProfile: true,
        brandProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ data: user }, { status: 200 })
  } catch (err) {
    logger.error('[GET /api/v1/users/me]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
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
    const updated = await db.user.update({
      where: { clerkId: userId },
      data: parsed.data,
    })
    return NextResponse.json({ data: updated }, { status: 200 })
  } catch (err) {
    logger.error('[PATCH /api/v1/users/me]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
