import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@collabworld/db', () => ({
  db: {
    contestEntry: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    notification: {
      create: vi.fn(),
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

vi.mock('@/lib/emailTriggers', () => ({
  sendEntryApprovedEmail: vi.fn().mockResolvedValue(undefined),
  sendEntryRejectedEmail: vi.fn().mockResolvedValue(undefined),
  sendContestGoLiveEmail: vi.fn().mockResolvedValue(undefined),
  sendVotingOpenEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/notify', () => ({
  createNotification: vi.fn().mockResolvedValue(undefined),
}))

import { db } from '@collabworld/db'
import { auth } from '@clerk/nextjs/server'
import { sendEntryApprovedEmail, sendEntryRejectedEmail } from '@/lib/emailTriggers'
import { createNotification } from '@/lib/notify'

const ENTRY_URL = 'http://localhost/api/v1/admin/entries/uuid-entry-001'
const BULK_URL = 'http://localhost/api/v1/admin/entries/bulk'

const mockEntry = {
  id: 'uuid-entry-001',
  contestId: 'uuid-contest-001',
  creatorId: 'uuid-user-001',
  title: 'My Awesome Entry',
  status: 'pending',
  rejectionReason: null,
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-15'),
  creator: {
    clerkId: 'user_creator_123',
    email: 'creator@example.com',
    displayName: 'Test Creator',
  },
  contest: {
    title: 'Epic Music Contest',
    slug: 'epic-music-contest',
  },
}

async function getEntryHandler() {
  const mod = await import('@/app/api/v1/admin/entries/[id]/route')
  return mod.PATCH
}

async function getBulkHandler() {
  const mod = await import('@/app/api/v1/admin/entries/bulk/route')
  return mod.POST
}

describe('PATCH /api/v1/admin/entries/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    } as ReturnType<typeof auth>)
  })

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth).mockReturnValue({ userId: null, sessionClaims: null } as ReturnType<typeof auth>)
    const PATCH = await getEntryHandler()
    const req = new NextRequest(ENTRY_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'approved' }),
    })
    const res = await PATCH(req, { params: { id: 'uuid-entry-001' } })
    expect(res.status).toBe(401)
  })

  it('returns 403 for non-admin', async () => {
    vi.mocked(auth).mockReturnValue({
      userId: 'user_fan',
      sessionClaims: { publicMetadata: { role: 'creator' } },
    } as ReturnType<typeof auth>)
    const PATCH = await getEntryHandler()
    const req = new NextRequest(ENTRY_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'approved' }),
    })
    const res = await PATCH(req, { params: { id: 'uuid-entry-001' } })
    expect(res.status).toBe(403)
  })

  it('returns 404 when entry not found', async () => {
    vi.mocked(db.contestEntry.findUnique).mockResolvedValue(null)
    const PATCH = await getEntryHandler()
    const req = new NextRequest(ENTRY_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'approved' }),
    })
    const res = await PATCH(req, { params: { id: 'uuid-entry-001' } })
    expect(res.status).toBe(404)
  })

  it('approves an entry and sends email', async () => {
    vi.mocked(db.contestEntry.findUnique).mockResolvedValue(mockEntry as never)
    vi.mocked(db.contestEntry.update).mockResolvedValue({ ...mockEntry, status: 'approved' } as never)
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'uuid-user-001' } as never)

    const PATCH = await getEntryHandler()
    const req = new NextRequest(ENTRY_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'approved' }),
    })
    const res = await PATCH(req, { params: { id: 'uuid-entry-001' } })
    expect(res.status).toBe(200)
    expect(sendEntryApprovedEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'creator@example.com' })
    )
  })

  it('creates notification on approval', async () => {
    vi.mocked(db.contestEntry.findUnique).mockResolvedValue(mockEntry as never)
    vi.mocked(db.contestEntry.update).mockResolvedValue({ ...mockEntry, status: 'approved' } as never)
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'uuid-user-001' } as never)

    const PATCH = await getEntryHandler()
    const req = new NextRequest(ENTRY_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'approved' }),
    })
    await PATCH(req, { params: { id: 'uuid-entry-001' } })
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'entry_approved' })
    )
  })

  it('rejects an entry with reason', async () => {
    vi.mocked(db.contestEntry.findUnique).mockResolvedValue(mockEntry as never)
    vi.mocked(db.contestEntry.update).mockResolvedValue({
      ...mockEntry,
      status: 'rejected',
      rejectionReason: 'Violates guidelines',
    } as never)
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'uuid-user-001' } as never)

    const PATCH = await getEntryHandler()
    const req = new NextRequest(ENTRY_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'rejected', reason: 'Violates guidelines' }),
    })
    const res = await PATCH(req, { params: { id: 'uuid-entry-001' } })
    expect(res.status).toBe(200)
    expect(sendEntryRejectedEmail).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'Violates guidelines' })
    )
  })

  it('creates notification on rejection', async () => {
    vi.mocked(db.contestEntry.findUnique).mockResolvedValue(mockEntry as never)
    vi.mocked(db.contestEntry.update).mockResolvedValue({ ...mockEntry, status: 'rejected' } as never)
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'uuid-user-001' } as never)

    const PATCH = await getEntryHandler()
    const req = new NextRequest(ENTRY_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'rejected' }),
    })
    await PATCH(req, { params: { id: 'uuid-entry-001' } })
    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'entry_rejected' })
    )
  })

  it('returns 400 for invalid status', async () => {
    const PATCH = await getEntryHandler()
    const req = new NextRequest(ENTRY_URL, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'pending' }),
    })
    const res = await PATCH(req, { params: { id: 'uuid-entry-001' } })
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid JSON', async () => {
    const PATCH = await getEntryHandler()
    const req = new NextRequest(ENTRY_URL, {
      method: 'PATCH',
      body: 'not-json',
    })
    const res = await PATCH(req, { params: { id: 'uuid-entry-001' } })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/v1/admin/entries/bulk', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    } as ReturnType<typeof auth>)
  })

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth).mockReturnValue({ userId: null, sessionClaims: null } as ReturnType<typeof auth>)
    const POST = await getBulkHandler()
    const req = new NextRequest(BULK_URL, {
      method: 'POST',
      body: JSON.stringify({ entryIds: ['uuid-entry-001'], action: 'approve' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 403 for non-admin', async () => {
    vi.mocked(auth).mockReturnValue({
      userId: 'user_fan',
      sessionClaims: { publicMetadata: { role: 'creator' } },
    } as ReturnType<typeof auth>)
    const POST = await getBulkHandler()
    const req = new NextRequest(BULK_URL, {
      method: 'POST',
      body: JSON.stringify({ entryIds: ['uuid-entry-001'], action: 'approve' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(403)
  })

  it('returns 400 for empty entryIds', async () => {
    const POST = await getBulkHandler()
    const req = new NextRequest(BULK_URL, {
      method: 'POST',
      body: JSON.stringify({ entryIds: [], action: 'approve' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for more than 100 entries', async () => {
    const POST = await getBulkHandler()
    const entryIds = Array.from({ length: 101 }, (_, i) => `uuid-entry-${i}`)
    const req = new NextRequest(BULK_URL, {
      method: 'POST',
      body: JSON.stringify({ entryIds, action: 'approve' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('bulk approves entries', async () => {
    const entries = [
      { ...mockEntry, id: 'entry-1' },
      { ...mockEntry, id: 'entry-2' },
    ]
    vi.mocked(db.contestEntry.findMany).mockResolvedValue(entries as never)
    vi.mocked(db.$transaction).mockResolvedValue([
      { ...entries[0], status: 'approved' },
      { ...entries[1], status: 'approved' },
    ] as never)
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'uuid-user-001' } as never)

    const POST = await getBulkHandler()
    const req = new NextRequest(BULK_URL, {
      method: 'POST',
      body: JSON.stringify({ entryIds: ['entry-1', 'entry-2'], action: 'approve' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.processed).toBe(2)
  })

  it('bulk rejects entries with reason', async () => {
    const entries = [{ ...mockEntry, id: 'entry-1' }]
    vi.mocked(db.contestEntry.findMany).mockResolvedValue(entries as never)
    vi.mocked(db.$transaction).mockResolvedValue([{ ...entries[0], status: 'rejected' }] as never)
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'uuid-user-001' } as never)

    const POST = await getBulkHandler()
    const req = new NextRequest(BULK_URL, {
      method: 'POST',
      body: JSON.stringify({ entryIds: ['entry-1'], action: 'reject', reason: 'Poor quality' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })

  it('sends emails for each entry in bulk approve', async () => {
    const entries = [
      { ...mockEntry, id: 'entry-1' },
      { ...mockEntry, id: 'entry-2', creator: { ...mockEntry.creator, email: 'creator2@example.com' } },
    ]
    vi.mocked(db.contestEntry.findMany).mockResolvedValue(entries as never)
    vi.mocked(db.$transaction).mockResolvedValue(entries.map((e) => ({ ...e, status: 'approved' })) as never)
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'uuid-user-001' } as never)

    const POST = await getBulkHandler()
    const req = new NextRequest(BULK_URL, {
      method: 'POST',
      body: JSON.stringify({ entryIds: ['entry-1', 'entry-2'], action: 'approve' }),
    })
    await POST(req)
    expect(sendEntryApprovedEmail).toHaveBeenCalledTimes(2)
  })

  it('returns 400 for invalid action', async () => {
    const POST = await getBulkHandler()
    const req = new NextRequest(BULK_URL, {
      method: 'POST',
      body: JSON.stringify({ entryIds: ['entry-1'], action: 'delete' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns errors array in response', async () => {
    const entries = [{ ...mockEntry, id: 'entry-1' }]
    vi.mocked(db.contestEntry.findMany).mockResolvedValue(entries as never)
    vi.mocked(db.$transaction).mockResolvedValue([{ ...entries[0], status: 'approved' }] as never)
    vi.mocked(db.user.findUnique).mockResolvedValue({ id: 'uuid-user-001' } as never)

    const POST = await getBulkHandler()
    const req = new NextRequest(BULK_URL, {
      method: 'POST',
      body: JSON.stringify({ entryIds: ['entry-1'], action: 'approve' }),
    })
    const res = await POST(req)
    const json = await res.json()
    expect(json).toHaveProperty('errors')
    expect(Array.isArray(json.errors)).toBe(true)
  })
})
