# Tech Debt Remediation — 2026-03-29

## Summary
- `console.log` removed: 3
- TODOs resolved: 1 (implemented, not deferred)
- Dead code wired up: 1 (Stripe webhook)
- Schema gaps closed: 1 (User subscription fields)
- Deferred: 0

## Fixed This Session

| File | Pattern | Resolution |
|------|---------|-----------|
| `lib/stripe.ts:18` | `console.log('[stripe] Not configured')` | Removed — early return is self-documenting |
| `lib/email.ts:15` | `console.log('[email] Resend not configured...')` | Removed — silent no-op in dev is correct |
| `app/api/v1/admin/contests/[id]/route.ts:79` | `console.log('[NOTIFY] Contest... is now ACTIVE')` | Replaced with real `createNotification` fire-and-forget |
| `app/api/v1/webhooks/clerk/route.ts:73` | `// TODO: send welcome email via @collabworld/email` | Implemented — `sendEmail(WelcomeEmail)` fire-and-forget on `user.created` |
| `app/api/v1/webhooks/stripe/route.ts` | Both `console.log` + dead no-op handlers | Fully replaced with DB writes to `user.stripeCustomerId`, `subscriptionPlan`, `subscriptionStatus` |

## Schema Change

Added to `User` model in `packages/db/prisma/schema.prisma`:
```prisma
stripeCustomerId   String?             @unique @map("stripe_customer_id")
subscriptionPlan   SubscriptionPlan    @default(free) @map("subscription_plan")
subscriptionStatus SubscriptionStatus? @map("subscription_status")
```
`prisma generate` run. `prisma db push` required on next deploy (DB not available locally).

## `console.error` in API Routes — Not Removed

49 `console.error` calls across API route files are intentional server-side error logging. These are appropriate until a structured logger (Pino/Axiom/Datadog) is introduced. Not tech debt — correct pattern for Next.js App Router.
