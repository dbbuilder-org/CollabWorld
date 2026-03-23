import type { PrismaClient } from '@collabworld/db'
import { computeContestScore } from './contest'
import { updateLeaderboardScore } from './redis'
import type { redis } from './redis'

export interface LeaderboardEntry {
  rank: number
  entryId: string
  title: string
  muxPlaybackId: string | null
  thumbnailUrl: string | null
  creatorId: string
  creatorName: string
  creatorAvatar: string | null
  compositeScore: number
  voteCount: number
  likeCount: number
  commentCount: number
  shareCount: number
}

export interface EntryScoreResult {
  score: number
  voteCount: number
  likeCount: number
  commentCount: number
  shareCount: number
}

/**
 * Recompute composite score and update DB + Redis.
 * 1. Aggregate engagement counts from entry_engagements for this entryId
 * 2. computeContestScore(votes, likes, comments, shares)
 * 3. Update contest_entries counts + compositeScore
 * 4. Update Redis sorted set
 * 5. Return score and counts
 */
export async function updateEntryScore(
  entryId: string,
  db: PrismaClient,
  redisClient: typeof redis
): Promise<number> {
  const result = await updateEntryScoreWithCounts(entryId, db, redisClient)
  return result.score
}

export async function updateEntryScoreWithCounts(
  entryId: string,
  db: PrismaClient,
  redisClient: typeof redis
): Promise<EntryScoreResult> {
  const groups = await db.entryEngagement.groupBy({
    by: ['type'],
    where: { entryId },
    _count: { type: true },
  })

  const counts: Record<string, number> = {
    vote: 0,
    like: 0,
    comment: 0,
    share: 0,
  }
  for (const g of groups) {
    counts[g.type] = g._count.type
  }

  const score = computeContestScore(counts.vote ?? 0, counts.like ?? 0, counts.comment ?? 0, counts.share ?? 0)

  const updated = await db.contestEntry.update({
    where: { id: entryId },
    data: {
      voteCount: counts.vote,
      likeCount: counts.like,
      commentCount: counts.comment,
      shareCount: counts.share,
      compositeScore: score,
    },
  })

  // Update Redis sorted set if we have a redis client and the entry has a contestId
  if (redisClient && updated.contestId) {
    await updateLeaderboardScore(updated.contestId, entryId, score)
  }

  return {
    score,
    voteCount: updated.voteCount,
    likeCount: updated.likeCount,
    commentCount: updated.commentCount,
    shareCount: updated.shareCount,
  }
}

/**
 * Get full leaderboard for a contest (with entry + creator info).
 * Falls back to Postgres aggregate (Redis path requires contestId lookup in entries).
 */
export async function getContestLeaderboard(
  contestId: string,
  db: PrismaClient,
  redisClient: typeof redis
): Promise<LeaderboardEntry[]> {
  // Always query DB for full entry details (Redis only stores scores)
  const entries = await db.contestEntry.findMany({
    where: { contestId, status: 'approved' },
    orderBy: { compositeScore: 'desc' },
    include: {
      creator: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  })

  return entries.map((entry: (typeof entries)[number], idx: number) => ({
    rank: idx + 1,
    entryId: entry.id,
    title: entry.title,
    muxPlaybackId: entry.muxPlaybackId ?? null,
    thumbnailUrl: entry.thumbnailUrl ?? null,
    creatorId: entry.creatorId,
    creatorName: entry.creator.displayName,
    creatorAvatar: entry.creator.avatarUrl ?? null,
    compositeScore: Number(entry.compositeScore),
    voteCount: entry.voteCount,
    likeCount: entry.likeCount,
    commentCount: entry.commentCount,
    shareCount: entry.shareCount,
  }))
}

/**
 * Take final leaderboard from DB, write rows to leaderboard_snapshots.
 * Called when contest transitions to 'completed'.
 */
export async function snapshotLeaderboard(contestId: string, db: PrismaClient): Promise<void> {
  const entries = await db.contestEntry.findMany({
    where: { contestId },
    orderBy: { compositeScore: 'desc' },
    select: { id: true, compositeScore: true },
  })

  const snapshotAt = new Date()
  await db.leaderboardSnapshot.createMany({
    data: entries.map((entry: (typeof entries)[number], idx: number) => ({
      contestId,
      entryId: entry.id,
      rank: idx + 1,
      compositeScore: entry.compositeScore,
      snapshotAt,
    })),
  })
}
