import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@collabworld/db', () => ({
  db: {
    user: { findUnique: vi.fn() },
    notification: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

import { db } from '@collabworld/db'
import { auth } from '@clerk/nextjs/server'

const mockAuth = auth as ReturnType<typeof vi.fn>
const mockUserFindUnique = db.user.findUnique as ReturnType<typeof vi.fn>
const mockNotifFindMany = db.notification.findMany as ReturnType<typeof vi.fn>
const mockNotifFindUnique = db.notification.findUnique as ReturnType<typeof vi.fn>
const mockNotifUpdate = db.notification.update as ReturnType<typeof vi.fn>
const mockNotifUpdateMany = db.notification.updateMany as ReturnType<typeof vi.fn>

function makeRequest(url: string, method = 'GET'): NextRequest {
  return new NextRequest(`http://localhost${url}`, { method })
}

describe('GET /api/v1/notifications', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockReturnValue({ userId: null })
    const { GET } = await import('@/app/api/v1/notifications/route')
    const res = await GET(makeRequest('/api/v1/notifications'))
    expect(res.status).toBe(401)
  })

  it('returns 404 when user not in DB', async () => {
    mockAuth.mockReturnValue({ userId: 'clerk_user_001' })
    mockUserFindUnique.mockResolvedValue(null)
    const { GET } = await import('@/app/api/v1/notifications/route')
    const res = await GET(makeRequest('/api/v1/notifications'))
    expect(res.status).toBe(404)
  })

  it('returns 200 with notifications list', async () => {
    mockAuth.mockReturnValue({ userId: 'clerk_user_001' })
    mockUserFindUnique.mockResolvedValue({ id: 'user-db-id' })
    mockNotifFindMany.mockResolvedValue([
      { id: 'n1', title: 'Hello', body: 'World', readAt: null, createdAt: new Date() },
    ])
    const { GET } = await import('@/app/api/v1/notifications/route')
    const res = await GET(makeRequest('/api/v1/notifications'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data).toHaveLength(1)
  })

  it('filters by unreadOnly=true query param', async () => {
    mockAuth.mockReturnValue({ userId: 'clerk_user_001' })
    mockUserFindUnique.mockResolvedValue({ id: 'user-db-id' })
    mockNotifFindMany.mockResolvedValue([])
    const { GET } = await import('@/app/api/v1/notifications/route')
    const res = await GET(makeRequest('/api/v1/notifications?unreadOnly=true'))
    expect(res.status).toBe(200)
    expect(mockNotifFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ readAt: null }),
      })
    )
  })

  it('does not filter when unreadOnly is not set', async () => {
    mockAuth.mockReturnValue({ userId: 'clerk_user_001' })
    mockUserFindUnique.mockResolvedValue({ id: 'user-db-id' })
    mockNotifFindMany.mockResolvedValue([])
    const { GET } = await import('@/app/api/v1/notifications/route')
    await GET(makeRequest('/api/v1/notifications'))
    const callArgs = mockNotifFindMany.mock.calls[0]![0]
    expect(callArgs.where).not.toHaveProperty('readAt')
  })
})

describe('PATCH /api/v1/notifications/[id]/read', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockReturnValue({ userId: null })
    const { PATCH } = await import('@/app/api/v1/notifications/[id]/read/route')
    const res = await PATCH(makeRequest('/api/v1/notifications/n1/read', 'PATCH'), {
      params: { id: 'n1' },
    })
    expect(res.status).toBe(401)
  })

  it('returns 404 when user not in DB', async () => {
    mockAuth.mockReturnValue({ userId: 'clerk_user_001' })
    mockUserFindUnique.mockResolvedValue(null)
    const { PATCH } = await import('@/app/api/v1/notifications/[id]/read/route')
    const res = await PATCH(makeRequest('/api/v1/notifications/n1/read', 'PATCH'), {
      params: { id: 'n1' },
    })
    expect(res.status).toBe(404)
  })

  it('returns 404 when notification not found', async () => {
    mockAuth.mockReturnValue({ userId: 'clerk_user_001' })
    mockUserFindUnique.mockResolvedValue({ id: 'user-db-id' })
    mockNotifFindUnique.mockResolvedValue(null)
    const { PATCH } = await import('@/app/api/v1/notifications/[id]/read/route')
    const res = await PATCH(makeRequest('/api/v1/notifications/n99/read', 'PATCH'), {
      params: { id: 'n99' },
    })
    expect(res.status).toBe(404)
  })

  it('returns 403 when notification belongs to different user', async () => {
    mockAuth.mockReturnValue({ userId: 'clerk_user_001' })
    mockUserFindUnique.mockResolvedValue({ id: 'user-db-id' })
    mockNotifFindUnique.mockResolvedValue({ id: 'n1', userId: 'other-user-id' })
    const { PATCH } = await import('@/app/api/v1/notifications/[id]/read/route')
    const res = await PATCH(makeRequest('/api/v1/notifications/n1/read', 'PATCH'), {
      params: { id: 'n1' },
    })
    expect(res.status).toBe(403)
  })

  it('marks notification as read and returns 200', async () => {
    mockAuth.mockReturnValue({ userId: 'clerk_user_001' })
    mockUserFindUnique.mockResolvedValue({ id: 'user-db-id' })
    mockNotifFindUnique.mockResolvedValue({ id: 'n1', userId: 'user-db-id' })
    mockNotifUpdate.mockResolvedValue({ id: 'n1', readAt: new Date() })
    const { PATCH } = await import('@/app/api/v1/notifications/[id]/read/route')
    const res = await PATCH(makeRequest('/api/v1/notifications/n1/read', 'PATCH'), {
      params: { id: 'n1' },
    })
    expect(res.status).toBe(200)
    expect(mockNotifUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'n1' } })
    )
  })
})

describe('POST /api/v1/notifications/mark-all-read', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockReturnValue({ userId: null })
    const { POST } = await import('@/app/api/v1/notifications/mark-all-read/route')
    const res = await POST(makeRequest('/api/v1/notifications/mark-all-read', 'POST'))
    expect(res.status).toBe(401)
  })

  it('returns 404 when user not in DB', async () => {
    mockAuth.mockReturnValue({ userId: 'clerk_user_001' })
    mockUserFindUnique.mockResolvedValue(null)
    const { POST } = await import('@/app/api/v1/notifications/mark-all-read/route')
    const res = await POST(makeRequest('/api/v1/notifications/mark-all-read', 'POST'))
    expect(res.status).toBe(404)
  })

  it('marks all unread notifications as read and returns count', async () => {
    mockAuth.mockReturnValue({ userId: 'clerk_user_001' })
    mockUserFindUnique.mockResolvedValue({ id: 'user-db-id' })
    mockNotifUpdateMany.mockResolvedValue({ count: 5 })
    const { POST } = await import('@/app/api/v1/notifications/mark-all-read/route')
    const res = await POST(makeRequest('/api/v1/notifications/mark-all-read', 'POST'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.count).toBe(5)
  })

  it('returns count of 0 when no unread notifications', async () => {
    mockAuth.mockReturnValue({ userId: 'clerk_user_001' })
    mockUserFindUnique.mockResolvedValue({ id: 'user-db-id' })
    mockNotifUpdateMany.mockResolvedValue({ count: 0 })
    const { POST } = await import('@/app/api/v1/notifications/mark-all-read/route')
    const res = await POST(makeRequest('/api/v1/notifications/mark-all-read', 'POST'))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.data.count).toBe(0)
  })

  it('calls updateMany with readAt: null filter', async () => {
    mockAuth.mockReturnValue({ userId: 'clerk_user_001' })
    mockUserFindUnique.mockResolvedValue({ id: 'user-db-id' })
    mockNotifUpdateMany.mockResolvedValue({ count: 3 })
    const { POST } = await import('@/app/api/v1/notifications/mark-all-read/route')
    await POST(makeRequest('/api/v1/notifications/mark-all-read', 'POST'))
    expect(mockNotifUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ readAt: null }),
      })
    )
  })
})
