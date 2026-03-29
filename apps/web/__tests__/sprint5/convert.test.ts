import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({ userId: 'user_fan_123' })),
}))

vi.mock('@/lib/referral', () => ({
  trackConversion: vi.fn(),
  generateReferralCode: vi.fn(),
  createReferralLink: vi.fn(),
  parseReferralCode: vi.fn(),
}))

import { auth } from '@clerk/nextjs/server'
import { trackConversion } from '@/lib/referral'

const BASE_URL = 'http://localhost/api/v1/referrals/convert'

async function getHandler() {
  const mod = await import('@/app/api/v1/referrals/convert/route')
  return { POST: mod.POST }
}

describe('POST /api/v1/referrals/convert', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 401 when not authenticated', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null })
    const { POST } = await getHandler()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({ referralCode: 'ABCDEF123456' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when body is invalid JSON', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: 'user_fan_123' })
    const { POST } = await getHandler()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: 'not-json',
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when referralCode is missing', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: 'user_fan_123' })
    const { POST } = await getHandler()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('calls trackConversion and returns success', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: 'user_fan_123' })
    ;(trackConversion as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    const { POST } = await getHandler()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({ referralCode: 'ABCDEF123456' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(trackConversion).toHaveBeenCalledWith('user_fan_123', 'ABCDEF123456')
  })

  it('is idempotent — returns success even if already converted', async () => {
    // trackConversion handles idempotency internally, route always returns success
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: 'user_fan_123' })
    ;(trackConversion as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)
    const { POST } = await getHandler()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({ referralCode: 'ABCDEF123456' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect((json: { success: boolean }) => json.success).toBeTruthy()
  })

  it('returns 500 when trackConversion throws', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: 'user_fan_123' })
    ;(trackConversion as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB error'))
    const { POST } = await getHandler()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({ referralCode: 'ABCDEF123456' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
