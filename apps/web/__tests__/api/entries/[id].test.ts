import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@collabworld/db', () => ({
  db: {
    contestEntry: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: { findUnique: vi.fn() },
  },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

import { db } from '@collabworld/db'
import { auth } from '@clerk/nextjs/server'
import { GET, PATCH } from '@/app/api/v1/entries/[id]/route'

const BASE_URL = 'http://localhost/api/v1/entries'
const ENTRY_ID = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
const USER_ID_DB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
const OTHER_USER_ID = 'ffffffff-ffff-ffff-ffff-ffffffffffff'

const mockEntry = {
  id: ENTRY_ID,
  title: 'My Entry',
  description: 'Cool video',
  status: 'pending',
  creatorId: USER_ID_DB,
  creator: { id: USER_ID_DB },
  contest: { id: 'c1', title: 'Summer Contest', slug: 'summer-contest', status: 'active' },
}

function makeRequest(method: string, body?: object) {
  return new NextRequest(`${BASE_URL}/${ENTRY_ID}`, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'content-type': 'application/json' },
  })
}

const mockParams = { params: { id: ENTRY_ID } }

describe('PATCH /api/v1/entries/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_creator_123',
      sessionClaims: { publicMetadata: { role: 'creator' } },
    })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: USER_ID_DB })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockEntry)
    ;(db.contestEntry.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockEntry,
      title: 'Updated Title',
    })
  })

  it('returns 403 when patched by non-owner', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_other',
      sessionClaims: { publicMetadata: { role: 'creator' } },
    })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: OTHER_USER_ID })

    const req = makeRequest('PATCH', { title: 'New Title' })
    const res = await PATCH(req, mockParams)
    expect(res.status).toBe(403)
  })

  it('returns 400 when patching an approved entry', async () => {
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockEntry,
      status: 'approved',
    })

    const req = makeRequest('PATCH', { title: 'New Title' })
    const res = await PATCH(req, mockParams)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('already approved')
  })

  it('updates title and description for owner on pending entry', async () => {
    const req = makeRequest('PATCH', { title: 'Updated Title', description: 'New desc' })
    const res = await PATCH(req, mockParams)
    expect(res.status).toBe(200)
    expect(db.contestEntry.update).toHaveBeenCalled()
  })

  it('returns 401 when unauthenticated', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null, sessionClaims: null })
    const req = makeRequest('PATCH', { title: 'New Title' })
    const res = await PATCH(req, mockParams)
    expect(res.status).toBe(401)
  })

  it('returns 404 when entry not found', async () => {
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const req = makeRequest('PATCH', { title: 'New Title' })
    const res = await PATCH(req, mockParams)
    expect(res.status).toBe(404)
  })
})

describe('GET /api/v1/entries/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({
      userId: 'user_creator_123',
      sessionClaims: { publicMetadata: { role: 'creator' } },
    })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: USER_ID_DB })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockEntry,
      status: 'approved',
    })
  })

  it('returns approved entry publicly (no auth)', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null, sessionClaims: null })
    const req = makeRequest('GET')
    const res = await GET(req, mockParams)
    expect(res.status).toBe(200)
  })

  it('returns 401 for unauthenticated access to pending entry', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null, sessionClaims: null })
    ;(db.contestEntry.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockEntry,
      status: 'pending',
    })
    const req = makeRequest('GET')
    const res = await GET(req, mockParams)
    expect(res.status).toBe(401)
  })
})
