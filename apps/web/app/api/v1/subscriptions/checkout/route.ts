import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createCheckoutSession, PREMIUM_PRICE_ID } from '@/lib/stripe'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ''

  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin

  const url = await createCheckoutSession({
    clerkUserId: userId,
    email,
    priceId: PREMIUM_PRICE_ID,
    successUrl: `${origin}/dashboard?upgraded=1`,
    cancelUrl: `${origin}/pricing`,
  })

  if (!url) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  return NextResponse.json({ url })
}
