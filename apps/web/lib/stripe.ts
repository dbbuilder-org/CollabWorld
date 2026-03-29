import Stripe from 'stripe'

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' })
  : null

export const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID || ''

export async function createCheckoutSession(opts: {
  customerId?: string
  clerkUserId: string
  email: string
  priceId: string
  successUrl: string
  cancelUrl: string
}): Promise<string | null> {
  if (!stripe) return null
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: opts.customerId,
    customer_email: opts.customerId ? undefined : opts.email,
    line_items: [{ price: opts.priceId, quantity: 1 }],
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    metadata: { clerkUserId: opts.clerkUserId },
  })
  return session.url
}

export async function createPortalSession(customerId: string, returnUrl: string): Promise<string | null> {
  if (!stripe) return null
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
  return session.url
}

export async function getSubscriptionStatus(stripeCustomerId: string): Promise<'active' | 'past_due' | 'canceled' | 'none'> {
  if (!stripe) return 'none'
  const subs = await stripe.subscriptions.list({ customer: stripeCustomerId, limit: 1, status: 'all' })
  const sub = subs.data[0]
  if (!sub) return 'none'
  return sub.status as 'active' | 'past_due' | 'canceled'
}
