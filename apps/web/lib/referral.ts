import { createHmac, randomBytes } from 'crypto'
import { db } from '@collabworld/db'

/**
 * Generates a unique referral code: deterministic HMAC prefix (8 chars) + random 4 chars = 12-char code
 */
export function generateReferralCode(influencerClerkId: string, contestId: string): string {
  const hmac = createHmac('sha256', process.env.CLERK_SECRET_KEY || 'dev-secret')
    .update(`${influencerClerkId}:${contestId}`)
    .digest('hex')
    .substring(0, 8)
  const random = randomBytes(2).toString('hex') // 4 chars
  return (hmac + random).toUpperCase()
}

/**
 * Constructs the full referral link from a code and base URL.
 */
export function createReferralLink(code: string, baseUrl: string): string {
  return `${baseUrl}/ref/${code}`
}

/**
 * Validates that a referral code is alphanumeric and 8-16 chars.
 */
export function parseReferralCode(code: string): { valid: boolean } {
  const valid = /^[A-Z0-9]{8,16}$/.test(code)
  return { valid }
}

/**
 * Tracks a conversion for a referral code. Idempotent per user.
 * Increments conversionCount on the assignment and records an AuditLog entry.
 */
export async function trackConversion(clerkUserId: string, referralCode: string): Promise<void> {
  // Find the user performing the conversion
  const user = await db.user.findUnique({ where: { clerkId: clerkUserId } })
  if (!user) return

  // Find the assignment by trackingUrl (which stores the referral code)
  const assignment = await db.influencerContestAssignment.findFirst({
    where: { trackingUrl: referralCode },
  })
  if (!assignment) return

  // Idempotency check: did this user already convert for this assignment?
  const alreadyConverted = await db.auditLog.findFirst({
    where: {
      resourceType: 'influencer_contest_assignment',
      resourceId: assignment.id,
      action: 'referral_conversion',
      actorId: user.id,
    },
  })
  if (alreadyConverted) return

  // Increment conversions and record audit log
  await db.influencerContestAssignment.update({
    where: { id: assignment.id },
    data: { conversions: { increment: 1 } },
  })

  await db.auditLog.create({
    data: {
      actorId: user.id,
      action: 'referral_conversion',
      resourceType: 'influencer_contest_assignment',
      resourceId: assignment.id,
      metadata: { referralCode, convertedUserId: user.id },
    },
  })
}
