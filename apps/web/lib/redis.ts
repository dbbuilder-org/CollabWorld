import { Redis } from '@upstash/redis'

// Gracefully handle missing env vars (tests / CI)
export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

// Leaderboard helpers

/**
 * ZADD leaderboard:{contestId} score entryId
 */
export async function updateLeaderboardScore(
  contestId: string,
  entryId: string,
  score: number
): Promise<void> {
  if (!redis) return
  await redis.zadd(`leaderboard:${contestId}`, { score, member: entryId })
}

/**
 * ZREVRANGE leaderboard:{contestId} 0 limit-1 WITHSCORES
 */
export async function getLeaderboard(
  contestId: string,
  limit = 100
): Promise<Array<{ entryId: string; score: number }>> {
  if (!redis) return []
  const results = await redis.zrange(`leaderboard:${contestId}`, 0, limit - 1, {
    rev: true,
    withScores: true,
  })
  // zrange with withScores returns [member, score, member, score, ...]
  const out: Array<{ entryId: string; score: number }> = []
  if (Array.isArray(results)) {
    for (let i = 0; i < results.length; i += 2) {
      out.push({ entryId: results[i] as string, score: Number(results[i + 1]) })
    }
  }
  return out
}

/**
 * DEL leaderboard:{contestId}
 */
export async function invalidateLeaderboard(contestId: string): Promise<void> {
  if (!redis) return
  await redis.del(`leaderboard:${contestId}`)
}
