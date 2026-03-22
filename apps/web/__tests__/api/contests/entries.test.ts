import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@collabworld/db', () => ({
  db: {
    contest: { findUnique: vi.fn() },
    contestEntry: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

import { db } from '@collabworld/db'
import { GET } from '@/app/api/v1/contests/[slug]/entries/route'

const CONTEST_SLUG = 'summer-beats'
const BASE_URL = `http://localhost/api/v1/contests/${CONTEST_SLUG}/entries`

const mockContest = { id: 'contest-uuid-001' }

function makeApprovedEntry(id: string, score: number) {
  return {
    id,
    title: `Entry ${id}`,
    status: 'approved',
    compositeScore: score,
    muxPlaybackId: null,
    creator: { displayName: 'Creator', avatarUrl: null, referralCode: null },
  }
}

describe('GET /api/v1/contests/[slug]/entries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockContest)
  })

  it('returns only approved entries', async () => {
    const entries = [makeApprovedEntry('e1', 50), makeApprovedEntry('e2', 30)]
    ;(db.contestEntry.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(entries)
    ;(db.contestEntry.count as ReturnType<typeof vi.fn>).mockResolvedValue(2)

    const req = new NextRequest(BASE_URL)
    const res = await GET(req, { params: { slug: CONTEST_SLUG } })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.items).toHaveLength(2)
    expect(json.total).toBe(2)

    // Verify DB was queried with status=approved
    expect(db.contestEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'approved' }),
      })
    )
  })

  it('sorts by compositeScore DESC', async () => {
    const entries = [makeApprovedEntry('high', 100), makeApprovedEntry('low', 10)]
    ;(db.contestEntry.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(entries)
    ;(db.contestEntry.count as ReturnType<typeof vi.fn>).mockResolvedValue(2)

    const req = new NextRequest(BASE_URL)
    const res = await GET(req, { params: { slug: CONTEST_SLUG } })

    expect(res.status).toBe(200)
    expect(db.contestEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { compositeScore: 'desc' },
      })
    )
  })

  it('supports pagination — page 2 offsets correctly', async () => {
    ;(db.contestEntry.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([])
    ;(db.contestEntry.count as ReturnType<typeof vi.fn>).mockResolvedValue(25)

    const req = new NextRequest(`${BASE_URL}?page=2&pageSize=10`)
    const res = await GET(req, { params: { slug: CONTEST_SLUG } })

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.page).toBe(2)
    expect(json.pageSize).toBe(10)
    expect(json.total).toBe(25)

    expect(db.contestEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 })
    )
  })

  it('returns 404 when contest slug not found', async () => {
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const req = new NextRequest(BASE_URL)
    const res = await GET(req, { params: { slug: CONTEST_SLUG } })
    expect(res.status).toBe(404)
  })

  it('returns hasMore correctly when there are more entries', async () => {
    const entries = Array.from({ length: 5 }, (_, i) => makeApprovedEntry(`e${i}`, i * 10))
    ;(db.contestEntry.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(entries)
    ;(db.contestEntry.count as ReturnType<typeof vi.fn>).mockResolvedValue(25)

    const req = new NextRequest(`${BASE_URL}?page=1&pageSize=5`)
    const res = await GET(req, { params: { slug: CONTEST_SLUG } })
    const json = await res.json()
    expect(json.hasMore).toBe(true)
  })
})
