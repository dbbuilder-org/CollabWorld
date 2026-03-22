import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const clerkUserId = session.metadata?.clerkUserId
    // Note: User model does not yet have stripeCustomerId/isPremium fields.
    // Log the event so it can be wired up after a schema migration.
    console.log('[stripe] checkout.session.completed — clerkUserId:', clerkUserId, 'customer:', session.customer)
  }

  if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    // Note: User model does not yet have stripeCustomerId/isPremium fields.
    console.log('[stripe] subscription event', event.type, 'status:', sub.status, 'customer:', sub.customer)
  }

  return NextResponse.json({ received: true })
}
