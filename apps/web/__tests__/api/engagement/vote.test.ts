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
      create: vi.fn(),
      groupBy: vi.fn(),
    },
    contest: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

import { db } from '@collabworld/db'
import { auth } from '@clerk/nextjs/server'
import { POST } from '@/app/api/v1/entries/[id]/vote/route'

const ENTRY_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
const CONTEST_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
const USER_CLERK_ID = 'user_clerk_123'
const USER_DB_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

function makeRequest() {
  return new NextRequest(`http://localhost/api/v1/entries/${ENTRY_ID}/vote`, {
    method: 'POST',
  })
}

const mockParams = { params: { id: ENTRY_ID } }

describe('POST /api/v1/entries/[id]/vote', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(db.entryEngagement.groupBy as ReturnType<typeof vi.fn>).mockResolvedValue([])
    ;(db.contestEntry.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      contestId: CONTEST_ID,
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
  })

  it('returns 400 if contest not in voting status', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: USER_CLERK_ID })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: USER_DB_ID })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      status: 'approved',
      contestId: CONTEST_ID,
      contest: { id: CONTEST_ID, status: 'active' },
    })

    const res = await POST(makeRequest(), mockParams)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('voting')
  })

  it('returns 409 if user already voted in this contest', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: USER_CLERK_ID })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: USER_DB_ID })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      status: 'approved',
      contestId: CONTEST_ID,
      contest: { id: CONTEST_ID, status: 'voting' },
    })
    ;(db.entryEngagement.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'eng-vote-1',
      type: 'vote',
    })

    const res = await POST(makeRequest(), mockParams)
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toContain('already voted')
  })

  it('returns 201 on successful vote', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: USER_CLERK_ID })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: USER_DB_ID })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      status: 'approved',
      contestId: CONTEST_ID,
      contest: { id: CONTEST_ID, status: 'voting' },
    })
    ;(db.entryEngagement.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(db.entryEngagement.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'eng-1' })
    ;(db.entryEngagement.groupBy as ReturnType<typeof vi.fn>).mockResolvedValue([
      { type: 'vote', _count: { type: 1 } },
    ])
    ;(db.contestEntry.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      contestId: CONTEST_ID,
      voteCount: 1,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      compositeScore: 3,
    })

    const res = await POST(makeRequest(), mockParams)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.voted).toBe(true)
    expect(json.voteCount).toBe(1)
  })
})
