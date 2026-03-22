import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@collabworld/db', () => ({
  db: {
    user: { findUnique: vi.fn() },
    notification: { create: vi.fn() },
  },
}))

import { db } from '@collabworld/db'
import { createNotification } from '@/lib/notify'

const mockUserFindUnique = db.user.findUnique as ReturnType<typeof vi.fn>
const mockNotifCreate = db.notification.create as ReturnType<typeof vi.fn>

describe('createNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does nothing if user not found', async () => {
    mockUserFindUnique.mockResolvedValue(null)
    await createNotification({
      recipientClerkId: 'clerk_unknown',
      type: 'test',
      title: 'Test',
      body: 'Body',
    })
    expect(mockNotifCreate).not.toHaveBeenCalled()
  })

  it('creates notification for existing user', async () => {
    mockUserFindUnique.mockResolvedValue({ id: 'user-db-id' })
    mockNotifCreate.mockResolvedValue({ id: 'notif-id' })
    await createNotification({
      recipientClerkId: 'clerk_user_001',
      type: 'entry_approved',
      title: 'Approved!',
      body: 'Your entry was approved.',
    })
    expect(mockNotifCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-db-id',
        type: 'entry_approved',
        title: 'Approved!',
        body: 'Your entry was approved.',
        actionUrl: null,
      }),
    })
  })

  it('passes actionUrl when link is provided', async () => {
    mockUserFindUnique.mockResolvedValue({ id: 'user-db-id' })
    mockNotifCreate.mockResolvedValue({ id: 'notif-id' })
    await createNotification({
      recipientClerkId: 'clerk_user_001',
      type: 'contest_live',
      title: 'Live!',
      body: 'Contest is live.',
      link: 'https://collabworld.io/contests/1',
    })
    expect(mockNotifCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actionUrl: 'https://collabworld.io/contests/1',
      }),
    })
  })

  it('never throws even if db.notification.create fails', async () => {
    mockUserFindUnique.mockResolvedValue({ id: 'user-db-id' })
    mockNotifCreate.mockRejectedValue(new Error('DB failure'))
    await expect(
      createNotification({
        recipientClerkId: 'clerk_user_001',
        type: 'test',
        title: 'Test',
        body: 'Test body',
      })
    ).resolves.toBeUndefined()
  })

  it('never throws even if db.user.findUnique fails', async () => {
    mockUserFindUnique.mockRejectedValue(new Error('DB connection error'))
    await expect(
      createNotification({
        recipientClerkId: 'clerk_user_001',
        type: 'test',
        title: 'Test',
        body: 'Test body',
      })
    ).resolves.toBeUndefined()
  })
})
