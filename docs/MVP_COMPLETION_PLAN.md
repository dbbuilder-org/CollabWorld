# Collab World v2 — MVP Completion Plan
**Date:** 2026-03-27
**Goal:** v2 must be better than and fully include all of v1 — every feature, all content, all flows.

---

## Status Baseline

| Dimension | v1 | v2 Current | Target |
|-----------|-----|------------|--------|
| Auth | Passport/local password | Clerk (better) | ✅ Clerk |
| Video ingestion | YouTube URL input | Mux direct upload (better) | ✅ Mux |
| Engagement loop | Likes, comments, shares | + Votes, Notifications | ✅ Superset |
| Leaderboard | All-time + time-filtered | All-time only (gap) | ⚠️ Fix time filter |
| Contests | active/inactive boolean | Full state machine (better) | ✅ Better |
| Home page | Full sections + content | ✅ Now fully ported | ✅ Done |
| Static content pages | Rules + Affiliate Plan | ✅ Now created | ✅ Done |
| Brand tokens | None | ✅ brand.ts created | ✅ Done |
| Mobile nav | Bottom nav | ✅ BottomNav.tsx | ✅ Done |
| Share code system | /s/:shareCode → redirect | Not implemented | ❌ Missing |
| User feed (video grid) | Full feed page | Not implemented | ❌ Missing |
| Watch/video detail | Full watch page | Not implemented | ❌ Missing |
| Avatar upload | Multer endpoint | Not implemented | ❌ Missing |
| User banning | Admin endpoint | Not implemented | ❌ Missing |
| My Likes / My Comments | Account tabs | Not implemented | ❌ Missing |
| Ref link tracking | ShareEvents table | EntryEngagement partial | ⚠️ Extend |
| Private videos | isPrivate flag | Not in schema | ❌ Missing |
| Scoring formula | likes+comments×2+shares×3 | votes×3+likes+comments×0.5+shares×2 | ⚠️ Reconcile |
| Contest creation UI | Admin only, no UI | Admin panel exists | ⚠️ Add create form |
| Email notifications | None in v1 | Resend + React Email (better) | ✅ Better |
| Stripe/payments | None in v1 | Stripe + webhooks (better) | ✅ Better |
| Redis leaderboard | None in v1 | Upstash sorted sets (better) | ✅ Better |
| Notifications system | None in v1 | Full system (better) | ✅ Better |
| Role-specific dashboards | None in v1 | Creator/Influencer/Brand (better) | ✅ Better |
| Onboarding flow | None in v1 | Full role-based onboarding (better) | ✅ Better |
| Referral system | Affiliate links (static) | /ref/:code tracking (better) | ✅ Better |
| Analytics dashboard | None in v1 | Admin analytics API (better) | ✅ Better |

---

## Sprint Plan

### Sprint A — Core Viewing Experience (3 days)
**Goal:** Users can browse and watch contest videos — the v1 feed + watch pages.

#### A1 — Public Video Feed (`/feed`)
- `app/(public)/feed/page.tsx` — video grid, search, sort (trending/top/new), pagination
- `components/entries/EntryGrid.tsx` — responsive grid of EntryCard
- API: `GET /api/v1/entries?sort=trending&search=&page=` (extend existing)
- Sort options: Trending (score desc), Top (likes desc), New (createdAt desc)
- Skeleton loaders while fetching

#### A2 — Video Watch Page (`/watch/[id]`)
- `app/(public)/watch/[id]/page.tsx`
- Mux player embed (MuxVideoPlayer component exists)
- View count increment on load
- Like / Vote / Share buttons (engagement components exist)
- Comments section (CommentSection component exists)
- Creator info panel (avatar, name, role badge)
- "Up Next" sidebar (5 trending entries)
- Share modal: copy link, platform buttons (TikTok, Instagram, Facebook)

#### A3 — Entry View Count
- Add `viewCount` increment on `GET /api/v1/entries/:id`
- Add view count display in EntryCard and watch page

**Files to create/modify:**
- `app/(public)/feed/page.tsx` (new)
- `app/(public)/watch/[id]/page.tsx` (new)
- `components/entries/EntryGrid.tsx` (new)
- `components/entries/ShareModal.tsx` (new)
- `app/api/v1/entries/[id]/view/route.ts` (new)

---

### Sprint B — Share Code System (1 day)
**Goal:** Unique share codes that track referral source and redirect to video.

#### B1 — Share Code Generation
- `app/api/v1/share/route.ts` — `POST /api/v1/share` → generates 8-char shareCode, stores in DB
- Add `ShareCode` model to Prisma schema: `{ id, shareCode (unique), entryId, userId?, platform?, createdAt }`
- Returns `{ shareCode, url: /s/:shareCode }`

#### B2 — Share Redirect Route
- `app/s/[code]/route.ts` — `GET /s/:code` → lookup shareCode, 301 redirect to `/watch/:id`
- Increment `entry.shareCount` on redirect
- Mark shareCode as `clickedAt`

#### B3 — Platform Share Buttons
- ShareModal opens with: copy link, Facebook, X/Twitter, TikTok, Instagram
- Each generates a platform-tagged shareCode

**Prisma migration:** `add_share_codes`

---

### Sprint C — Creator Account Features (2 days)
**Goal:** Creators can manage their content — v1 account page parity.

#### C1 — Avatar Upload API
- `app/api/v1/account/avatar/route.ts` — multipart upload → store in Supabase Storage or local `/uploads/`
- Max 5MB, accept: jpeg/png/gif/webp
- Returns `{ avatarUrl }`
- Wire into creator profile edit form

#### C2 — My Likes Tab
- `app/api/v1/account/likes/route.ts` — `GET` → entries the user has liked (paginated)
- Add "My Likes" tab to creator dashboard

#### C3 — My Comments Tab
- `app/api/v1/account/comments/route.ts` — `GET` → comments user has posted (with entry title)
- Add "My Comments" tab to creator dashboard

#### C4 — Private Videos
- Add `isPrivate: Boolean @default(false)` to Entry model in schema
- Add private toggle to entry submission form
- Filter private entries from public feed (only visible to creator)

**Prisma migration:** `add_private_entries`

---

### Sprint D — Admin Completeness (1 day)
**Goal:** Admin can fully moderate — v1 admin parity plus v2 enhancements.

#### D1 — User Banning
- `app/api/v1/admin/users/[id]/ban/route.ts` — `PATCH` toggle `user.isBanned`
- Add `isBanned: Boolean @default(false)` to User model (check if exists)
- Banned users: block auth + hide content from feed
- Admin UI: ban/unban toggle in user list

#### D2 — Contest Creation UI
- `app/(dashboard)/admin/contests/new/page.tsx` — form to create a contest
- Fields: name, slug, description, rulesText, prizePoolJson, startAt, endAt, thumbnailUrl
- Wire to existing `POST /api/v1/admin/contests`

#### D3 — Admin Comment Delete
- `app/api/v1/admin/comments/[id]/route.ts` — `DELETE` any comment
- Add to entry watch page for admin users

**Prisma migration:** `add_user_banned_flag` (if not present)

---

### Sprint E — Leaderboard Time Filters (1 day)
**Goal:** Leaderboard shows Today / This Week / All Time — matching v1 exactly.

#### E1 — Leaderboard API Time Filter
- `GET /api/v1/contests/[id]/leaderboard?timeFilter=today|week|all`
- Add `timeFilter` param to existing leaderboard endpoint
- SQL: filter `entry.createdAt >= [cutoff]` based on filter
- Update `lib/leaderboard.ts` to accept timeFilter

#### E2 — Contest Leaderboard UI Tabs
- Add "Today" / "This Week" / "All Time" tab pills to contest leaderboard component
- Client-side re-fetch on tab change

---

### Sprint F — Influencer Affiliate System (3 days)
**Goal:** Real affiliate tracking — the core of the 800-influencer program.

#### F1 — Affiliate Link Generation
- When influencer is assigned to a contest, generate unique `affiliateCode` (16-char)
- `app/api/v1/influencer/affiliate/route.ts` — `GET` returns influencer's active codes
- Each code encodes: influencerId + contestId

#### F2 — Affiliate Click Tracking
- `app/ref/[code]/route.ts` — `GET` → redirect to contest page, log click
- Add `AffiliateClick` model: `{ id, affiliateCode, referredUserId?, platform?, createdAt }`
- Count clicks → feed into influencer scoring

#### F3 — Influencer Scoring Dashboard
- `app/(dashboard)/dashboard/influencer/page.tsx` — extends existing
- Show: total score, breakdown by metric (views/likes/comments/shares/affiliate sales)
- Daily posting streak tracker
- Estimated payout vs. guaranteed payout progress bar
- Contest assignment card with affiliate link + copy button

#### F4 — Influencer Tier Detection
- On onboarding: influencer selects follower count range → auto-assigns tier
- `InfluencerProfile.tier` field: NANO/MICRO/MID_TIER/MACRO/MEGA
- Guaranteed payout calculated from tier

**Prisma migrations:** `add_affiliate_click_tracking`, `add_influencer_tier`

---

### Sprint G — Scoring Formula Reconciliation (0.5 day)
**Goal:** Unified scoring formula documented and enforced.

**Decision needed:** v1 used `likes(1) + comments(2) + shares(3)`. v2 uses `votes(3) + likes(1) + comments(0.5) + shares(2)`.

**Recommendation:** Use v2 formula — it's better (votes = explicit intent, shares = virality). Add a `SCORING_FORMULA` constant to `lib/brand.ts` or a new `lib/scoring.ts`:

```ts
export const SCORING_WEIGHTS = {
  votes:    3,
  likes:    1,
  comments: 0.5,
  shares:   2,
  views:    0.01, // soft signal
}

export function calculateScore(metrics: {
  votes: number; likes: number; comments: number; shares: number; views?: number
}): number {
  return (
    metrics.votes    * SCORING_WEIGHTS.votes +
    metrics.likes    * SCORING_WEIGHTS.likes +
    metrics.comments * SCORING_WEIGHTS.comments +
    metrics.shares   * SCORING_WEIGHTS.shares +
    (metrics.views ?? 0) * SCORING_WEIGHTS.views
  )
}
```

Apply consistently in: leaderboard API, contest detail page, influencer scoring dashboard.

---

### Sprint H — Polish & Production Readiness (2 days)

#### H1 — Next.js Image Optimization
- Replace all `<img>` tags with `<Image>` from next/image in EntryCard, ContestCard, watch page
- Add proper `sizes` props for responsive loading

#### H2 — Error + Loading States
- Skeleton loaders for feed, leaderboard, dashboard
- Empty states for: no contests, no entries, no comments
- Error boundaries around all data-fetching page sections

#### H3 — SEO
- Contest detail: dynamic `generateMetadata` with title + description + OG image
- Entry watch: dynamic metadata with video title + creator
- `sitemap.ts`: already exists — ensure contest + entry URLs are included

#### H4 — Performance
- `export const dynamic = 'force-dynamic'` confirmed on all DB-hitting pages
- Leaderboard: snapshot caching in Upstash (already in `lib/leaderboard.ts`)
- Image CDN: all user avatars via Next.js image optimization

#### H5 — Accessibility
- All interactive elements have `aria-label`
- Focus visible on all buttons/links
- Keyboard navigation for modals and dropdowns

---

## Feature Parity Checklist

### Content & Pages
- [x] Home page — full v1 sections + v2 quality
- [x] Rules for Creators page
- [x] Rules for Influencers page
- [x] Affiliate Compensation Plan page
- [x] Contests listing page
- [x] Contest detail page
- [ ] **Video feed page** (Sprint A)
- [ ] **Video watch page** (Sprint A)
- [x] Pricing page (fixed to dark theme)
- [x] Onboarding flow

### Auth & Users
- [x] Sign up / sign in / sign out (Clerk)
- [x] Role selection (Fan/Creator/Influencer/Brand/Admin)
- [x] User profiles with role-specific data
- [ ] **Avatar upload** (Sprint C)
- [ ] **User banning (admin)** (Sprint D)

### Video / Entries
- [x] Mux video upload
- [x] Entry submission form
- [x] Entry status (pending/approved/rejected)
- [x] Admin moderation queue
- [ ] **Private entries** (Sprint C)
- [ ] **View count increment** (Sprint A)

### Engagement
- [x] Likes with deduplication
- [x] Votes (v2 addition)
- [x] Comments with cooldown
- [x] Comment deletion (user + admin)
- [ ] **Share codes + redirect** (Sprint B)
- [ ] **Platform share modal** (Sprint B)

### Contest System
- [x] Contest state machine
- [x] Leaderboard (all-time)
- [x] Countdown timer
- [x] Prize display
- [ ] **Leaderboard time filters** (Sprint E)
- [ ] **Contest creation UI** (Sprint D)

### Influencer Program
- [x] Influencer role + onboarding
- [x] Contest assignment model (schema)
- [ ] **Affiliate link generation** (Sprint F)
- [ ] **Affiliate click tracking** (Sprint F)
- [ ] **Influencer scoring dashboard** (Sprint F)
- [ ] **Tier detection + guaranteed payout** (Sprint F)

### Creator Dashboard
- [x] Entry management
- [x] Contest stats
- [ ] **My Likes tab** (Sprint C)
- [ ] **My Comments tab** (Sprint C)

### Admin
- [x] Entry moderation
- [x] Analytics dashboard
- [x] User management (view)
- [ ] **User banning** (Sprint D)
- [ ] **Contest creation form** (Sprint D)
- [ ] **Admin comment delete** (Sprint D)

### Platform Features (v2 Additions — Beyond v1)
- [x] Stripe premium subscription + gating
- [x] Resend email notifications (8 templates)
- [x] Redis leaderboard snapshots
- [x] Notification system
- [x] Referral tracking (/ref/:code)
- [x] Role-specific dashboards
- [x] Upstash rate limiting

---

## Scoring Formula (Canonical)

```
score = (votes × 3) + (likes × 1) + (comments × 0.5) + (shares × 2) + (views × 0.01)
```

Documented in `lib/scoring.ts` (to be created in Sprint G). Used consistently across:
- Leaderboard API
- Contest leaderboard UI
- Influencer scoring
- Admin analytics

---

## Sprint Estimates

| Sprint | Focus | Days | Tickets |
|--------|-------|------|---------|
| A | Feed + Watch pages | 3 | ~12 |
| B | Share code system | 1 | ~4 |
| C | Creator account features | 2 | ~8 |
| D | Admin completeness | 1 | ~4 |
| E | Leaderboard time filters | 1 | ~3 |
| F | Influencer affiliate system | 3 | ~14 |
| G | Scoring reconciliation | 0.5 | ~2 |
| H | Polish + prod readiness | 2 | ~8 |
| **Total** | | **~13.5 days** | **~55 tickets** |

---

## V2 Superiority Over V1 (What We're Adding)

| Capability | v1 | v2 |
|------------|----|----|
| Video hosting | YouTube URLs only | Mux direct upload + CDN |
| Auth | Session + scrypt passwords | Clerk (SSO, OAuth, MFA) |
| Email | None | 8 transactional templates via Resend |
| Payments | None | Stripe subscriptions + webhooks |
| Real-time leaderboard | SQL every request | Upstash Redis sorted sets |
| Notifications | None | Full notification system |
| Role dashboards | None | Creator/Influencer/Brand/Admin |
| Onboarding | Basic signup | Multi-step role-specific onboarding |
| State machine | active/inactive | draft→upcoming→active→voting→completed→archived |
| Rate limiting | In-memory Map | Redis distributed |
| Referral tracking | Static affiliate links | Dynamic /ref/:code with attribution |
| Contest admin | Manual DB | Full admin panel with analytics |
| Premium gating | None | Stripe premium tier |

---

*Next: Begin Sprint A (feed + watch pages) — this unblocks the core viewing experience and makes the platform feel alive for the first real contest.*
