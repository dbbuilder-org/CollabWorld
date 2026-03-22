import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@collabworld/db', () => ({
  db: {
    contest: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    contestEntry: {
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

vi.mock('@/lib/emailTriggers', () => ({
  sendContestGoLiveEmail: vi.fn().mockResolvedValue(undefined),
  sendVotingOpenEmail: vi.fn().mockResolvedValue(undefined),
  sendEntryApprovedEmail: vi.fn().mockResolvedValue(undefined),
  sendEntryRejectedEmail: vi.fn().mockResolvedValue(undefined),
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
}))

import { db } from '@collabworld/db'
import { auth } from '@clerk/nextjs/server'
import { sendContestGoLiveEmail, sendVotingOpenEmail } from '@/lib/emailTriggers'

const STATUS_URL = 'http://localhost/api/v1/admin/contests/uuid-contest-001/status'
const CONTESTS_URL = 'http://localhost/api/v1/contests'

const mockContest = {
  id: 'uuid-contest-001',
  title: 'Epic Music Contest',
  slug: 'epic-music-contest',
  description: 'A contest',
  status: 'upcoming',
  prizePoolTotal: 1000,
  entryDeadline: new Date('2026-04-01'),
  votingStart: new Date('2026-04-02'),
  votingEnd: new Date('2026-04-15'),
  contestEnd: new Date('2026-04-20'),
  maxEntries: null,
  createdById: 'uuid-admin-001',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  brandSponsorId: null,
  entries: [],
}

async function getStatusHandler() {
  const mod = await import('@/app/api/v1/admin/contests/[id]/status/route')
  return mod.PATCH
}

async function getContestsHandlers() {
  const mod = await import('@/app/api/v1/contests/route')
  return { GET: mod.GET, POST: mod.POST }
}

describe('PATCH /api/v1/admin/contests/[id]/status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    } as ReturnType<typeof auth>)
  })

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth).mockReturnValue({ userId: null, sessionClaims: null } as ReturnType<typeof auth>)
    const PATCH = await getStatusHandler()
    const req = new NextRequest(STATUS_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'active' }),
    })
    const res = await PATCH(req, { params: { id: 'uuid-contest-001' } })
    expect(res.status).toBe(401)
  })

  it('returns 403 for non-admin', async () => {
    vi.mocked(auth).mockReturnValue({
      userId: 'user_fan',
      sessionClaims: { publicMetadata: { role: 'creator' } },
    } as ReturnType<typeof auth>)
    const PATCH = await getStatusHandler()
    const req = new NextRequest(STATUS_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'active' }),
    })
    const res = await PATCH(req, { params: { id: 'uuid-contest-001' } })
    expect(res.status).toBe(403)
  })

  it('returns 404 when contest not found', async () => {
    vi.mocked(db.contest.findUnique).mockResolvedValue(null)
    const PATCH = await getStatusHandler()
    const req = new NextRequest(STATUS_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'active' }),
    })
    const res = await PATCH(req, { params: { id: 'uuid-contest-001' } })
    expect(res.status).toBe(404)
  })

  it('returns 400 for invalid transition', async () => {
    vi.mocked(db.contest.findUnique).mockResolvedValue({ ...mockContest, status: 'active' } as never)
    const PATCH = await getStatusHandler()
    const req = new NextRequest(STATUS_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'draft' }),
    })
    const res = await PATCH(req, { params: { id: 'uuid-contest-001' } })
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/Cannot transition/)
  })

  it('successfully transitions upcoming → active', async () => {
    vi.mocked(db.contest.findUnique).mockResolvedValue(mockContest as never)
    vi.mocked(db.contest.update).mockResolvedValue({ ...mockContest, status: 'active' } as never)
    const PATCH = await getStatusHandler()
    const req = new NextRequest(STATUS_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'active' }),
    })
    const res = await PATCH(req, { params: { id: 'uuid-contest-001' } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.status).toBe('active')
  })

  it('sends ContestGoLiveEmail when transitioning to active', async () => {
    vi.mocked(db.contest.findUnique).mockResolvedValue(mockContest as never)
    vi.mocked(db.contest.update).mockResolvedValue({ ...mockContest, status: 'active' } as never)
    const PATCH = await getStatusHandler()
    const req = new NextRequest(STATUS_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'active' }),
    })
    await PATCH(req, { params: { id: 'uuid-contest-001' } })
    expect(sendContestGoLiveEmail).toHaveBeenCalledWith(
      expect.objectContaining({ contestTitle: 'Epic Music Contest' })
    )
  })

  it('sends VotingOpenEmail when transitioning to voting', async () => {
    const activeContest = {
      ...mockContest,
      status: 'active',
      entries: [
        {
          id: 'entry-1',
          creator: { email: 'creator@example.com' },
        },
      ],
    }
    vi.mocked(db.contest.findUnique).mockResolvedValue(activeContest as never)
    vi.mocked(db.contest.update).mockResolvedValue({ ...activeContest, status: 'voting' } as never)
    const PATCH = await getStatusHandler()
    const req = new NextRequest(STATUS_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'voting' }),
    })
    await PATCH(req, { params: { id: 'uuid-contest-001' } })
    expect(sendVotingOpenEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: ['creator@example.com'] })
    )
  })

  it('returns 400 on invalid status value', async () => {
    const PATCH = await getStatusHandler()
    const req = new NextRequest(STATUS_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'invalidstatus' }),
    })
    const res = await PATCH(req, { params: { id: 'uuid-contest-001' } })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/v1/contests (admin create)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    } as ReturnType<typeof auth>)
  })

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth).mockReturnValue({ userId: null, sessionClaims: null } as ReturnType<typeof auth>)
    const { POST } = await getContestsHandlers()
    const req = new NextRequest(CONTESTS_URL, {
      method: 'POST',
      body: JSON.stringify({ title: 'Test' }),
    })
    const res = await POST!(req)
    expect(res.status).toBe(401)
  })

  it('returns 403 for non-admin', async () => {
    vi.mocked(auth).mockReturnValue({
      userId: 'user_fan',
      sessionClaims: { publicMetadata: { role: 'fan' } },
    } as ReturnType<typeof auth>)
    const { POST } = await getContestsHandlers()
    const req = new NextRequest(CONTESTS_URL, {
      method: 'POST',
      body: JSON.stringify({ title: 'Test' }),
    })
    const res = await POST!(req)
    expect(res.status).toBe(403)
  })

  it('returns 400 for missing required fields', async () => {
    const { POST } = await getContestsHandlers()
    const req = new NextRequest(CONTESTS_URL, {
      method: 'POST',
      body: JSON.stringify({ title: 'Test' }),
    })
    const res = await POST!(req)
    expect(res.status).toBe(400)
  })

  it('creates a contest with status DRAFT', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'uuid-admin-001' } as never)
    vi.mocked(db.contest.findUnique).mockResolvedValue(null) // slug not taken
    vi.mocked(db.contest.create).mockResolvedValue({ ...mockContest, status: 'draft' } as never)

    const { POST } = await getContestsHandlers()
    const req = new NextRequest(CONTESTS_URL, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Epic Music Contest',
        description: 'A contest',
        entryDeadline: '2026-04-01T00:00:00.000Z',
        votingStart: '2026-04-02T00:00:00.000Z',
        votingEnd: '2026-04-15T00:00:00.000Z',
        contestEnd: '2026-04-20T00:00:00.000Z',
      }),
    })
    const res = await POST!(req)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.data.status).toBe('draft')
  })

  it('creates a contest with prizes', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'uuid-admin-001' } as never)
    vi.mocked(db.contest.findUnique).mockResolvedValue(null)
    vi.mocked(db.contest.create).mockResolvedValue({
      ...mockContest,
      status: 'draft',
      prizes: [{ rank: 1, prizeAmount: 500 }],
    } as never)

    const { POST } = await getContestsHandlers()
    const req = new NextRequest(CONTESTS_URL, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Music Prize Contest',
        entryDeadline: '2026-04-01T00:00:00.000Z',
        votingStart: '2026-04-02T00:00:00.000Z',
        votingEnd: '2026-04-15T00:00:00.000Z',
        contestEnd: '2026-04-20T00:00:00.000Z',
        prizes: [{ rank: 1, description: '1st place $500', value: 500 }],
      }),
    })
    const res = await POST!(req)
    expect(res.status).toBe(201)
  })

  it('returns 400 on invalid JSON body', async () => {
    const { POST } = await getContestsHandlers()
    const req = new NextRequest(CONTESTS_URL, {
      method: 'POST',
      body: 'not-json',
    })
    const res = await POST!(req)
    expect(res.status).toBe(400)
  })
})
