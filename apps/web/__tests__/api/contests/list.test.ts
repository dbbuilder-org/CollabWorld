import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@collabworld/db', () => ({
  db: {
    contest: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({
    userId: null,
    sessionClaims: null,
  })),
}))

import { db } from '@collabworld/db'
import { auth } from '@clerk/nextjs/server'

const BASE_URL = 'http://localhost/api/v1/contests'

const mockContests = [
  {
    id: 'uuid-contest-001',
    title: 'Active Contest',
    slug: 'active-contest',
    status: 'active',
    prizePoolTotal: 5000,
    thumbnailUrl: null,
    contestEnd: new Date('2026-05-01'),
    votingStart: new Date('2026-04-15'),
    votingEnd: new Date('2026-04-22'),
    _count: { entries: 42 },
  },
  {
    id: 'uuid-contest-002',
    title: 'Upcoming Contest',
    slug: 'upcoming-contest',
    status: 'upcoming',
    prizePoolTotal: 3000,
    thumbnailUrl: null,
    contestEnd: new Date('2026-06-01'),
    votingStart: new Date('2026-05-15'),
    votingEnd: new Date('2026-05-22'),
    _count: { entries: 0 },
  },
]

async function getHandler() {
  const mod = await import('@/app/api/v1/contests/route')
  return mod.GET
}

describe('GET /api/v1/contests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns only public statuses by default', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null, sessionClaims: null })
    ;(db.contest.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockContests)
    const GET = await getHandler()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req)
    expect(res.status).toBe(200)
    // Verify the query used the public status filter
    expect(db.contest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: { in: expect.arrayContaining(['upcoming', 'active', 'voting']) } }),
      })
    )
  })

  it('returns contests with entryCount and daysRemaining', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null, sessionClaims: null })
    ;(db.contest.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockContests)
    const GET = await getHandler()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req)
    const json = await res.json()
    expect(json.data[0]).toHaveProperty('entryCount')
    expect(json.data[0]).toHaveProperty('daysRemaining')
  })

  it('filters by specific status when provided', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null, sessionClaims: null })
    ;(db.contest.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([mockContests[0]])
    const GET = await getHandler()
    const req = new NextRequest(`${BASE_URL}?status=active`)
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(db.contest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: { in: ['active'] } }),
      })
    )
  })

  it('returns empty array when no contests exist', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null, sessionClaims: null })
    ;(db.contest.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([])
    const GET = await getHandler()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toEqual([])
  })

  it('returns 401 for ?status=all when not authenticated', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null, sessionClaims: null })
    const GET = await getHandler()
    const req = new NextRequest(`${BASE_URL}?status=all`)
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 403 for ?status=all when not admin', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_fan_123',
      sessionClaims: { publicMetadata: { role: 'fan' } },
    })
    const GET = await getHandler()
    const req = new NextRequest(`${BASE_URL}?status=all`)
    const res = await GET(req)
    expect(res.status).toBe(403)
  })

  it('returns all contests for admin with ?status=all', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    ;(db.contest.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(mockContests)
    const GET = await getHandler()
    const req = new NextRequest(`${BASE_URL}?status=all`)
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(db.contest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: undefined })
    )
  })
})
