import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@collabworld/db', () => ({
  db: {
    influencerContestAssignment: {
      findFirst: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({ userId: null })),
}))

vi.mock('@/lib/referral', () => ({
  parseReferralCode: vi.fn((code: string) => ({
    valid: /^[A-Z0-9]{8,16}$/.test(code),
  })),
  generateReferralCode: vi.fn(),
  createReferralLink: vi.fn(),
  trackConversion: vi.fn(),
}))

import { db } from '@collabworld/db'
import { auth } from '@clerk/nextjs/server'

const mockAssignment = {
  id: 'uuid-assign-001',
  trackingUrl: 'ABCDEF123456',
  contest: {
    slug: 'epic-music-contest',
  },
}

async function getHandler() {
  const mod = await import('@/app/ref/[code]/route')
  return { GET: mod.GET }
}

describe('GET /ref/[code]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('redirects to / for invalid code format', async () => {
    const { GET } = await getHandler()
    const req = new NextRequest('http://localhost/ref/bad!')
    const res = await GET(req, { params: { code: 'bad!' } })
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/')
  })

  it('redirects to / when assignment not found', async () => {
    ;(db.influencerContestAssignment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const { GET } = await getHandler()
    const req = new NextRequest('http://localhost/ref/ABCDEF123456')
    const res = await GET(req, { params: { code: 'ABCDEF123456' } })
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('http://localhost/')
  })

  it('redirects unauthenticated user to /sign-up with ref param', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null })
    ;(db.influencerContestAssignment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockAssignment
    )
    ;(db.auditLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({})
    const { GET } = await getHandler()
    const req = new NextRequest('http://localhost/ref/ABCDEF123456')
    const res = await GET(req, { params: { code: 'ABCDEF123456' } })
    expect(res.status).toBe(307)
    const location = res.headers.get('location')
    expect(location).toContain('/sign-up')
    expect(location).toContain('ref=ABCDEF123456')
  })

  it('redirects authenticated user to contest page', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: 'user_fan_123' })
    ;(db.influencerContestAssignment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockAssignment
    )
    ;(db.auditLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({})
    const { GET } = await getHandler()
    const req = new NextRequest('http://localhost/ref/ABCDEF123456')
    const res = await GET(req, { params: { code: 'ABCDEF123456' } })
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/contests/epic-music-contest')
  })

  it('sets cw_ref cookie on successful referral click', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null })
    ;(db.influencerContestAssignment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockAssignment
    )
    ;(db.auditLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({})
    const { GET } = await getHandler()
    const req = new NextRequest('http://localhost/ref/ABCDEF123456')
    const res = await GET(req, { params: { code: 'ABCDEF123456' } })
    const setCookie = res.headers.get('set-cookie')
    expect(setCookie).toContain('cw_ref=ABCDEF123456')
  })

  it('creates audit log entry for referral click', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null })
    ;(db.influencerContestAssignment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockAssignment
    )
    ;(db.auditLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({})
    const { GET } = await getHandler()
    const req = new NextRequest('http://localhost/ref/ABCDEF123456')
    await GET(req, { params: { code: 'ABCDEF123456' } })
    expect(db.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'referral_click',
          resourceType: 'influencer_contest_assignment',
          resourceId: 'uuid-assign-001',
        }),
      })
    )
  })
})
