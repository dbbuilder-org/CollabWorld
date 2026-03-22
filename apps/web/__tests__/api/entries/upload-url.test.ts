import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@collabworld/db', () => ({
  db: {
    contest: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
    contestEntry: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

vi.mock('@mux/mux-node', () => ({
  default: vi.fn(() => ({
    video: {
      uploads: {
        create: vi.fn().mockResolvedValue({ id: 'up_test', url: 'https://upload.mux.com/test' }),
      },
    },
  })),
}))

import { db } from '@collabworld/db'
import { auth } from '@clerk/nextjs/server'
import { POST } from '@/app/api/v1/entries/upload-url/route'

const BASE_URL = 'http://localhost/api/v1/entries/upload-url'

const CONTEST_UUID = '550e8400-e29b-41d4-a716-446655440000'

const validBody = {
  contestId: CONTEST_UUID,
  title: 'My Amazing Entry',
}

const mockContest = { id: CONTEST_UUID, status: 'active' }
const mockUser = { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' }
const mockEntry = { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc' }

function makeRequest(body: object) {
  return new NextRequest(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', origin: 'http://localhost:3000' },
  })
}

describe('POST /api/v1/entries/upload-url', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_creator_123',
      sessionClaims: { publicMetadata: { role: 'creator' } },
    })
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockContest)
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser)
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(db.contestEntry.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntry)
  })

  it('returns 401 when unauthenticated', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null, sessionClaims: null })
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(401)
  })

  it('returns 403 for non-creator role', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_fan_123',
      sessionClaims: { publicMetadata: { role: 'fan' } },
    })
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(403)
  })

  it('returns 400 if contest is not active', async () => {
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockContest,
      status: 'draft',
    })
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(400)
  })

  it('returns 404 if contest not found', async () => {
    ;(db.contest.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(404)
  })

  it('returns 409 if creator already has an entry', async () => {
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'existing-entry-id',
    })
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(409)
  })

  it('returns 201 with uploadUrl and entryId on success', async () => {
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.uploadUrl).toBeTruthy()
    expect(json.entryId).toBe(mockEntry.id)
  })
})
