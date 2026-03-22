import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis'

/**
 * Returns a sliding window rate limiter or null if Redis not configured.
 * @param requests - number of requests allowed
 * @param window - time window string e.g. '1 m', '10 s'
 */
export function createRateLimiter(
  requests: number,
  window: string
): InstanceType<typeof Ratelimit> | null {
  if (!redis) return null
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window as `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}`),
  })
}

/**
 * Check rate limit — returns { success, remaining }
 * When Redis is null, always returns { success: true, remaining: 999 }
 */
export async function checkRateLimit(
  limiter: InstanceType<typeof Ratelimit> | null,
  identifier: string
): Promise<{ success: boolean; remaining: number }> {
  if (!limiter) return { success: true, remaining: 999 }
  const result = await limiter.limit(identifier)
  return { success: result.success, remaining: result.remaining }
}
