import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { z } from 'zod'
import { getRoleFromMetadata, isAdmin } from '@/lib/auth'
import { generateReferralCode } from '@/lib/referral'

const inviteInfluencerSchema = z.object({
  influencerClerkId: z.string().min(1),
  commissionRate: z.number().min(0).max(1).optional(),
})

function getAdminUser() {
  const { userId, sessionClaims } = auth()
  if (!userId) return { userId: null, isAdminUser: false }
  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  return { userId, isAdminUser: isAdmin(role) }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { userId, isAdminUser } = getAdminUser()
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

  const parsed = inviteInfluencerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { influencerClerkId, commissionRate = 0.1 } = parsed.data

  try {
    // Verify contest exists
    const contest = await db.contest.findUnique({ where: { id: params.id } })
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 })
    }

    // Verify influencer user exists
    const influencer = await db.user.findUnique({ where: { clerkId: influencerClerkId } })
    if (!influencer) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 })
    }

    // Generate unique referral/tracking code
    const referralCode = generateReferralCode(influencerClerkId, params.id)

    // Check for existing assignment
    const existing = await db.influencerContestAssignment.findUnique({
      where: { contestId_influencerId: { contestId: params.id, influencerId: influencer.id } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Influencer already assigned to this contest' }, { status: 409 })
    }

    const assignment = await db.influencerContestAssignment.create({
      data: {
        contestId: params.id,
        influencerId: influencer.id,
        status: 'invited',
        commissionRate,
        trackingUrl: referralCode,
      },
    })

    return NextResponse.json({ data: assignment }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/v1/admin/contests/[id]/influencers]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { userId, isAdminUser } = getAdminUser()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isAdminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const contest = await db.contest.findUnique({ where: { id: params.id } })
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 })
    }

    const assignments = await db.influencerContestAssignment.findMany({
      where: { contestId: params.id },
      include: {
        influencer: {
          select: {
            id: true,
            clerkId: true,
            email: true,
            displayName: true,
            avatarUrl: true,
            influencerProfile: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    })

    return NextResponse.json({ data: assignments }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/v1/admin/contests/[id]/influencers]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
