import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock svix
vi.mock('svix', () => ({
  Webhook: vi.fn().mockImplementation(() => ({
    verify: vi.fn(),
  })),
}))

// Mock @collabworld/db
vi.mock('@collabworld/db', () => ({
  db: {
    user: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}))

import { Webhook } from 'svix'
import { db } from '@collabworld/db'

// Dynamic import to allow mocks to be set up first
async function getHandler() {
  const mod = await import('@/app/api/v1/webhooks/clerk/route')
  return mod.POST
}

function makeRequest(body: object, headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/v1/webhooks/clerk', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      'svix-id': 'test-id',
      'svix-timestamp': '1234567890',
      'svix-signature': 'test-sig',
      ...headers,
    },
  })
}

describe('POST /api/v1/webhooks/clerk', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CLERK_WEBHOOK_SECRET = 'test_webhook_secret'
  })

  it('returns 400 when svix verification fails', async () => {
    const mockVerify = vi.fn().mockImplementation(() => {
      throw new Error('Invalid signature')
    })
    ;(Webhook as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      verify: mockVerify,
    }))

    const POST = await getHandler()
    const req = makeRequest({ type: 'user.created', data: {} })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('handles user.created event', async () => {
    const payload = {
      type: 'user.created',
      data: {
        id: 'user_123',
        email_addresses: [{ email_address: 'test@example.com' }],
        first_name: 'Test',
        last_name: 'User',
        image_url: 'https://example.com/avatar.jpg',
      },
    }
    const mockVerify = vi.fn().mockReturnValue(payload)
    ;(Webhook as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      verify: mockVerify,
    }))
    ;(db.user.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'uuid-123' })

    const POST = await getHandler()
    const req = makeRequest(payload)
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(db.user.create).toHaveBeenCalledOnce()
  })

  it('handles user.updated event', async () => {
    const payload = {
      type: 'user.updated',
      data: {
        id: 'user_123',
        email_addresses: [{ email_address: 'updated@example.com' }],
        first_name: 'Updated',
        last_name: 'User',
        image_url: 'https://example.com/avatar2.jpg',
      },
    }
    const mockVerify = vi.fn().mockReturnValue(payload)
    ;(Webhook as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      verify: mockVerify,
    }))
    ;(db.user.update as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'uuid-123' })

    const POST = await getHandler()
    const req = makeRequest(payload)
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(db.user.update).toHaveBeenCalledOnce()
  })

  it('handles user.deleted event', async () => {
    const payload = {
      type: 'user.deleted',
      data: {
        id: 'user_123',
      },
    }
    const mockVerify = vi.fn().mockReturnValue(payload)
    ;(Webhook as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      verify: mockVerify,
    }))
    ;(db.user.update as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'uuid-123' })

    const POST = await getHandler()
    const req = makeRequest(payload)
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(db.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clerkId: 'user_123' },
        data: expect.objectContaining({ isActive: false }),
      })
    )
  })

  it('returns 500 when DB throws on user.created', async () => {
    const payload = {
      type: 'user.created',
      data: {
        id: 'user_456',
        email_addresses: [{ email_address: 'fail@example.com' }],
        first_name: 'Fail',
        last_name: 'User',
        image_url: null,
      },
    }
    const mockVerify = vi.fn().mockReturnValue(payload)
    ;(Webhook as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      verify: mockVerify,
    }))
    ;(db.user.create as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB error'))

    const POST = await getHandler()
    const req = makeRequest(payload)
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
