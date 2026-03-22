import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { getRoleFromMetadata } from '@/lib/auth'

function getInfluencerUser() {
  const { userId, sessionClaims } = auth()
  if (!userId) return { userId: null, isInfluencer: false }
  const role = getRoleFromMetadata(sessionClaims?.['publicMetadata'])
  return { userId, isInfluencer: role === 'influencer' }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { userId, isInfluencer } = getInfluencerUser()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isInfluencer) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    // Find the current user in DB
    const user = await db.user.findUnique({ where: { clerkId: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find the assignment
    const assignment = await db.influencerContestAssignment.findUnique({
      where: { id: params.id },
    })
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Verify the assignment belongs to the current user
    if (assignment.influencerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Only invited/agreement_pending assignments can be signed
    if (assignment.status !== 'invited' && assignment.status !== 'agreement_pending') {
      return NextResponse.json(
        { error: `Cannot sign agreement for assignment with status: ${assignment.status}` },
        { status: 409 }
      )
    }

    const updated = await db.influencerContestAssignment.update({
      where: { id: params.id },
      data: {
        status: 'active',
        agreementSignedAt: new Date(),
      },
    })

    return NextResponse.json({ data: updated }, { status: 200 })
  } catch (err) {
    console.error('[POST /api/v1/influencers/assignments/[id]/sign]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
