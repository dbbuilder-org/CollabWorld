import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@collabworld/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({ userId: 'user_test123' })),
  currentUser: vi.fn(),
  clerkClient: vi.fn(),
}))

import { db } from '@collabworld/db'
import { auth } from '@clerk/nextjs/server'

async function getHandlers() {
  const mod = await import('@/app/api/v1/users/me/route')
  return { GET: mod.GET, PATCH: mod.PATCH }
}

const mockUser = {
  id: 'uuid-123',
  clerkId: 'user_test123',
  email: 'test@example.com',
  displayName: 'Test User',
  accountType: 'fan',
  bio: null,
  socialLinks: {},
  avatarUrl: null,
  isVerified: false,
  isActive: true,
  referralCode: 'REF123',
  createdAt: new Date(),
  updatedAt: new Date(),
  creatorProfile: null,
  influencerProfile: null,
  brandProfile: null,
}

describe('GET /api/v1/users/me', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null })
    const { GET } = await getHandlers()
    const req = new NextRequest('http://localhost/api/v1/users/me')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 404 when user not found in DB', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: 'user_test123' })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const { GET } = await getHandlers()
    const req = new NextRequest('http://localhost/api/v1/users/me')
    const res = await GET(req)
    expect(res.status).toBe(404)
  })

  it('returns user data when authenticated and found', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: 'user_test123' })
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser)
    const { GET } = await getHandlers()
    const req = new NextRequest('http://localhost/api/v1/users/me')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.email).toBe('test@example.com')
  })
})

describe('PATCH /api/v1/users/me', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: null })
    const { PATCH } = await getHandlers()
    const req = new NextRequest('http://localhost/api/v1/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ displayName: 'New Name' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await PATCH(req)
    expect(res.status).toBe(401)
  })

  it('returns 422 when validation fails', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: 'user_test123' })
    const { PATCH } = await getHandlers()
    const req = new NextRequest('http://localhost/api/v1/users/me', {
      method: 'PATCH',
      // displayName too short
      body: JSON.stringify({ displayName: '' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await PATCH(req)
    expect(res.status).toBe(422)
  })

  it('updates user when valid data provided', async () => {
    ;(auth as ReturnType<typeof vi.fn>).mockReturnValue({ userId: 'user_test123' })
    ;(db.user.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockUser,
      displayName: 'Updated Name',
    })
    const { PATCH } = await getHandlers()
    const req = new NextRequest('http://localhost/api/v1/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ displayName: 'Updated Name' }),
      headers: { 'content-type': 'application/json' },
    })
    const res = await PATCH(req)
    expect(res.status).toBe(200)
    expect(db.user.update).toHaveBeenCalledOnce()
  })
})
