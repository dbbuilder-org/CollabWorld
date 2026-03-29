import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@collabworld/db', () => ({
  db: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
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

const BASE_USERS_URL = 'http://localhost/api/v1/admin/users'
const BASE_USER_ID_URL = 'http://localhost/api/v1/admin/users/uuid-user-001'

const mockUser = {
  id: 'uuid-user-001',
  clerkId: 'user_creator_123',
  email: 'creator@example.com',
  displayName: 'Test Creator',
  accountType: 'creator',
  isActive: true,
  isVerified: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
}

async function getListHandler() {
  const mod = await import('@/app/api/v1/admin/users/route')
  return mod.GET
}

async function getDetailHandlers() {
  const mod = await import('@/app/api/v1/admin/users/[id]/route')
  return { GET: mod.GET, PATCH: mod.PATCH }
}

describe('GET /api/v1/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    } as unknown as ReturnType<typeof auth>)
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockReturnValue({ userId: null, sessionClaims: null } as unknown as ReturnType<typeof auth>)
    const GET = await getListHandler()
    const req = new NextRequest(BASE_USERS_URL)
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 403 when not admin', async () => {
    vi.mocked(auth).mockReturnValue({
      userId: 'user_fan_123',
      sessionClaims: { publicMetadata: { role: 'fan' } },
    } as unknown as ReturnType<typeof auth>)
    const GET = await getListHandler()
    const req = new NextRequest(BASE_USERS_URL)
    const res = await GET(req)
    expect(res.status).toBe(403)
  })

  it('returns paginated users list', async () => {
    vi.mocked(db.user.findMany).mockResolvedValue([mockUser] as never)
    vi.mocked(db.user.count).mockResolvedValue(1)

    const GET = await getListHandler()
    const req = new NextRequest(BASE_USERS_URL)
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toHaveLength(1)
    expect(json.meta.total).toBe(1)
    expect(json.meta.page).toBe(1)
  })

  it('supports search filter', async () => {
    vi.mocked(db.user.findMany).mockResolvedValue([] as never)
    vi.mocked(db.user.count).mockResolvedValue(0)

    const GET = await getListHandler()
    const req = new NextRequest(`${BASE_USERS_URL}?search=creator`)
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(vi.mocked(db.user.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ OR: expect.any(Array) }),
      })
    )
  })

  it('supports accountType filter', async () => {
    vi.mocked(db.user.findMany).mockResolvedValue([] as never)
    vi.mocked(db.user.count).mockResolvedValue(0)

    const GET = await getListHandler()
    const req = new NextRequest(`${BASE_USERS_URL}?accountType=creator`)
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(vi.mocked(db.user.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ accountType: 'creator' }),
      })
    )
  })

  it('respects pagination parameters', async () => {
    vi.mocked(db.user.findMany).mockResolvedValue([] as never)
    vi.mocked(db.user.count).mockResolvedValue(50)

    const GET = await getListHandler()
    const req = new NextRequest(`${BASE_USERS_URL}?page=2&limit=10`)
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.meta.page).toBe(2)
    expect(json.meta.limit).toBe(10)
    expect(json.meta.totalPages).toBe(5)
  })

  it('returns 500 on DB error', async () => {
    vi.mocked(db.user.findMany).mockRejectedValue(new Error('DB error'))
    vi.mocked(db.user.count).mockRejectedValue(new Error('DB error'))

    const GET = await getListHandler()
    const req = new NextRequest(BASE_USERS_URL)
    const res = await GET(req)
    expect(res.status).toBe(500)
  })
})

describe('GET /api/v1/admin/users/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    } as unknown as ReturnType<typeof auth>)
  })

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth).mockReturnValue({ userId: null, sessionClaims: null } as unknown as ReturnType<typeof auth>)
    const { GET } = await getDetailHandlers()
    const req = new NextRequest(BASE_USER_ID_URL)
    const res = await GET(req, { params: { id: 'uuid-user-001' } })
    expect(res.status).toBe(401)
  })

  it('returns 403 for non-admin', async () => {
    vi.mocked(auth).mockReturnValue({
      userId: 'user_fan',
      sessionClaims: { publicMetadata: { role: 'fan' } },
    } as unknown as ReturnType<typeof auth>)
    const { GET } = await getDetailHandlers()
    const req = new NextRequest(BASE_USER_ID_URL)
    const res = await GET(req, { params: { id: 'uuid-user-001' } })
    expect(res.status).toBe(403)
  })

  it('returns 404 when user not found', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null)
    const { GET } = await getDetailHandlers()
    const req = new NextRequest(BASE_USER_ID_URL)
    const res = await GET(req, { params: { id: 'uuid-user-001' } })
    expect(res.status).toBe(404)
  })

  it('returns user detail', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as never)
    const { GET } = await getDetailHandlers()
    const req = new NextRequest(BASE_USER_ID_URL)
    const res = await GET(req, { params: { id: 'uuid-user-001' } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.email).toBe('creator@example.com')
  })
})

describe('PATCH /api/v1/admin/users/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockReturnValue({
      userId: 'user_admin_123',
      sessionClaims: { publicMetadata: { role: 'admin' } },
    } as unknown as ReturnType<typeof auth>)
  })

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth).mockReturnValue({ userId: null, sessionClaims: null } as unknown as ReturnType<typeof auth>)
    const { PATCH } = await getDetailHandlers()
    const req = new NextRequest(BASE_USER_ID_URL, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: false }),
    })
    const res = await PATCH(req, { params: { id: 'uuid-user-001' } })
    expect(res.status).toBe(401)
  })

  it('returns 404 when user not found', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(null)
    const { PATCH } = await getDetailHandlers()
    const req = new NextRequest(BASE_USER_ID_URL, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: false }),
    })
    const res = await PATCH(req, { params: { id: 'uuid-user-001' } })
    expect(res.status).toBe(404)
  })

  it('suspends a user (isActive: false)', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as never)
    vi.mocked(db.user.update).mockResolvedValue({ ...mockUser, isActive: false } as never)
    const { PATCH } = await getDetailHandlers()
    const req = new NextRequest(BASE_USER_ID_URL, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: false }),
    })
    const res = await PATCH(req, { params: { id: 'uuid-user-001' } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.isActive).toBe(false)
  })

  it('updates accountType', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValue(mockUser as never)
    vi.mocked(db.user.update).mockResolvedValue({ ...mockUser, accountType: 'influencer' } as never)
    const { PATCH } = await getDetailHandlers()
    const req = new NextRequest(BASE_USER_ID_URL, {
      method: 'PATCH',
      body: JSON.stringify({ accountType: 'influencer' }),
    })
    const res = await PATCH(req, { params: { id: 'uuid-user-001' } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.accountType).toBe('influencer')
  })

  it('rejects invalid accountType', async () => {
    const { PATCH } = await getDetailHandlers()
    const req = new NextRequest(BASE_USER_ID_URL, {
      method: 'PATCH',
      body: JSON.stringify({ accountType: 'superuser' }),
    })
    const res = await PATCH(req, { params: { id: 'uuid-user-001' } })
    expect(res.status).toBe(400)
  })

  it('returns 400 on invalid JSON', async () => {
    const { PATCH } = await getDetailHandlers()
    const req = new NextRequest(BASE_USER_ID_URL, {
      method: 'PATCH',
      body: 'not-json',
    })
    const res = await PATCH(req, { params: { id: 'uuid-user-001' } })
    expect(res.status).toBe(400)
  })
})
