import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// ── DB mock ──────────────────────────────────────────────────────────────────
vi.mock('@collabworld/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

// ── next/navigation mock ─────────────────────────────────────────────────────
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

import { db } from '@collabworld/db'

describe('isPremiumUser', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  async function getIsPremiumUser() {
    const { isPremiumUser } = await import('@/lib/features')
    return isPremiumUser
  }

  it('returns false when user is not found', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce(null)
    const isPremiumUser = await getIsPremiumUser()
    const result = await isPremiumUser('user_unknown')
    expect(result).toBe(false)
  })

  it('returns false when user exists (no isPremium field in schema)', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({ id: 'uuid-123' } as never)
    const isPremiumUser = await getIsPremiumUser()
    const result = await isPremiumUser('user_123')
    expect(result).toBe(false)
  })

  it('calls db.user.findUnique with correct clerkId', async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce(null)
    const isPremiumUser = await getIsPremiumUser()
    await isPremiumUser('user_clerk_abc')
    expect(db.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clerkId: 'user_clerk_abc' } })
    )
  })
})

describe('PREMIUM_FEATURES', () => {
  it('exports the expected feature keys', async () => {
    const { PREMIUM_FEATURES } = await import('@/lib/features')
    expect(PREMIUM_FEATURES.UNLIMITED_ENTRIES).toBe('unlimited_entries')
    expect(PREMIUM_FEATURES.ANALYTICS_EXPORT).toBe('analytics_export')
    expect(PREMIUM_FEATURES.PRIORITY_SUPPORT).toBe('priority_support')
    expect(PREMIUM_FEATURES.ADVANCED_ANALYTICS).toBe('advanced_analytics')
  })
})

describe('PremiumGate', () => {
  it('renders children when isPremium is true', async () => {
    const { PremiumGate } = await import('@/components/PremiumGate')
    render(
      <PremiumGate isPremium={true} featureName="Advanced Analytics">
        <div>Premium content here</div>
      </PremiumGate>
    )
    expect(screen.getByText('Premium content here')).toBeDefined()
  })

  it('does not render children when isPremium is false', async () => {
    const { PremiumGate } = await import('@/components/PremiumGate')
    render(
      <PremiumGate isPremium={false} featureName="Advanced Analytics">
        <div>Premium content here</div>
      </PremiumGate>
    )
    expect(screen.queryByText('Premium content here')).toBeNull()
  })

  it('renders upgrade CTA when isPremium is false', async () => {
    const { PremiumGate } = await import('@/components/PremiumGate')
    render(
      <PremiumGate isPremium={false} featureName="Advanced Analytics">
        <div>Premium content</div>
      </PremiumGate>
    )
    expect(screen.getByText('Premium Feature')).toBeDefined()
    expect(screen.getByText('Upgrade to Premium')).toBeDefined()
  })

  it('displays the feature name in the gate message', async () => {
    const { PremiumGate } = await import('@/components/PremiumGate')
    render(
      <PremiumGate isPremium={false} featureName="Analytics Export">
        <div>content</div>
      </PremiumGate>
    )
    expect(screen.getByText('Analytics Export is available on the Premium plan.')).toBeDefined()
  })
})
