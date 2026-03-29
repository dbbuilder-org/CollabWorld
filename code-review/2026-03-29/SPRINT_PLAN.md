# Sprint Plan — 2026-03-29

## Completed This Session
- [x] Fixed 6 failing tests (health, share, stripe mock)
- [x] Implemented welcome email on `user.created` Clerk webhook
- [x] Wired Stripe webhook: `stripeCustomerId`, `subscriptionPlan`, `subscriptionStatus` on User
- [x] Added User subscription fields to Prisma schema + regenerated client
- [x] Removed 3 `console.log` from production paths
- [x] Replaced contest-active `console.log` placeholder with real `createNotification` call
- [x] `export const dynamic = 'force-dynamic'` on all 20 DB-hitting pages
- [x] `loading.tsx` skeleton UIs for dashboard, contests, watch pages
- [x] `error.tsx` error boundaries for dashboard and contests
- [x] Sitemap updated with `/feed` + approved `/watch/[id]` entries
- [x] `generateMetadata` for contest detail page
- [x] `aria-label` on LikeButton and VoteButton
- [x] Fan dashboard — real DB data (liked videos, voting history)
- [x] Private entry toggle in submission form
- [x] Influencer tier auto-detection in onboarding
- [x] BottomNav: "Contests" → "Videos" → `/feed`
- [x] `packages/db/.env` created so Prisma can find DATABASE_URL

---

## Sprint 1 (Next Session)

### S1-1: Clerk mock helper for tests (SP 2)
Create `__tests__/helpers/clerk-mock.ts` with typed `mockAuthAdmin()` / `mockAuthUser()` that satisfies Clerk's full `Auth` type. Replace ~30 TS errors in sprint7 tests.

### S1-2: Stripe webhook test coverage (SP 2)
Add tests for `customer.subscription.updated` and `customer.subscription.deleted` paths now that they're implemented.

### S1-3: Premium gating in UI (SP 3)
`subscriptionPlan` is now on the User model. Gate premium features in the UI:
- Show "Upgrade" prompt for `free` plan users on premium pages
- Display plan badge in user profile/settings
- Add `GET /api/v1/users/me/subscription` endpoint

### S1-4: `prisma db push` on staging (SP 1)
The new User fields (`stripeCustomerId`, `subscriptionPlan`, `subscriptionStatus`) require a `db push` on the staging/production DB. Run after next deploy.

---

## Sprint 2 (Future)

### S2-1: Structured logging (SP 5)
Replace all `console.error` in API routes with a structured logger (Pino or Axiom). ~49 call sites. Prerequisite: choose and configure logger service.

### S2-2: Avatar upload to R2/cloud storage (SP 3)
Current avatar upload writes to `public/uploads/avatars/` on local disk. On Render (ephemeral filesystem) files are lost on deploy. Migrate to Cloudflare R2 using existing R2 config in `.env.local`.

### S2-3: Contest enter page (SP 3)
`/contests/[slug]/enter` is linked from the contest detail CTA but the page doesn't exist yet. Should render `EntrySubmissionForm` for the specific contest.

### S2-4: User profile page (SP 2)
`/profile` is linked from BottomNav but no page exists. Should show current user's public profile (displayName, avatar, role, entries).
