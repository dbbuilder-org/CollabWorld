import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { z } from 'zod'
import { getRoleFromMetadata } from '@/lib/auth'
import { logger } from '@/lib/logger'

const creatorSchema = z.object({
  genre: z.array(z.string()).optional(),
  portfolioUrl: z.string().url().optional().nullable(),
  imdbUrl: z.string().url().optional().nullable(),
  spotifyUrl: z.string().url().optional().nullable(),
})

const INFLUENCER_TIERS = ['nano', 'micro', 'mid_tier', 'macro', 'mega'] as const

const influencerSchema = z.object({
  platformHandles: z.record(z.string(), z.string()).optional(),
  totalFollowers: z.number().int().min(0).optional(),
  engagementRate: z.number().min(0).max(100).optional(),
  tier: z.enum(INFLUENCER_TIERS).optional(),
})

const brandSchema = z.object({
  companyName: z.string().min(1).max(200),
  website: z.string().url().optional().nullable(),
  contactName: z.string().max(100).optional().nullable(),
  contactPhone: z.string().max(50).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
})

const fanSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional().nullable(),
})

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const { userId, sessionClaims } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])

  if (!role) {
    return NextResponse.json({ error: 'Role not set. Complete onboarding first.' }, { status: 422 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    const user = await db.user.findUnique({ where: { clerkId: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (role === 'creator') {
      const parsed = creatorSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
      }
      const profile = await db.creatorProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, genre: parsed.data.genre ?? [], ...parsed.data },
        update: parsed.data,
      })
      return NextResponse.json({ data: profile }, { status: 200 })
    }

    if (role === 'influencer') {
      const parsed = influencerSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
      }
      const profile = await db.influencerProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, ...parsed.data },
        update: parsed.data,
      })
      return NextResponse.json({ data: profile }, { status: 200 })
    }

    if (role === 'brand') {
      const parsed = brandSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
      }
      const profile = await db.brandProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, ...parsed.data },
        update: parsed.data,
      })
      return NextResponse.json({ data: profile }, { status: 200 })
    }

    if (role === 'fan') {
      const parsed = fanSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
      }
      const updated = await db.user.update({
        where: { id: user.id },
        data: parsed.data,
      })
      return NextResponse.json({ data: updated }, { status: 200 })
    }

    return NextResponse.json({ error: 'Unsupported role' }, { status: 422 })
  } catch (err) {
    logger.error('[PATCH /api/v1/users/me/profile]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
