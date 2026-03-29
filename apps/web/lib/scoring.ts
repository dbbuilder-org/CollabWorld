// Canonical scoring formula for Collab World v2
// Used in: leaderboard API, contest detail, influencer scoring dashboard, admin analytics

export const SCORING_WEIGHTS = {
  votes:    3,
  likes:    1,
  comments: 0.5,
  shares:   2,
  views:    0.01,
} as const

export function calculateScore(metrics: {
  votes: number
  likes: number
  comments: number
  shares: number
  views?: number
}): number {
  return (
    metrics.votes    * SCORING_WEIGHTS.votes    +
    metrics.likes    * SCORING_WEIGHTS.likes    +
    metrics.comments * SCORING_WEIGHTS.comments +
    metrics.shares   * SCORING_WEIGHTS.shares   +
    (metrics.views ?? 0) * SCORING_WEIGHTS.views
  )
}
