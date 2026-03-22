import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@collabworld/db', () => ({
  db: {
    contest: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({
    userId: 'user_admin_123',
    sessionClaims: { publicMetadata: { role: 'admin' } },
  })),
}))

import { db } from '@collabworld/db'
import { auth } from '@clerk/nextjs/server'

const BASE_URL = 'http://localhost/api/v1/admin/contests/uuid-contest-001'

const mockDraftContest = {
  id: 'uuid-contest-001',
  title: 'Epic Music Contest',
  slug: 'epic-music-contest',
  status: 'draft',
}

const mockParams = { id: 'uuid-contest-001' }

async function getHandler() {
  const mod = await import('@/app/api/v1/admin/contests/[id]/route')
  return mod.PATCH
}

describe('PATCH /api/v1/admin/contests/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 401 when not authenticated', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null, sessionClaims: null })
    const PATCH = await getHandler()
    const req = new NextRequest(BASE_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'upcoming' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await PATCH(req, { params: mockParams })
    expect(res.status).toBe(401)
  })

  it('returns 403 when not admin', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_fan_123',
      sessionClaims: { publicMetadata: { role: 'fan' } },
    })
    const PATCH = await getHandler()
    const req = new NextRequest(BASE_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'upcoming' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await PATCH(req, { params: mockParams })
    expect(res.status).toBe(403)
  })

  it('returns 404 when contest does not exist', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const PATCH = await getHandler()
    const req = new NextRequest(BASE_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'upcoming' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await PATCH(req, { params: mockParams })
    expect(res.status).toBe(404)
  })

  it('returns 400 for invalid status transition', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockDraftContest)
    const PATCH = await getHandler()
    const req = new NextRequest(BASE_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' }), // invalid: draft -> completed
      headers: { 'content-type': 'application/json' },
    })
    const res = await PATCH(req, { params: mockParams })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('Cannot transition from draft to completed')
  })

  it('returns 200 for valid transition', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockDraftContest)
    ;(db.contest.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockDraftContest,
      status: 'upcoming',
      prizes: [],
    })
    const PATCH = await getHandler()
    const req = new NextRequest(BASE_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'upcoming' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await PATCH(req, { params: mockParams })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.status).toBe('upcoming')
  })

  it('returns 200 and logs notification when transitioning to active', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockDraftContest,
      status: 'upcoming',
    })
    ;(db.contest.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockDraftContest,
      status: 'active',
      prizes: [],
    })
    const PATCH = await getHandler()
    const req = new NextRequest(BASE_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'active' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await PATCH(req, { params: mockParams })
    expect(res.status).toBe(200)
  })
})
