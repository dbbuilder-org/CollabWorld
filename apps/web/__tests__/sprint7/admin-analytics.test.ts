import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@collabworld/db', () => ({
  db: {
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    contestEntry: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    entryEngagement: {
      groupBy: vi.fn(),
    },
    contest: {
      findMany: vi.fn(),
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

const BASE_URL = 'http://localhost/api/v1/admin/analytics'

async function getHandler() {
  const mod = await import('@/app/api/v1/admin/analytics/route')
  return mod.GET
}

const mockUsers = [{ createdAt: new Date('2026-01-10') }, { createdAt: new Date('2026-01-10') }, { createdAt: new Date('2026-01-11') }]
const mockEntries = [{ createdAt: new Date('2026-01-10') }, { createdAt: new Date('2026-01-12') }]
const mockEngagements = [
  { type: 'like', _count: { type: 150 } },
  { type: 'vote', _count: { type: 300 } },
  { type: 'comment', _count: { type: 75 } },
  { type: 'share', _count: { type: 50 } },
]
const mockContests = [
  {
    id: 'uuid-contest-001',
    title: 'Epic Music Contest',
    slug: 'epic-music-contest',
    status: 'active',
    _count: { entries: 10 },
    entries: [
      { _count: { engagements: 100 } },
      { _count: { engagements: 200 } },
    ],
  },
]
const mockCreatorGroups = [
  { creatorId: 'uuid-creator-001', _sum: { compositeScore: 500 }, _count: { id: 3 } },
]
const mockCreators = [
  { id: 'uuid-creator-001', displayName: 'Top Creator', email: 'top@creator.com' },
]

describe('GET /api/v1/admin/analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    } as unknown as ReturnType<typeof auth>)
    vi.mocked(db.user.findMany).mockResolvedValue(mockUsers as never)
    vi.mocked(db.contestEntry.findMany).mockResolvedValue(mockEntries as never)
    vi.mocked(db.entryEngagement.groupBy).mockResolvedValue(mockEngagements as never)
    vi.mocked(db.contest.findMany).mockResolvedValue(mockContests as never)
    vi.mocked(db.contestEntry.groupBy).mockResolvedValue(mockCreatorGroups as never)
    vi.mocked(db.user.findMany)
      .mockResolvedValueOnce(mockUsers as never)
      .mockResolvedValueOnce(mockCreators as never)
  })

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth).mockReturnValue({ userId: null, sessionClaims: null } as unknown as ReturnType<typeof auth>)
    const GET = await getHandler()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 403 for non-admin', async () => {
    vi.mocked(auth).mockReturnValue({
      userId: 'user_fan',
      sessionClaims: { publicMetadata: { role: 'creator' } },
    } as unknown as ReturnType<typeof auth>)
    const GET = await getHandler()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req)
    expect(res.status).toBe(403)
  })

  it('returns analytics data structure', async () => {
    const GET = await getHandler()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toHaveProperty('registrationsByDay')
    expect(json.data).toHaveProperty('entriesByDay')
    expect(json.data).toHaveProperty('engagementByType')
    expect(json.data).toHaveProperty('topContests')
    expect(json.data).toHaveProperty('topCreators')
    expect(json.data).toHaveProperty('range')
  })

  it('accepts from/to date params', async () => {
    const GET = await getHandler()
    const req = new NextRequest(`${BASE_URL}?from=2026-01-01&to=2026-01-31`)
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.range.from).toContain('2026-01-01')
  })

  it('returns 400 for invalid date params', async () => {
    const GET = await getHandler()
    const req = new NextRequest(`${BASE_URL}?from=not-a-date&to=also-not`)
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('accepts contestId filter param', async () => {
    const GET = await getHandler()
    const req = new NextRequest(`${BASE_URL}?contestId=uuid-contest-001`)
    const res = await GET(req)
    expect(res.status).toBe(200)
    // Verify that contestEntry.findMany was called with contestId filter
    expect(vi.mocked(db.contestEntry.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ contestId: 'uuid-contest-001' }),
      })
    )
  })
})
