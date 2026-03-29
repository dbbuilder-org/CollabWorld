import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Stripe mock ──────────────────────────────────────────────────────────────
const mockCheckoutCreate = vi.fn()
const mockPortalCreate = vi.fn()
const mockSubscriptionsList = vi.fn()
const mockConstructEvent = vi.fn()

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    checkout: { sessions: { create: mockCheckoutCreate } },
    billingPortal: { sessions: { create: mockPortalCreate } },
    subscriptions: { list: mockSubscriptionsList },
    webhooks: { constructEvent: mockConstructEvent },
  })),
}))

// ── Module-level helpers ─────────────────────────────────────────────────────
async function getStripeModule() {
  const mod = await import('@/lib/stripe')
  return mod
}

describe('stripe.ts', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  describe('createCheckoutSession', () => {
    it('returns null when stripe is not configured', async () => {
      delete process.env.STRIPE_SECRET_KEY
      const { createCheckoutSession } = await getStripeModule()
      const result = await createCheckoutSession({
        clerkUserId: 'user_123',
        email: 'test@example.com',
        priceId: 'price_123',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      })
      expect(result).toBeNull()
    })

    it('returns session URL when stripe is configured', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'
      const { createCheckoutSession } = await getStripeModule()
      mockCheckoutCreate.mockResolvedValueOnce({ url: 'https://checkout.stripe.com/pay/cs_test_abc' })
      const result = await createCheckoutSession({
        clerkUserId: 'user_123',
        email: 'test@example.com',
        priceId: 'price_123',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      })
      expect(result).toBe('https://checkout.stripe.com/pay/cs_test_abc')
    })

    it('passes customerId when provided', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'
      const { createCheckoutSession } = await getStripeModule()
      mockCheckoutCreate.mockResolvedValueOnce({ url: 'https://checkout.stripe.com/pay/cs_test_abc' })
      await createCheckoutSession({
        customerId: 'cus_existing',
        clerkUserId: 'user_123',
        email: 'test@example.com',
        priceId: 'price_123',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      })
      expect(mockCheckoutCreate).toHaveBeenCalledWith(
        expect.objectContaining({ customer: 'cus_existing', customer_email: undefined })
      )
    })

    it('sets customer_email when no customerId provided', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'
      const { createCheckoutSession } = await getStripeModule()
      mockCheckoutCreate.mockResolvedValueOnce({ url: 'https://checkout.stripe.com/pay/cs_test_abc' })
      await createCheckoutSession({
        clerkUserId: 'user_123',
        email: 'test@example.com',
        priceId: 'price_123',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      })
      expect(mockCheckoutCreate).toHaveBeenCalledWith(
        expect.objectContaining({ customer_email: 'test@example.com' })
      )
    })
  })

  describe('createPortalSession', () => {
    it('returns null when stripe is not configured', async () => {
      delete process.env.STRIPE_SECRET_KEY
      const { createPortalSession } = await getStripeModule()
      const result = await createPortalSession('cus_123', 'https://example.com/dashboard')
      expect(result).toBeNull()
    })

    it('returns portal URL when stripe is configured', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'
      const { createPortalSession } = await getStripeModule()
      mockPortalCreate.mockResolvedValueOnce({ url: 'https://billing.stripe.com/session/bps_test_abc' })
      const result = await createPortalSession('cus_123', 'https://example.com/dashboard')
      expect(result).toBe('https://billing.stripe.com/session/bps_test_abc')
    })
  })

  describe('getSubscriptionStatus', () => {
    it('returns none when stripe is not configured', async () => {
      delete process.env.STRIPE_SECRET_KEY
      const { getSubscriptionStatus } = await getStripeModule()
      const result = await getSubscriptionStatus('cus_123')
      expect(result).toBe('none')
    })

    it('returns none when no subscriptions found', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'
      const { getSubscriptionStatus } = await getStripeModule()
      mockSubscriptionsList.mockResolvedValueOnce({ data: [] })
      const result = await getSubscriptionStatus('cus_123')
      expect(result).toBe('none')
    })

    it('returns active status when subscription is active', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'
      const { getSubscriptionStatus } = await getStripeModule()
      mockSubscriptionsList.mockResolvedValueOnce({ data: [{ status: 'active' }] })
      const result = await getSubscriptionStatus('cus_123')
      expect(result).toBe('active')
    })

    it('returns canceled status when subscription is canceled', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'
      const { getSubscriptionStatus } = await getStripeModule()
      mockSubscriptionsList.mockResolvedValueOnce({ data: [{ status: 'canceled' }] })
      const result = await getSubscriptionStatus('cus_123')
      expect(result).toBe('canceled')
    })
  })
})

// ── Stripe webhook handler ───────────────────────────────────────────────────
vi.mock('@collabworld/db', () => ({
  db: {
    user: {
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}))

describe('POST /api/v1/webhooks/stripe', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  async function getHandler() {
    const mod = await import('@/app/api/v1/webhooks/stripe/route')
    return mod.POST
  }

  function makeRequest(body: string, sig: string | null = 'stripe-sig-value'): Request {
    const headers: Record<string, string> = { 'content-type': 'text/plain' }
    if (sig) headers['stripe-signature'] = sig
    return new Request('https://example.com/api/v1/webhooks/stripe', {
      method: 'POST',
      headers,
      body,
    })
  }

  it('returns 503 when stripe is not configured', async () => {
    delete process.env.STRIPE_SECRET_KEY
    const POST = await getHandler()
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(503)
    const body = await res.json()
    expect(body.error).toBe('Stripe not configured')
  })

  it('returns 400 when stripe-signature header is missing', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    const POST = await getHandler()
    const res = await POST(makeRequest('{}', null))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('No signature')
  })

  it('returns 400 when signature verification fails', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    mockConstructEvent.mockImplementationOnce(() => { throw new Error('Invalid signature') })
    const POST = await getHandler()
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Invalid signature')
  })

  it('returns 200 on valid checkout.session.completed event', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    mockConstructEvent.mockReturnValueOnce({
      type: 'checkout.session.completed',
      data: { object: { metadata: { clerkUserId: 'user_123' }, customer: 'cus_abc' } },
    })
    const POST = await getHandler()
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.received).toBe(true)
  })

  it('updates subscriptionPlan and status on customer.subscription.updated (active)', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    const { db } = await import('@collabworld/db')
    mockConstructEvent.mockReturnValueOnce({
      type: 'customer.subscription.updated',
      data: { object: { customer: 'cus_abc', status: 'active' } },
    })
    vi.mocked(db.user.updateMany).mockResolvedValueOnce({ count: 1 })
    const POST = await getHandler()
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(200)
    expect(db.user.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { stripeCustomerId: 'cus_abc' },
        data: expect.objectContaining({ subscriptionPlan: 'premium', subscriptionStatus: 'active' }),
      })
    )
  })

  it('downgrades plan to free on customer.subscription.updated (past_due)', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    const { db } = await import('@collabworld/db')
    mockConstructEvent.mockReturnValueOnce({
      type: 'customer.subscription.updated',
      data: { object: { customer: 'cus_abc', status: 'past_due' } },
    })
    vi.mocked(db.user.updateMany).mockResolvedValueOnce({ count: 1 })
    const POST = await getHandler()
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(200)
    expect(db.user.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ subscriptionPlan: 'free', subscriptionStatus: 'past_due' }),
      })
    )
  })

  it('resets plan to free on customer.subscription.deleted', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    const { db } = await import('@collabworld/db')
    mockConstructEvent.mockReturnValueOnce({
      type: 'customer.subscription.deleted',
      data: { object: { customer: 'cus_abc', status: 'canceled' } },
    })
    vi.mocked(db.user.updateMany).mockResolvedValueOnce({ count: 1 })
    const POST = await getHandler()
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(200)
    expect(db.user.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { stripeCustomerId: 'cus_abc' },
        data: expect.objectContaining({ subscriptionPlan: 'free', subscriptionStatus: 'cancelled' }),
      })
    )
  })
})
