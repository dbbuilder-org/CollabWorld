import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@collabworld/db', () => ({
  db: {
    user: { findUnique: vi.fn() },
    contest: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
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

const BASE_URL = 'http://localhost/api/v1/admin/contests'

const validBody = {
  title: 'Epic Music Contest',
  description: 'Submit your best track',
  entryDeadline: '2026-04-01T00:00:00.000Z',
  votingStart: '2026-04-15T00:00:00.000Z',
  votingEnd: '2026-04-22T00:00:00.000Z',
  contestEnd: '2026-04-30T00:00:00.000Z',
  prizes: [
    { rank: 1, prizeAmount: 5000, description: 'First place' },
    { rank: 2, prizeAmount: 2000 },
  ],
}

const mockAdminUser = {
  id: 'uuid-admin-001',
  clerkId: 'user_admin_123',
  email: 'admin@collabworld.io',
  accountType: 'admin',
}

const mockCreatedContest = {
  id: 'uuid-contest-001',
  title: 'Epic Music Contest',
  slug: 'epic-music-contest',
  status: 'draft',
  prizePoolTotal: 7000,
  prizes: [
    { id: 'p1', rank: 1, prizeAmount: 5000 },
    { id: 'p2', rank: 2, prizeAmount: 2000 },
  ],
}

async function getHandlers() {
  const mod = await import('@/app/api/v1/admin/contests/route')
  return { POST: mod.POST, GET: mod.GET }
}

describe('POST /api/v1/admin/contests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 401 when not authenticated', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null, sessionClaims: null })
    const { POST } = await getHandlers()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 403 when not admin', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_fan_123',
      sessionClaims: { publicMetadata: { role: 'fan' } },
    })
    const { POST } = await getHandlers()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('returns 400 when required fields are missing', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    const { POST } = await getHandlers()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({ title: 'No dates' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when title is too short', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    const { POST } = await getHandlers()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify({ ...validBody, title: 'Hi' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when votingStart is not after entryDeadline', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    const { POST } = await getHandlers()
    const badBody = {
      ...validBody,
      votingStart: '2026-03-01T00:00:00.000Z', // before entryDeadline
    }
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(badBody),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('votingStart must be after entryDeadline')
  })

  it('returns 201 with created contest on valid input', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockAdminUser)
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null) // slug not taken
    ;(db.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn: (tx: typeof db) => Promise<unknown>) => fn(db))
    ;(db.contest.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreatedContest)

    const { POST } = await getHandlers()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.data.slug).toBe('epic-music-contest')
  })

  it('appends -2 suffix when slug is already taken', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockAdminUser)
    // First call: slug taken, second call: slug-2 not taken
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ id: 'existing' })
      .mockResolvedValueOnce(null)
    ;(db.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn: (tx: typeof db) => Promise<unknown>) => fn(db))
    ;(db.contest.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockCreatedContest,
      slug: 'epic-music-contest-2',
    })

    const { POST } = await getHandlers()
    const req = new NextRequest(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(validBody),
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.data.slug).toBe('epic-music-contest-2')
  })
})

describe('GET /api/v1/admin/contests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 401 when not authenticated', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null, sessionClaims: null })
    const { GET } = await getHandlers()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 403 when not admin', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_fan_123',
      sessionClaims: { publicMetadata: { role: 'fan' } },
    })
    const { GET } = await getHandlers()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req)
    expect(res.status).toBe(403)
  })

  it('returns all contests for admin', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    ;(db.contest.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([mockCreatedContest])
    const { GET } = await getHandlers()
    const req = new NextRequest(BASE_URL)
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toHaveLength(1)
  })
})
