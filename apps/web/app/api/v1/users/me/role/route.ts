import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { z } from 'zod'
import type { AccountType } from '@collabworld/types'
import { logger } from '@/lib/logger'

const roleSchema = z.object({
  role: z.enum(['fan', 'creator', 'influencer', 'brand']),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
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

  const parsed = roleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid role', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { role } = parsed.data

  try {
    // Update Clerk publicMetadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    })

    // Update DB user
    const user = await db.user.update({
      where: { clerkId: userId },
      data: { accountType: role as AccountType },
    })

    // Create role-specific profile if needed
    const profileData = { userId: user.id }
    if (role === 'creator') {
      await db.creatorProfile.upsert({
        where: { userId: user.id },
        create: { ...profileData, genre: [] },
        update: {},
      })
    } else if (role === 'influencer') {
      await db.influencerProfile.upsert({
        where: { userId: user.id },
        create: profileData,
        update: {},
      })
    } else if (role === 'brand') {
      await db.brandProfile.upsert({
        where: { userId: user.id },
        create: { ...profileData, companyName: '' },
        update: {},
      })
    }

    return NextResponse.json({ data: { role } }, { status: 200 })
  } catch (err) {
    logger.error('[POST /api/v1/users/me/role]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
