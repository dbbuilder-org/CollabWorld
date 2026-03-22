import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/redis', () => ({
  redis: null,
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn().mockReturnValue({ type: 'sliding' })
    constructor() {}
    async limit(_identifier: string) {
      return { success: true, remaining: 10 }
    }
  },
}))

import { createRateLimiter, checkRateLimit, engagementLimiter, submissionLimiter } from '@/lib/rateLimit'

describe('createRateLimiter', () => {
  it('returns null when redis is null', () => {
    const limiter = createRateLimiter(60, '1 m')
    expect(limiter).toBeNull()
  })

  it('engagementLimiter is null when redis is not configured', () => {
    expect(engagementLimiter).toBeNull()
  })

  it('submissionLimiter is null when redis is not configured', () => {
    expect(submissionLimiter).toBeNull()
  })
})

describe('checkRateLimit', () => {
  it('returns success true with remaining 999 when limiter is null', async () => {
    const result = await checkRateLimit(null, 'user_123')
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(999)
  })

  it('returns success and remaining from limiter when provided', async () => {
    const mockLimiter = {
      limit: vi.fn().mockResolvedValue({ success: true, remaining: 42 }),
    }
    const result = await checkRateLimit(mockLimiter as never, 'user_123')
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(42)
  })
})
