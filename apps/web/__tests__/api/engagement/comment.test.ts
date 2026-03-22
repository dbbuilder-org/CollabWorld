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
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

import { db } from '@collabworld/db'
import { auth } from '@clerk/nextjs/server'
import { POST, GET } from '@/app/api/v1/entries/[id]/comment/route'

const ENTRY_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
const USER_CLERK_ID = 'user_clerk_123'
const USER_DB_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

function makePostRequest(body: object) {
  return new NextRequest(`http://localhost/api/v1/entries/${ENTRY_ID}/comment`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

function makeGetRequest(params?: Record<string, string>) {
  const url = new URL(`http://localhost/api/v1/entries/${ENTRY_ID}/comment`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  return new NextRequest(url.toString(), { method: 'GET' })
}

const mockParams = { params: { id: ENTRY_ID } }

describe('POST /api/v1/entries/[id]/comment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(db.entryEngagement.groupBy as ReturnType<typeof vi.fn>).mockResolvedValue([])
    ;(db.contestEntry.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      contestId: 'c1',
      voteCount: 0,
      likeCount: 0,
      commentCount: 1,
      shareCount: 0,
      compositeScore: 0.5,
    })
  })

  it('returns 401 when not authenticated', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null })

    const res = await POST(makePostRequest({ content: 'Hello' }), mockParams)
    expect(res.status).toBe(401)
  })

  it('returns 400 when content exceeds 500 chars', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: USER_CLERK_ID })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: USER_DB_ID })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      status: 'approved',
      contestId: 'c1',
    })

    const res = await POST(makePostRequest({ content: 'a'.repeat(501) }), mockParams)
    expect(res.status).toBe(400)
  })

  it('returns 400 for empty content', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: USER_CLERK_ID })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: USER_DB_ID })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      status: 'approved',
      contestId: 'c1',
    })

    const res = await POST(makePostRequest({ content: '' }), mockParams)
    expect(res.status).toBe(400)
  })

  it('returns 400 for profanity', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: USER_CLERK_ID })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: USER_DB_ID })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      status: 'approved',
      contestId: 'c1',
    })

    const res = await POST(makePostRequest({ content: 'This is spam content' }), mockParams)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('appropriate')
  })

  it('returns 201 on successful comment', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: USER_CLERK_ID })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: USER_DB_ID,
      displayName: 'Test User',
      avatarUrl: null,
    })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: ENTRY_ID,
      status: 'approved',
      contestId: 'c1',
    })
    ;(db.entryEngagement.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'comment-1',
      content: 'Great work!',
      createdAt: new Date('2026-01-01'),
      user: { displayName: 'Test User', avatarUrl: null },
    })
    ;(db.entryEngagement.groupBy as ReturnType<typeof vi.fn>).mockResolvedValue([
      { type: 'comment', _count: { type: 1 } },
    ])

    const res = await POST(makePostRequest({ content: 'Great work!' }), mockParams)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.content).toBe('Great work!')
  })
})

describe('GET /api/v1/entries/[id]/comments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null })
  })

  it('returns paginated comments', async () => {
    ;(db.entryEngagement.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 'c1',
        content: 'Nice!',
        createdAt: new Date('2026-01-01'),
        user: { displayName: 'User 1', avatarUrl: null },
      },
    ])
    ;(db.entryEngagement.count as ReturnType<typeof vi.fn>).mockResolvedValue(1)

    const res = await GET(makeGetRequest(), mockParams)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.items).toHaveLength(1)
    expect(json.total).toBe(1)
    expect(json.hasMore).toBe(false)
  })

  it('returns empty array when no comments', async () => {
    ;(db.entryEngagement.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([])
    ;(db.entryEngagement.count as ReturnType<typeof vi.fn>).mockResolvedValue(0)

    const res = await GET(makeGetRequest(), mockParams)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.items).toHaveLength(0)
    expect(json.hasMore).toBe(false)
  })
})
