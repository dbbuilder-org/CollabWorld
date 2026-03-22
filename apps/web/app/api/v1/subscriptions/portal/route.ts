import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@collabworld/db'
import { createPortalSession } from '@/lib/stripe'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: {
      brandProfile: { select: { stripeCustomerId: true } },
    },
  })

  const stripeCustomerId = user?.brandProfile?.stripeCustomerId ?? null

  if (!stripeCustomerId) {
    return NextResponse.json({ error: 'No Stripe customer found' }, { status: 400 })
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin

  const url = await createPortalSession(stripeCustomerId, `${origin}/dashboard`)

  if (!url) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  return NextResponse.json({ url })
}
