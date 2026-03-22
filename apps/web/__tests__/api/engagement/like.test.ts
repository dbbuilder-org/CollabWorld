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
    user: { findUnique: vi.fn() },
    contestEntry: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    entryEngagement: {
      findFirst: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

import { db } from '@collabworld/db'
import { auth } from '@clerk/nextjs/server'
import { POST } from '@/app/api/v1/entries/[id]/like/route'

const ENTRY_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
const USER_CLERK_ID = 'user_clerk_123'
const USER_DB_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

function makeRequest() {
  return new NextRequest(`http://localhost/api/v1/entries/${ENTRY_ID}/like`, {
    method: 'POST',
  })
}

const mockParams = { params: { id: ENTRY_ID } }

describe('POST /api/v1/entries/[id]/like', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(db.entryEngagement.groupBy as ReturnType<typeof vi.fn>).mockResolvedValue([])
    ;(db.contestEntry.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      contestId: 'c1',
      voteCount: 0,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      compositeScore: 0,
    })
  })

  it('returns 401 when not authenticated', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null })

    const res = await POST(makeRequest(), mockParams)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Unauthorized')
  })

  it('returns 404 when entry not found', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: USER_CLERK_ID })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: USER_DB_ID })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const res = await POST(makeRequest(), mockParams)
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toBe('Entry not found')
  })

  it('returns 400 when entry is not approved', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: USER_CLERK_ID })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: USER_DB_ID })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      status: 'pending',
      contestId: 'c1',
      likeCount: 0,
    })

    const res = await POST(makeRequest(), mockParams)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('approved')
  })

  it('creates engagement on first like → { liked: true, likeCount: 1 }', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: USER_CLERK_ID })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: USER_DB_ID })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      status: 'approved',
      contestId: 'c1',
      likeCount: 0,
    })
    ;(db.entryEngagement.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(db.entryEngagement.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'eng-1' })
    ;(db.entryEngagement.groupBy as ReturnType<typeof vi.fn>).mockResolvedValue([
      { type: 'like', _count: { type: 1 } },
    ])
    ;(db.contestEntry.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      contestId: 'c1',
      voteCount: 0,
      likeCount: 1,
      commentCount: 0,
      shareCount: 0,
      compositeScore: 1,
    })

    const res = await POST(makeRequest(), mockParams)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.liked).toBe(true)
    expect(json.likeCount).toBe(1)
  })

  it('deletes engagement on second like (toggle) → { liked: false, likeCount: 0 }', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: USER_CLERK_ID })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: USER_DB_ID })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      status: 'approved',
      contestId: 'c1',
      likeCount: 1,
    })
    ;(db.entryEngagement.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'eng-1',
      type: 'like',
    })
    ;(db.entryEngagement.delete as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'eng-1' })
    ;(db.entryEngagement.groupBy as ReturnType<typeof vi.fn>).mockResolvedValue([])
    ;(db.contestEntry.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      contestId: 'c1',
      voteCount: 0,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      compositeScore: 0,
    })

    const res = await POST(makeRequest(), mockParams)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.liked).toBe(false)
    expect(json.likeCount).toBe(0)
  })
})
