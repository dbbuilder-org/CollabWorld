import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(() => ({
    zadd: vi.fn(),
    zrange: vi.fn(),
    del: vi.fn(),
  })),
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn(() => ({
    limit: vi.fn().mockResolvedValue({ success: true, remaining: 59 }),
  })),
}))

vi.mock('@collabworld/db', () => ({
  db: {
    contest: { findUnique: vi.fn() },
    contestEntry: { findMany: vi.fn() },
  },
}))

import { db } from '@collabworld/db'
import { GET } from '@/app/api/v1/contests/[slug]/leaderboard/route'

const CONTEST_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
const CONTEST_SLUG = 'summer-jam'

function makeRequest(slug: string) {
  return new NextRequest(`http://localhost/api/v1/contests/${slug}/leaderboard`, {
    method: 'GET',
  })
}

describe('GET /api/v1/contests/[slug]/leaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 404 for unknown slug', async () => {
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const res = await GET(makeRequest('unknown-slug'), { params: { slug: 'unknown-slug' } })
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toContain('not found')
  })

  it('returns empty entries array for contest with no approved entries', async () => {
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: CONTEST_ID,
      title: 'Summer Jam',
      slug: CONTEST_SLUG,
      status: 'voting',
    })
    ;(db.contestEntry.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([])

    const res = await GET(makeRequest(CONTEST_SLUG), { params: { slug: CONTEST_SLUG } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.entries).toHaveLength(0)
    expect(json.contestId).toBe(CONTEST_ID)
    expect(json.contestTitle).toBe('Summer Jam')
  })

  it('returns ranked entries', async () => {
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: CONTEST_ID,
      title: 'Summer Jam',
      slug: CONTEST_SLUG,
      status: 'voting',
    })
    ;(db.contestEntry.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 'entry-1',
        title: 'Hot Track',
        muxPlaybackId: 'mux-1',
        thumbnailUrl: null,
        contestId: CONTEST_ID,
        creatorId: 'user-1',
        voteCount: 10,
        likeCount: 20,
        commentCount: 5,
        shareCount: 3,
        compositeScore: 58.5,
        creator: { id: 'user-1', displayName: 'Artist One', avatarUrl: null },
      },
      {
        id: 'entry-2',
        title: 'Cool Beat',
        muxPlaybackId: null,
        thumbnailUrl: null,
        contestId: CONTEST_ID,
        creatorId: 'user-2',
        voteCount: 5,
        likeCount: 10,
        commentCount: 2,
        shareCount: 1,
        compositeScore: 28,
        creator: { id: 'user-2', displayName: 'Artist Two', avatarUrl: null },
      },
    ])

    const res = await GET(makeRequest(CONTEST_SLUG), { params: { slug: CONTEST_SLUG } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.entries).toHaveLength(2)
    expect(json.entries[0].rank).toBe(1)
    expect(json.entries[0].entryId).toBe('entry-1')
    expect(json.entries[1].rank).toBe(2)
    expect(json.updatedAt).toBeDefined()
  })
})
