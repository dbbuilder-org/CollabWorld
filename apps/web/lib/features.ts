import { db } from '@collabworld/db'

export async function isPremiumUser(clerkUserId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true },
  })
  // Note: User model does not yet have an isPremium field.
  // All users are on the free plan until the schema is extended.
  if (!user) return false
  return false
}

export const PREMIUM_FEATURES = {
  UNLIMITED_ENTRIES: 'unlimited_entries',
  ANALYTICS_EXPORT: 'analytics_export',
  PRIORITY_SUPPORT: 'priority_support',
  ADVANCED_ANALYTICS: 'advanced_analytics',
} as const

export type PremiumFeature = typeof PREMIUM_FEATURES[keyof typeof PREMIUM_FEATURES]
