import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@collabworld/db', () => ({
  db: {
    user: { findUnique: vi.fn() },
    influencerContestAssignment: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({
    userId: 'user_inf_123',
    sessionClaims: { publicMetadata: { role: 'influencer' } },
  })),
}))

import { db } from '@collabworld/db'
import { auth } from '@clerk/nextjs/server'

const BASE_URL = 'http://localhost/api/v1/influencers/assignments/uuid-assign-001/sign'

const mockUser = {
  id: 'uuid-user-001',
  clerkId: 'user_inf_123',
  email: 'inf@example.com',
  displayName: 'Test Influencer',
}

const mockAssignment = {
  id: 'uuid-assign-001',
  contestId: 'uuid-contest-001',
  influencerId: 'uuid-user-001',
  status: 'invited',
  commissionRate: 0.1,
  trackingUrl: 'ABCDEF123456',
  conversions: 0,
  totalEarned: 0,
  agreementSignedAt: null,
  joinedAt: new Date().toISOString(),
}

async function getHandler() {
  const mod = await import('@/app/api/v1/influencers/assignments/[id]/sign/route')
  return { POST: mod.POST }
}

describe('POST /api/v1/influencers/assignments/[id]/sign', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 401 when not authenticated', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null, sessionClaims: null })
    const { POST } = await getHandler()
    const req = new NextRequest(BASE_URL, { method: 'POST' })
    const res = await POST(req, { params: { id: 'uuid-assign-001' } })
    expect(res.status).toBe(401)
  })

  it('returns 403 when not influencer role', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_fan_123',
      sessionClaims: { publicMetadata: { role: 'fan' } },
    })
    const { POST } = await getHandler()
    const req = new NextRequest(BASE_URL, { method: 'POST' })
    const res = await POST(req, { params: { id: 'uuid-assign-001' } })
    expect(res.status).toBe(403)
  })

  it('returns 404 when user not found in DB', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_inf_123',
      sessionClaims: { publicMetadata: { role: 'influencer' } },
    })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const { POST } = await getHandler()
    const req = new NextRequest(BASE_URL, { method: 'POST' })
    const res = await POST(req, { params: { id: 'uuid-assign-001' } })
    expect(res.status).toBe(404)
  })

  it('returns 404 when assignment not found', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_inf_123',
      sessionClaims: { publicMetadata: { role: 'influencer' } },
    })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser)
    ;(db.influencerContestAssignment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const { POST } = await getHandler()
    const req = new NextRequest(BASE_URL, { method: 'POST' })
    const res = await POST(req, { params: { id: 'uuid-assign-001' } })
    expect(res.status).toBe(404)
  })

  it('returns 403 when assignment belongs to different user', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_inf_123',
      sessionClaims: { publicMetadata: { role: 'influencer' } },
    })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser)
    ;(db.influencerContestAssignment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockAssignment,
      influencerId: 'uuid-different-user',
    })
    const { POST } = await getHandler()
    const req = new NextRequest(BASE_URL, { method: 'POST' })
    const res = await POST(req, { params: { id: 'uuid-assign-001' } })
    expect(res.status).toBe(403)
  })

  it('returns 409 when assignment is already active', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_inf_123',
      sessionClaims: { publicMetadata: { role: 'influencer' } },
    })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser)
    ;(db.influencerContestAssignment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockAssignment,
      status: 'active',
      agreementSignedAt: new Date().toISOString(),
    })
    const { POST } = await getHandler()
    const req = new NextRequest(BASE_URL, { method: 'POST' })
    const res = await POST(req, { params: { id: 'uuid-assign-001' } })
    expect(res.status).toBe(409)
  })

  it('returns 409 when assignment is completed', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_inf_123',
      sessionClaims: { publicMetadata: { role: 'influencer' } },
    })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser)
    ;(db.influencerContestAssignment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockAssignment,
      status: 'completed',
    })
    const { POST } = await getHandler()
    const req = new NextRequest(BASE_URL, { method: 'POST' })
    const res = await POST(req, { params: { id: 'uuid-assign-001' } })
    expect(res.status).toBe(409)
  })

  it('returns 200 with updated assignment on success', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_inf_123',
      sessionClaims: { publicMetadata: { role: 'influencer' } },
    })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser)
    ;(db.influencerContestAssignment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockAssignment
    )
    ;(db.influencerContestAssignment.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockAssignment,
      status: 'active',
      agreementSignedAt: new Date().toISOString(),
    })
    const { POST } = await getHandler()
    const req = new NextRequest(BASE_URL, { method: 'POST' })
    const res = await POST(req, { params: { id: 'uuid-assign-001' } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.status).toBe('active')
    expect(json.data.agreementSignedAt).toBeTruthy()
  })

  it('signs agreement_pending status too', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_inf_123',
      sessionClaims: { publicMetadata: { role: 'influencer' } },
    })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser)
    ;(db.influencerContestAssignment.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockAssignment,
      status: 'agreement_pending',
    })
    ;(db.influencerContestAssignment.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockAssignment,
      status: 'active',
      agreementSignedAt: new Date().toISOString(),
    })
    const { POST } = await getHandler()
    const req = new NextRequest(BASE_URL, { method: 'POST' })
    const res = await POST(req, { params: { id: 'uuid-assign-001' } })
    expect(res.status).toBe(200)
  })
})
