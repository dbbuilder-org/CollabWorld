import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@collabworld/db', () => ({
  db: {
    contestEntry: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

import { db } from '@collabworld/db'
import { auth } from '@clerk/nextjs/server'
import { PATCH } from '@/app/api/v1/admin/entries/[id]/review/route'

const ENTRY_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
const BASE_URL = `http://localhost/api/v1/admin/entries/${ENTRY_ID}/review`

const mockEntry = {
  id: ENTRY_ID,
  title: 'Test Entry',
  creatorId: 'creator-uuid-001',
  contestId: 'contest-uuid-001',
  status: 'pending',
}

function makeRequest(body: object) {
  return new NextRequest(BASE_URL, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

const mockParams = { params: { id: ENTRY_ID } }

describe('PATCH /api/v1/admin/entries/[id]/review', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntry)
    ;(db.contestEntry.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockEntry,
      status: 'approved',
    })
    ;(db.notification.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'notif-001' })
  })

  it('returns 403 for non-admin', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_creator_123',
      sessionClaims: { publicMetadata: { role: 'creator' } },
    })
    const res = await PATCH(makeRequest({ action: 'approve' }), mockParams)
    expect(res.status).toBe(403)
  })

  it('returns 401 when unauthenticated', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null, sessionClaims: null })
    const res = await PATCH(makeRequest({ action: 'approve' }), mockParams)
    expect(res.status).toBe(401)
  })

  it('returns 404 when entry not found', async () => {
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const res = await PATCH(makeRequest({ action: 'approve' }), mockParams)
    expect(res.status).toBe(404)
  })

  it('returns 400 when rejecting without reason', async () => {
    const res = await PATCH(makeRequest({ action: 'reject' }), mockParams)
    expect(res.status).toBe(400)
  })

  it('approves entry and creates notification', async () => {
    const res = await PATCH(makeRequest({ action: 'approve' }), mockParams)
    expect(res.status).toBe(200)

    expect(db.contestEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'approved' }),
      })
    )
    expect(db.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: mockEntry.creatorId,
          title: 'Your entry has been approved!',
        }),
      })
    )
  })

  it('rejects entry with reason and creates notification', async () => {
    ;(db.contestEntry.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockEntry,
      status: 'rejected',
      rejectionReason: 'Does not meet content guidelines',
    })

    const res = await PATCH(
      makeRequest({ action: 'reject', reason: 'Does not meet content guidelines' }),
      mockParams
    )
    expect(res.status).toBe(200)

    expect(db.contestEntry.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'rejected',
          rejectionReason: 'Does not meet content guidelines',
        }),
      })
    )
    expect(db.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: mockEntry.creatorId,
          body: 'Does not meet content guidelines',
        }),
      })
    )
  })
})
