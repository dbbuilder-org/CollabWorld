import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@collabworld/db', () => ({
  db: {
    contest: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
    influencerContestAssignment: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({
    userId: 'user_admin_123',
    sessionClaims: { publicMetadata: { role: 'admin' } },
  })),
}))

vi.mock('@/lib/referral', () => ({
  generateReferralCode: vi.fn(() => 'ABCDEF123456'),
  createReferralLink: vi.fn((code: string, base: string) => `${base}/ref/${code}`),
  parseReferralCode: vi.fn(() => ({ valid: true })),
}))

import { db } from '@collabworld/db'
import { auth } from '@clerk/nextjs/server'

const BASE_URL = 'http://localhost/api/v1/admin/contests/uuid-contest-001/influencers'

const mockContest = {
  id: 'uuid-contest-001',
  title: 'Epic Music Contest',
  slug: 'epic-music-contest',
}

const mockInfluencer = {
  id: 'uuid-inf-001',
  clerkId: 'user_inf_123',
  email: 'inf@example.com',
  displayName: 'Test Influencer',
}

const mockAssignment = {
  id: 'uuid-assign-001',
  contestId: 'uuid-contest-001',
  influencerId: 'uuid-inf-001',
  status: 'invited',
  commissionRate: 0.1,
  trackingUrl: 'ABCDEF123456',
  conversions: 0,
  totalEarned: 0,
  joinedAt: new Date().toISOString(),
}

async function getHandlers() {
  const mod = await import('@/app/api/v1/admin/contests/[id]/influencers/route')
  return { POST: mod.POST, GET: mod.GET }
}

describe('POST /api/v1/admin/contests/[id]/influencers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 401 when not authenticated', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null, sessionClaims: null })
    const { POST } = await getHandlers()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({ influencerClerkId: 'user_inf_123' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req, { params: { id: 'uuid-contest-001' } })
    expect(res.status).toBe(401)
  })

  it('returns 403 when not admin', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_fan_123',
      sessionClaims: { publicMetadata: { role: 'fan' } },
    })
    const { POST } = await getHandlers()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({ influencerClerkId: 'user_inf_123' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req, { params: { id: 'uuid-contest-001' } })
    expect(res.status).toBe(403)
  })

  it('returns 400 when body is invalid', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    const { POST } = await getHandlers()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req, { params: { id: 'uuid-contest-001' } })
    expect(res.status).toBe(400)
  })

  it('returns 404 when contest not found', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const { POST } = await getHandlers()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({ influencerClerkId: 'user_inf_123' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req, { params: { id: 'uuid-contest-001' } })
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toMatch(/contest not found/i)
  })

  it('returns 404 when influencer not found', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockContest)
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const { POST } = await getHandlers()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({ influencerClerkId: 'user_inf_unknown' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req, { params: { id: 'uuid-contest-001' } })
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toMatch(/influencer not found/i)
  })

  it('returns 409 when influencer already assigned', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockContest)
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockInfluencer)
    ;(db.influencerContestAssignment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockAssignment
    )
    const { POST } = await getHandlers()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({ influencerClerkId: 'user_inf_123' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req, { params: { id: 'uuid-contest-001' } })
    expect(res.status).toBe(409)
  })

  it('returns 201 with assignment on success', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockContest)
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockInfluencer)
    ;(db.influencerContestAssignment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(db.influencerContestAssignment.create as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockAssignment
    )
    const { POST } = await getHandlers()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({ influencerClerkId: 'user_inf_123' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req, { params: { id: 'uuid-contest-001' } })
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.data.status).toBe('invited')
    expect(json.data.trackingUrl).toBe('ABCDEF123456')
  })

  it('uses custom commissionRate when provided', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockContest)
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockInfluencer)
    ;(db.influencerContestAssignment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(db.influencerContestAssignment.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockAssignment,
      commissionRate: 0.15,
    })
    const { POST } = await getHandlers()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({ influencerClerkId: 'user_inf_123', commissionRate: 0.15 }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req, { params: { id: 'uuid-contest-001' } })
    expect(res.status).toBe(201)
    expect(db.influencerContestAssignment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ commissionRate: 0.15 }),
      })
    )
  })
})

describe('GET /api/v1/admin/contests/[id]/influencers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 401 when not authenticated', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null, sessionClaims: null })
    const { GET } = await getHandlers()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req, { params: { id: 'uuid-contest-001' } })
    expect(res.status).toBe(401)
  })

  it('returns 403 when not admin', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_fan_123',
      sessionClaims: { publicMetadata: { role: 'fan' } },
    })
    const { GET } = await getHandlers()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req, { params: { id: 'uuid-contest-001' } })
    expect(res.status).toBe(403)
  })

  it('returns 404 when contest not found', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const { GET } = await getHandlers()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req, { params: { id: 'uuid-contest-001' } })
    expect(res.status).toBe(404)
  })

  it('returns all assignments for the contest', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockContest)
    ;(db.influencerContestAssignment.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      { ...mockAssignment, influencer: mockInfluencer },
    ])
    const { GET } = await getHandlers()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req, { params: { id: 'uuid-contest-001' } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toHaveLength(1)
    expect(json.data[0].influencer.clerkId).toBe('user_inf_123')
  })

  it('returns empty array when no assignments exist', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockContest)
    ;(db.influencerContestAssignment.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([])
    const { GET } = await getHandlers()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req, { params: { id: 'uuid-contest-001' } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toHaveLength(0)
  })
})
