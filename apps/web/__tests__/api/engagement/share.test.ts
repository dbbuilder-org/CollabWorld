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
    shareCode: {
      create: vi.fn(),
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

function makeRequest(body?: Record<string, unknown>) {
  return new NextRequest(`http://localhost/api/v1/entries/${ENTRY_ID}/share`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

const mockParams = { params: { id: ENTRY_ID } }

describe('POST /api/v1/entries/[id]/share', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(db.shareCode.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'sc-1', code: 'abcd1234' })
    ;(db.entryEngagement.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'share-1' })
    ;(db.entryEngagement.groupBy as ReturnType<typeof vi.fn>).mockResolvedValue([])
    ;(db.contestEntry.update as ReturnType<typeof vi.fn>).mockResolvedValue({ id: ENTRY_ID, shareCount: 1 })
  })

  it('returns 404 when entry not found', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    const res = await POST(makeRequest(), mockParams)
    expect(res.status).toBe(404)
  })

  it('returns shareUrl for unauthenticated user', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      status: 'approved',
      contestId: 'c1',
      shareCount: 0,
      contest: { slug: 'summer-jam' },
    })

    const res = await POST(makeRequest(), mockParams)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.shareUrl).toMatch(/\/s\/[0-9a-f]{8}/)
    expect(json.code).toHaveLength(8)
  })

  it('returns shareUrl and records engagement for authenticated user', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: USER_CLERK_ID })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: USER_DB_ID })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      status: 'approved',
      contestId: 'c1',
      shareCount: 0,
      contest: { slug: 'summer-jam' },
    })

    const res = await POST(makeRequest({ platform: 'tiktok' }), mockParams)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.shareUrl).toMatch(/\/s\/[0-9a-f]{8}/)
    expect(db.entryEngagement.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: 'share' }) })
    )
    expect(db.shareCode.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ platform: 'tiktok' }) })
    )
  })
})
