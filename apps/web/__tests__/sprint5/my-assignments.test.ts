import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@collabworld/db', () => ({
  db: {
    user: { findUnique: vi.fn() },
    influencerContestAssignment: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({
    userId: 'user_inf_123',
    sessionClaims: { publicMetadata: { role: 'influencer' } },
  })),
}))

vi.mock('@/lib/referral', () => ({
  createReferralLink: vi.fn((code: string, base: string) => `${base}/ref/${code}`),
  generateReferralCode: vi.fn(),
  parseReferralCode: vi.fn(),
  trackConversion: vi.fn(),
}))

import { db } from '@collabworld/db'
import { auth } from '@clerk/nextjs/server'

const BASE_URL = 'http://localhost/api/v1/influencers/my-assignments'

const mockUser = {
  id: 'uuid-user-001',
  clerkId: 'user_inf_123',
  email: 'inf@example.com',
  displayName: 'Test Influencer',
}

const mockContest = {
  id: 'uuid-contest-001',
  title: 'Epic Music Contest',
  slug: 'epic-music-contest',
  status: 'active',
  entryDeadline: new Date('2026-04-01').toISOString(),
  votingStart: new Date('2026-04-15').toISOString(),
  votingEnd: new Date('2026-04-22').toISOString(),
  contestEnd: new Date('2026-04-30').toISOString(),
  thumbnailUrl: null,
  prizePoolTotal: 7000,
}

const mockAssignment = {
  id: 'uuid-assign-001',
  contestId: 'uuid-contest-001',
  influencerId: 'uuid-user-001',
  status: 'active',
  commissionRate: 0.1,
  trackingUrl: 'ABCDEF123456',
  conversions: 3,
  totalEarned: 150,
  agreementSignedAt: new Date('2026-03-01').toISOString(),
  joinedAt: new Date('2026-03-01').toISOString(),
  contest: mockContest,
}

async function getHandler() {
  const mod = await import('@/app/api/v1/influencers/my-assignments/route')
  return { GET: mod.GET }
}

describe('GET /api/v1/influencers/my-assignments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 401 when not authenticated', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null, sessionClaims: null })
    const { GET } = await getHandler()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 403 when not influencer role', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_fan_123',
      sessionClaims: { publicMetadata: { role: 'fan' } },
    })
    const { GET } = await getHandler()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req)
    expect(res.status).toBe(403)
  })

  it('returns 404 when user not found in DB', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_inf_123',
      sessionClaims: { publicMetadata: { role: 'influencer' } },
    })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const { GET } = await getHandler()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req)
    expect(res.status).toBe(404)
  })

  it('returns assignments with referral links for influencer', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_inf_123',
      sessionClaims: { publicMetadata: { role: 'influencer' } },
    })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser)
    ;(db.influencerContestAssignment.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      mockAssignment,
    ])
    const { GET } = await getHandler()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toHaveLength(1)
    expect(json.data[0].referralLink).toContain('/ref/ABCDEF123456')
    expect(json.data[0].contest.title).toBe('Epic Music Contest')
  })

  it('returns empty array when influencer has no assignments', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_inf_123',
      sessionClaims: { publicMetadata: { role: 'influencer' } },
    })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser)
    ;(db.influencerContestAssignment.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([])
    const { GET } = await getHandler()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toHaveLength(0)
  })

  it('includes stats (conversions, totalEarned) in response', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_inf_123',
      sessionClaims: { publicMetadata: { role: 'influencer' } },
    })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser)
    ;(db.influencerContestAssignment.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      mockAssignment,
    ])
    const { GET } = await getHandler()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req)
    const json = await res.json()
    expect(json.data[0].conversions).toBe(3)
    expect(json.data[0].totalEarned).toBe(150)
  })

  it('returns 403 when admin tries to access influencer route', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    const { GET } = await getHandler()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req)
    expect(res.status).toBe(403)
  })
})
