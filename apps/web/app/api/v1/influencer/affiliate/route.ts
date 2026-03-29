import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, accountType: true },
    })

    if (!user || user.accountType !== 'influencer') {
      return NextResponse.json({ error: 'Influencer account required' }, { status: 403 })
    }

    const assignments = await db.influencerContestAssignment.findMany({
      where: {
        influencerId: user.id,
        status: { in: ['active', 'agreement_pending'] },
      },
      orderBy: { joinedAt: 'desc' },
      include: {
        contest: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            thumbnailUrl: true,
            contestEnd: true,
          },
        },
      },
    })

    const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'

    return NextResponse.json({
      data: assignments.map((a) => ({
        id: a.id,
        status: a.status,
        trackingUrl: a.trackingUrl,
        affiliateLink: `${appUrl}/ref/${a.trackingUrl}`,
        commissionRate: a.commissionRate,
        conversions: a.conversions,
        totalEarned: a.totalEarned,
        contest: a.contest,
      })),
    })
  } catch (err) {
    console.error('[GET /api/v1/influencer/affiliate]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
