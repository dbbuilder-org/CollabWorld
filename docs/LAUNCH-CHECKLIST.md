# Collab World — Production Launch Checklist

**Date:** 2026-03-29
**Status:** Platform is 1.0.0-rc. Complete these steps to reach 1.0.0 production.

---

## Step 1 — Prisma Migration Files (INF-02)

The schema has always been `db push`'d. Generate proper migration files once:

```bash
docker compose up -d                      # start local postgres
./scripts/generate-migrations.sh          # generates prisma/migrations/
git add packages/db/prisma/migrations/
git commit -m "chore: generate initial prisma migration"
git push
```

Then update `render.yaml` build command:
- **Change:** `pnpm --filter @collabworld/db db:push`
- **To:** `pnpm --filter @collabworld/db migrate:deploy`

---

## Step 2 — Schema Sync on Render DBs (INF-01)

New User fields added in session (`stripeCustomerId`, `subscriptionPlan`, `subscriptionStatus`) need to be applied on Render.

**Option A (via Render Shell — staging first):**
1. Go to https://dashboard.render.com → your web service → Shell
2. Run: `pnpm --filter @collabworld/db db:push`

**Option B (automatic on next deploy):**
If `render.yaml` already runs `db:push` or `migrate:deploy` on startup, this happens automatically on the next deploy.

> ⚠️ Do staging first, verify, then prod.

---

## Step 3 — Add Stripe Env Vars (INF-03)

In Render dashboard → Environment → Add for **both staging and prod**:

| Variable | Where to get it |
|----------|----------------|
| `STRIPE_SECRET_KEY` | https://dashboard.stripe.com → Developers → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Same page |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → endpoint secret |
| `STRIPE_PREMIUM_PRICE_ID` | Stripe → Products → your $14.99 subscription price ID |

> After adding keys, create a Stripe webhook endpoint pointing to:
> `https://collabworld.servicevision.io/api/v1/webhooks/stripe`
> Events to enable: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

---

## Step 4 — Configure Clerk Webhook (INF-04a)

1. Go to https://dashboard.clerk.com → your application → Webhooks
2. Create endpoint: `https://collabworld.servicevision.io/api/v1/webhooks/clerk`
3. Subscribe to: `user.created`, `user.updated`, `user.deleted`
4. Copy the **Signing Secret** → add to Render as `CLERK_WEBHOOK_SECRET`

---

## Step 5 — Configure Mux Webhook (INF-04b)

1. Go to https://dashboard.mux.com → Settings → Webhooks
2. Create endpoint: `https://collabworld.servicevision.io/api/v1/webhooks/mux`
3. Events: `video.upload.asset_created`, `video.asset.ready`, `video.asset.errored`
4. Copy the **Signing Secret** → add to Render as `MUX_WEBHOOK_SECRET`

---

## Step 6 — Add R2 Env Vars (INF-07)

In Render dashboard → Environment → Add for both services:

| Variable | Value |
|----------|-------|
| `R2_ACCOUNT_ID` | Cloudflare dashboard → R2 → Account ID |
| `R2_ACCESS_KEY_ID` | Cloudflare → R2 → Manage API Tokens |
| `R2_SECRET_ACCESS_KEY` | Same page |
| `R2_BUCKET_NAME` | `collabworld-assets` |
| `R2_PUBLIC_URL` | `https://assets.collabworld.servicevision.io` |

> Also ensure the bucket has public access enabled for the `avatars/` prefix.

---

## Step 7 — Set Admin Role (INF-06)

1. Go to https://dashboard.clerk.com → your application → Users
2. Find the client's (RyanJae's) user account
3. Click → Metadata → `publicMetadata`:
```json
{ "role": "admin" }
```

---

## Step 8 — Production Smoke Test

After all steps above, run these manually:

- [ ] Sign up as a new fan user → onboarding completes → welcome email arrives
- [ ] Sign in as admin → `/admin` dashboard accessible
- [ ] Create a contest (admin) → status changes work
- [ ] Sign up as a creator → submit a video entry → Mux processing completes
- [ ] Approve the entry (admin) → appears in `/feed`
- [ ] Like + vote on the entry → leaderboard updates
- [ ] Click "Upgrade to Premium" → Stripe checkout opens
- [ ] Complete test payment → subscription status updates in settings

---

## Checklist Summary

- [ ] INF-01: `prisma db push` on staging DB
- [ ] INF-01: `prisma db push` on prod DB
- [ ] INF-02: Generate migration files + commit
- [ ] INF-02: Update render.yaml to `migrate:deploy`
- [ ] INF-03: Add Stripe env vars (staging)
- [ ] INF-03: Add Stripe env vars (prod)
- [ ] INF-03: Create Stripe webhook endpoint
- [ ] INF-04a: Create Clerk webhook endpoint
- [ ] INF-04b: Create Mux webhook endpoint
- [ ] INF-06: Set admin role on client Clerk account
- [ ] INF-07: Add R2 env vars (both services)
- [ ] Smoke test all flows

---

*Once all items are checked: tag `v1.0.0` and announce launch.*
