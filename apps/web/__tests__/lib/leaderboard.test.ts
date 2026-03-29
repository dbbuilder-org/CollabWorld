import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(() => ({
    zadd: vi.fn(),
    zrange: vi.fn(),
    del: vi.fn(),
  })),
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn(() => ({
    limit: vi.fn().mockResolvedValue({ success: true, remaining: 59 }),
  })),
}))

import { computeContestScore } from '@/lib/contest'
import { updateEntryScore, getContestLeaderboard, snapshotLeaderboard } from '@/lib/leaderboard'

const mockDb = {
  entryEngagement: {
    groupBy: vi.fn(),
    findMany: vi.fn(),
  },
  contestEntry: {
    update: vi.fn(),
    findMany: vi.fn(),
  },
  contest: {
    findUnique: vi.fn(),
  },
}

const mockRedis = {
  zadd: vi.fn(),
  zrange: vi.fn(),
  del: vi.fn(),
}

const ENTRY_ID = 'entry-1'
const CONTEST_ID = 'contest-1'

describe('computeContestScore', () => {
  it('computes score: votes*3 + likes*1 + comments*0.5 + shares*2', () => {
    expect(computeContestScore(10, 20, 5, 3)).toBe(58.5)
    expect(computeContestScore(0, 0, 0, 0)).toBe(0)
    expect(computeContestScore(1, 0, 0, 0)).toBe(3)
    expect(computeContestScore(0, 1, 0, 0)).toBe(1)
    expect(computeContestScore(0, 0, 2, 0)).toBe(1)
    expect(computeContestScore(0, 0, 0, 1)).toBe(2)
  })
})

describe('updateEntryScore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('aggregates engagements and updates entry score', async () => {
    mockDb.entryEngagement.groupBy.mockResolvedValue([
      { type: 'vote', _count: { type: 10 } },
      { type: 'like', _count: { type: 20 } },
      { type: 'comment', _count: { type: 5 } },
      { type: 'share', _count: { type: 3 } },
    ])
    mockDb.contestEntry.update.mockResolvedValue({
      id: ENTRY_ID,
      contestId: CONTEST_ID,
      compositeScore: 58.5,
      voteCount: 10,
      likeCount: 20,
      commentCount: 5,
      shareCount: 3,
    })

    const score = await updateEntryScore(ENTRY_ID, mockDb as any, mockRedis as any)
    expect(score).toBe(58.5)
    expect(mockDb.entryEngagement.groupBy).toHaveBeenCalledWith({
      by: ['type'],
      where: { entryId: ENTRY_ID },
      _count: { type: true },
    })
    expect(mockDb.contestEntry.update).toHaveBeenCalledWith({
      where: { id: ENTRY_ID },
      data: {
        voteCount: 10,
        likeCount: 20,
        commentCount: 5,
        shareCount: 3,
        compositeScore: 58.5,
      },
    })
  })

  it('handles missing engagement types (defaults to 0)', async () => {
    mockDb.entryEngagement.groupBy.mockResolvedValue([
      { type: 'vote', _count: { type: 2 } },
    ])
    mockDb.contestEntry.update.mockResolvedValue({
      id: ENTRY_ID,
      contestId: CONTEST_ID,
      compositeScore: 6,
      voteCount: 2,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
    })

    const score = await updateEntryScore(ENTRY_ID, mockDb as any, mockRedis as any)
    expect(score).toBe(6)
  })

  it('updates redis if redisClient provided', async () => {
    mockDb.entryEngagement.groupBy.mockResolvedValue([])
    mockDb.contestEntry.update.mockResolvedValue({
      id: ENTRY_ID,
      contestId: CONTEST_ID,
      compositeScore: 0,
      voteCount: 0,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
    })

    await updateEntryScore(ENTRY_ID, mockDb as any, null)
    // Should not throw when redis is null
    expect(mockDb.contestEntry.update).toHaveBeenCalled()
  })
})

describe('getContestLeaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('falls back to DB when redis is null', async () => {
    mockDb.contest.findUnique.mockResolvedValue({
      id: CONTEST_ID,
      title: 'Test Contest',
      slug: 'test-contest',
    })
    mockDb.contestEntry.findMany.mockResolvedValue([
      {
        id: ENTRY_ID,
        title: 'Entry 1',
        muxPlaybackId: 'mux-1',
        thumbnailUrl: null,
        contestId: CONTEST_ID,
        creatorId: 'user-1',
        voteCount: 10,
        likeCount: 20,
        commentCount: 5,
        shareCount: 3,
        compositeScore: 58.5,
        creator: {
          id: 'user-1',
          displayName: 'Creator One',
          avatarUrl: null,
        },
      },
    ])

    const result = await getContestLeaderboard(CONTEST_ID, mockDb as any, null)
    expect(result).toHaveLength(1)
    expect(result[0]!.rank).toBe(1)
    expect(result[0]!.entryId).toBe(ENTRY_ID)
    expect(result[0]!.compositeScore).toBe(58.5)
    expect(result[0]!.creatorName).toBe('Creator One')
  })

  it('returns empty array for contest with no entries', async () => {
    mockDb.contest.findUnique.mockResolvedValue({ id: CONTEST_ID, title: 'Empty', slug: 'empty' })
    mockDb.contestEntry.findMany.mockResolvedValue([])

    const result = await getContestLeaderboard(CONTEST_ID, mockDb as any, null)
    expect(result).toHaveLength(0)
  })
})

describe('snapshotLeaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates correct number of snapshot rows', async () => {
    mockDb.contestEntry.findMany.mockResolvedValue([
      { id: 'entry-1', compositeScore: 58.5 },
      { id: 'entry-2', compositeScore: 28 },
      { id: 'entry-3', compositeScore: 10 },
    ])

    const createManyMock = vi.fn().mockResolvedValue({ count: 3 })
    const mockDbWithSnapshot = {
      ...mockDb,
      leaderboardSnapshot: { createMany: createManyMock },
    }

    await snapshotLeaderboard(CONTEST_ID, mockDbWithSnapshot as any)

    expect(createManyMock).toHaveBeenCalledOnce()
    const call = createManyMock.mock.calls[0]![0]
    expect(call.data).toHaveLength(3)
    expect(call.data[0]!.rank).toBe(1)
    expect(call.data[1]!.rank).toBe(2)
    expect(call.data[2]!.rank).toBe(3)
    expect(call.data[0]!.contestId).toBe(CONTEST_ID)
    expect(call.data[0]!.entryId).toBe('entry-1')
  })
})
