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
    limit: vi.fn().mockResolvedValue({ success: true, remaining: 29 }),
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
import { POST } from '@/app/api/v1/entries/[id]/share/route'

const ENTRY_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
const USER_CLERK_ID = 'user_clerk_123'
const USER_DB_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

function makeRequest() {
  return new NextRequest(`http://localhost/api/v1/entries/${ENTRY_ID}/share`, {
    method: 'POST',
  })
}

const mockParams = { params: { id: ENTRY_ID } }

describe('POST /api/v1/entries/[id]/share', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(db.entryEngagement.groupBy as ReturnType<typeof vi.fn>).mockResolvedValue([])
    ;(db.contestEntry.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      contestId: 'c1',
      voteCount: 0,
      likeCount: 0,
      commentCount: 0,
      shareCount: 1,
      compositeScore: 2,
    })
  })

  it('returns 401 when not authenticated', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null })

    const res = await POST(makeRequest(), mockParams)
    expect(res.status).toBe(401)
  })

  it('returns 404 when entry not found', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: USER_CLERK_ID })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: USER_DB_ID, referralCode: 'REF123' })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const res = await POST(makeRequest(), mockParams)
    expect(res.status).toBe(404)
  })

  it('returns shareUrl on success', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: USER_CLERK_ID })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: USER_DB_ID,
      referralCode: 'REF123',
    })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      status: 'approved',
      contestId: 'c1',
      shareCount: 0,
      contest: { slug: 'summer-jam' },
    })
    ;(db.entryEngagement.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'share-1' })
    ;(db.entryEngagement.groupBy as ReturnType<typeof vi.fn>).mockResolvedValue([
      { type: 'share', _count: { type: 1 } },
    ])

    const res = await POST(makeRequest(), mockParams)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.shareUrl).toContain(ENTRY_ID)
    expect(json.shareUrl).toContain('REF123')
    expect(json.shareUrl).toContain('collabworld')
  })
})
