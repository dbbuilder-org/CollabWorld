import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { getRoleFromMetadata } from '@/lib/auth'
import { createReferralLink } from '@/lib/referral'
import { logger } from '@/lib/logger'

function getInfluencerUser() {
  const { userId, sessionClaims } = auth()
  if (!userId) return { userId: null, isInfluencer: false }
  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  return { userId, isInfluencer: role === 'influencer' }
}

export async function GET(_req: NextRequest): Promise<NextResponse> {
  const { userId, isInfluencer } = getInfluencerUser()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isInfluencer) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const user = await db.user.findUnique({ where: { clerkId: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const assignments = await db.influencerContestAssignment.findMany({
      where: { influencerId: user.id },
      include: {
        contest: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            entryDeadline: true,
            votingStart: true,
            votingEnd: true,
            contestEnd: true,
            thumbnailUrl: true,
            prizePoolTotal: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://collabworld.io'

    const enriched = assignments.map((a: (typeof assignments)[number]) => ({
      ...a,
      referralLink: createReferralLink(a.trackingUrl, baseUrl),
      estimatedEarnings: a.totalEarned,
    }))

    return NextResponse.json({ data: enriched }, { status: 200 })
  } catch (err) {
    logger.error('[GET /api/v1/influencers/my-assignments]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
