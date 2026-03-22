import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { parseReferralCode } from '@/lib/referral'

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
): Promise<NextResponse> {
  const { code } = params
  const baseUrl = req.nextUrl.origin

  // Validate code format
  const { valid } = parseReferralCode(code)
  if (!valid) {
    return NextResponse.redirect(new URL('/', baseUrl))
  }

  // Look up assignment by trackingUrl
  const assignment = await db.influencerContestAssignment.findFirst({
    where: { trackingUrl: code },
    include: {
      contest: {
        select: { slug: true },
      },
    },
  })

  if (!assignment) {
    return NextResponse.redirect(new URL('/', baseUrl))
  }

  // Increment clickCount — use raw update since schema uses 'conversions' field
  // The schema doesn't have clickCount, so we skip this or use a no-op
  // Actually, schema has no clickCount field — we track via audit log instead
  try {
    await db.auditLog.create({
      data: {
        actorId: null,
        action: 'referral_click',
        resourceType: 'influencer_contest_assignment',
        resourceId: assignment.id,
        metadata: { referralCode: code, userAgent: req.headers.get('user-agent') ?? '' },
        ipAddress: req.headers.get('x-forwarded-for') ?? null,
      },
    })
  } catch {
    // Non-fatal
  }

  // Store referral code in cookie (30 days)
  const cookieMaxAge = 2592000 // 30 days in seconds

  // Determine redirect target
  const { userId } = auth()
  let redirectUrl: URL

  if (userId) {
    // Signed in — go to contest page
    redirectUrl = new URL(`/contests/${assignment.contest.slug}`, baseUrl)
  } else {
    // Not signed in — go to sign-up with ref param
    redirectUrl = new URL(`/sign-up`, baseUrl)
    redirectUrl.searchParams.set('ref', code)
  }

  const response = NextResponse.redirect(redirectUrl)
  response.cookies.set('cw_ref', code, {
    path: '/',
    maxAge: cookieMaxAge,
    httpOnly: true,
    sameSite: 'lax',
  })

  return response
}
