import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@collabworld/db'
import Stripe from 'stripe'

export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || '')
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const clerkUserId = session.metadata?.clerkUserId
      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id

      if (clerkUserId && customerId) {
        await db.user.update({
          where: { clerkId: clerkUserId },
          data: {
            stripeCustomerId: customerId,
            subscriptionPlan: 'premium',
            subscriptionStatus: 'active',
          },
        })
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object as Stripe.Subscription
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
      const status = sub.status as 'active' | 'past_due' | 'trialing'

      await db.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          subscriptionStatus: status,
          subscriptionPlan: ['active', 'trialing'].includes(sub.status) ? 'premium' : 'free',
        },
      })
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id

      await db.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          subscriptionPlan: 'free',
          subscriptionStatus: 'cancelled',
        },
      })
    }
  } catch (err) {
    console.error('[stripe webhook] DB update failed:', err)
    // Still return 200 to prevent Stripe retrying non-DB errors
  }

  return NextResponse.json({ received: true })
}
