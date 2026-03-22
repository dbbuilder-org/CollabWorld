import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@collabworld/db', () => ({
  db: {
    contest: {
      findUnique: vi.fn(),
    },
  },
}))

import { db } from '@collabworld/db'

const BASE_URL = 'http://localhost/api/v1/contests'

const mockActiveContest = {
  id: 'uuid-contest-001',
  title: 'Active Contest',
  slug: 'active-contest',
  status: 'active',
  description: 'A great contest',
  rules: 'Follow the rules',
  prizePoolTotal: 5000,
  thumbnailUrl: null,
  contestEnd: new Date('2026-05-01'),
  votingStart: new Date('2026-04-15'),
  votingEnd: new Date('2026-04-22'),
  entryDeadline: new Date('2026-04-10'),
  maxEntries: null,
  assetPackageUrl: null,
  brandSponsor: null,
  prizes: [
    { id: 'p1', rank: 1, prizeAmount: 3000, description: 'First place' },
    { id: 'p2', rank: 2, prizeAmount: 2000, description: 'Second place' },
  ],
  _count: { entries: 42, influencerAssignments: 3 },
}

async function getHandler() {
  const mod = await import('@/app/api/v1/contests/[slug]/route')
  return mod.GET
}

describe('GET /api/v1/contests/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 404 when contest does not exist', async () => {
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const GET = await getHandler()
    const req = new NextRequest(`${BASE_URL}/non-existent`)
    const res = await GET(req, { params: { slug: 'non-existent' } })
    expect(res.status).toBe(404)
  })

  it('returns 404 for draft contest', async () => {
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockActiveContest,
      status: 'draft',
    })
    const GET = await getHandler()
    const req = new NextRequest(`${BASE_URL}/active-contest`)
    const res = await GET(req, { params: { slug: 'active-contest' } })
    expect(res.status).toBe(404)
  })

  it('returns 404 for archived contest', async () => {
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockActiveContest,
      status: 'archived',
    })
    const GET = await getHandler()
    const req = new NextRequest(`${BASE_URL}/active-contest`)
    const res = await GET(req, { params: { slug: 'active-contest' } })
    expect(res.status).toBe(404)
  })

  it('returns 200 with full contest for active status', async () => {
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockActiveContest)
    const GET = await getHandler()
    const req = new NextRequest(`${BASE_URL}/active-contest`)
    const res = await GET(req, { params: { slug: 'active-contest' } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.title).toBe('Active Contest')
    expect(json.data.prizes).toHaveLength(2)
    expect(json.data.entryCount).toBe(42)
    expect(json.data.influencerCount).toBe(3)
    expect(json.data).toHaveProperty('daysRemaining')
  })

  it('returns 200 for upcoming contest', async () => {
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockActiveContest,
      status: 'upcoming',
    })
    const GET = await getHandler()
    const req = new NextRequest(`${BASE_URL}/active-contest`)
    const res = await GET(req, { params: { slug: 'active-contest' } })
    expect(res.status).toBe(200)
  })

  it('returns 200 for voting contest', async () => {
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockActiveContest,
      status: 'voting',
    })
    const GET = await getHandler()
    const req = new NextRequest(`${BASE_URL}/active-contest`)
    const res = await GET(req, { params: { slug: 'active-contest' } })
    expect(res.status).toBe(200)
  })

  it('returns 200 for completed contest', async () => {
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockActiveContest,
      status: 'completed',
    })
    const GET = await getHandler()
    const req = new NextRequest(`${BASE_URL}/active-contest`)
    const res = await GET(req, { params: { slug: 'active-contest' } })
    expect(res.status).toBe(200)
  })
})
