import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ── Mocks ────────────────────────────────────────────────────────────────────
const mockVerify = vi.fn()

vi.mock('svix', () => ({
  Webhook: vi.fn().mockImplementation(() => ({ verify: mockVerify })),
}))

vi.mock('@collabworld/db', () => ({
  db: {
    user: {
      create: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}))

import { db } from '@collabworld/db'

async function getHandler() {
  const mod = await import('@/app/api/v1/webhooks/clerk/route')
  return mod.POST
}

function makeRequest(body: string, includeSvixHeaders = true): NextRequest {
  const hdrs: Record<string, string> = { 'content-type': 'application/json' }
  if (includeSvixHeaders) {
    hdrs['svix-id'] = 'msg_123'
    hdrs['svix-timestamp'] = '1234567890'
    hdrs['svix-signature'] = 'v1,sig_abc'
  }
  return new NextRequest('https://example.com/api/v1/webhooks/clerk', {
    method: 'POST',
    headers: hdrs,
    body,
  })
}

describe('POST /api/v1/webhooks/clerk', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.CLERK_WEBHOOK_SECRET = 'whsec_clerk_test'
  })

  it('returns 500 when CLERK_WEBHOOK_SECRET is not set', async () => {
    delete process.env.CLERK_WEBHOOK_SECRET
    const POST = await getHandler()
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Webhook secret not configured')
  })

  it('returns 400 when svix headers are missing', async () => {
    const POST = await getHandler()
    const res = await POST(makeRequest('{}', false))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Missing svix headers')
  })

  it('returns 400 when signature verification fails', async () => {
    mockVerify.mockImplementationOnce(() => { throw new Error('Invalid signature') })
    const POST = await getHandler()
    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Invalid webhook signature')
  })

  it('creates user on user.created event', async () => {
    const payload = {
      type: 'user.created',
      data: {
        id: 'user_clerk_abc',
        email_addresses: [{ email_address: 'new@example.com' }],
        first_name: 'John',
        last_name: 'Doe',
        image_url: null,
      },
    }
    mockVerify.mockReturnValueOnce(payload)
    vi.mocked(db.user.create).mockResolvedValueOnce({} as never)
    const POST = await getHandler()
    const res = await POST(makeRequest(JSON.stringify(payload)))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.received).toBe(true)
  })

  it('updates user on user.updated event', async () => {
    const payload = {
      type: 'user.updated',
      data: {
        id: 'user_clerk_abc',
        email_addresses: [{ email_address: 'updated@example.com' }],
        first_name: 'Jane',
        last_name: 'Doe',
        image_url: 'https://example.com/avatar.jpg',
      },
    }
    mockVerify.mockReturnValueOnce(payload)
    vi.mocked(db.user.update).mockResolvedValueOnce({} as never)
    const POST = await getHandler()
    const res = await POST(makeRequest(JSON.stringify(payload)))
    expect(res.status).toBe(200)
  })

  it('deactivates user on user.deleted event', async () => {
    const payload = {
      type: 'user.deleted',
      data: { id: 'user_clerk_abc' },
    }
    mockVerify.mockReturnValueOnce(payload)
    vi.mocked(db.user.update).mockResolvedValueOnce({} as never)
    const POST = await getHandler()
    const res = await POST(makeRequest(JSON.stringify(payload)))
    expect(res.status).toBe(200)
  })

  it('returns 200 for unknown event types', async () => {
    const payload = { type: 'session.created', data: { id: 'sess_123' } }
    mockVerify.mockReturnValueOnce(payload)
    const POST = await getHandler()
    const res = await POST(makeRequest(JSON.stringify(payload)))
    expect(res.status).toBe(200)
  })

  it('includes received:true in successful response', async () => {
    const payload = { type: 'session.created', data: { id: 'sess_123' } }
    mockVerify.mockReturnValueOnce(payload)
    const POST = await getHandler()
    const res = await POST(makeRequest(JSON.stringify(payload)))
    const body = await res.json()
    expect(body.received).toBe(true)
  })
})
