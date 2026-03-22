import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@collabworld/db', () => ({
  db: {
    user: { findUnique: vi.fn() },
    influencerContestAssignment: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}))

import { db } from '@collabworld/db'
import {
  generateReferralCode,
  createReferralLink,
  parseReferralCode,
  trackConversion,
} from '@/lib/referral'

describe('generateReferralCode', () => {
  it('returns a 12-character uppercase alphanumeric code', () => {
    const code = generateReferralCode('user_inf_123', 'contest-uuid-001')
    expect(code).toHaveLength(12)
    expect(code).toMatch(/^[A-Z0-9]{12}$/)
  })

  it('returns the same deterministic prefix for same inputs', () => {
    const code1 = generateReferralCode('user_inf_123', 'contest-uuid-001')
    const code2 = generateReferralCode('user_inf_123', 'contest-uuid-001')
    // First 8 chars are deterministic HMAC, last 4 are random
    expect(code1.substring(0, 8)).toBe(code2.substring(0, 8))
  })

  it('produces different HMAC prefixes for different influencer IDs', () => {
    const code1 = generateReferralCode('user_inf_aaa', 'contest-uuid-001')
    const code2 = generateReferralCode('user_inf_bbb', 'contest-uuid-001')
    expect(code1.substring(0, 8)).not.toBe(code2.substring(0, 8))
  })

  it('produces different HMAC prefixes for different contest IDs', () => {
    const code1 = generateReferralCode('user_inf_123', 'contest-uuid-001')
    const code2 = generateReferralCode('user_inf_123', 'contest-uuid-002')
    expect(code1.substring(0, 8)).not.toBe(code2.substring(0, 8))
  })
})

describe('createReferralLink', () => {
  it('returns a properly formatted referral URL', () => {
    const link = createReferralLink('ABC12345XYZW', 'https://collabworld.io')
    expect(link).toBe('https://collabworld.io/ref/ABC12345XYZW')
  })

  it('handles trailing slash in baseUrl gracefully', () => {
    const link = createReferralLink('CODE', 'https://collabworld.io')
    expect(link).toContain('/ref/CODE')
  })

  it('works with localhost base URL', () => {
    const link = createReferralLink('TESTCODE1234', 'http://localhost:3000')
    expect(link).toBe('http://localhost:3000/ref/TESTCODE1234')
  })
})

describe('parseReferralCode', () => {
  it('returns valid for 12-character uppercase alphanumeric code', () => {
    expect(parseReferralCode('ABC12345XYZW')).toEqual({ valid: true })
  })

  it('returns valid for 8-character code (minimum)', () => {
    expect(parseReferralCode('ABCD1234')).toEqual({ valid: true })
  })

  it('returns valid for 16-character code (maximum)', () => {
    expect(parseReferralCode('ABCDEFGH12345678')).toEqual({ valid: true })
  })

  it('returns invalid for code shorter than 8 chars', () => {
    expect(parseReferralCode('ABC123')).toEqual({ valid: false })
  })

  it('returns invalid for code longer than 16 chars', () => {
    expect(parseReferralCode('ABCDEFGH123456789')).toEqual({ valid: false })
  })

  it('returns invalid for code with lowercase letters', () => {
    expect(parseReferralCode('abc12345xyzw')).toEqual({ valid: false })
  })

  it('returns invalid for code with special characters', () => {
    expect(parseReferralCode('ABC-1234-XYZ')).toEqual({ valid: false })
  })

  it('returns invalid for empty string', () => {
    expect(parseReferralCode('')).toEqual({ valid: false })
  })
})

describe('trackConversion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does nothing if user not found', async () => {
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    await trackConversion('user_unknown', 'SOMEREF123')
    expect(db.influencerContestAssignment.findFirst).not.toHaveBeenCalled()
  })

  it('does nothing if assignment not found', async () => {
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'uuid-user-001' })
    ;(db.influencerContestAssignment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    await trackConversion('user_inf_123', 'BADCODE1234')
    expect(db.auditLog.findFirst).not.toHaveBeenCalled()
  })

  it('does nothing if conversion already tracked (idempotent)', async () => {
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'uuid-user-001' })
    ;(db.influencerContestAssignment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'uuid-assign-001',
    })
    ;(db.auditLog.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'uuid-log-001' })
    await trackConversion('user_inf_123', 'REFCODE1234')
    expect(db.influencerContestAssignment.update).not.toHaveBeenCalled()
  })

  it('increments conversions and creates audit log on first conversion', async () => {
    ;(db.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'uuid-user-001' })
    ;(db.influencerContestAssignment.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'uuid-assign-001',
    })
    ;(db.auditLog.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    ;(db.influencerContestAssignment.update as ReturnType<typeof vi.fn>).mockResolvedValue({})
    ;(db.auditLog.create as ReturnType<typeof vi.fn>).mockResolvedValue({})

    await trackConversion('user_inf_123', 'REFCODE1234')

    expect(db.influencerContestAssignment.update).toHaveBeenCalledWith({
      where: { id: 'uuid-assign-001' },
      data: { conversions: { increment: 1 } },
    })
    expect(db.auditLog.create).toHaveBeenCalledOnce()
  })
})
