# Collab World — Development Roadmap

**Version:** 1.0 | **Date:** 2026-03-22 | **Status:** Active

---

## Phases at a Glance

| Phase | Name | Goal | Target |
|-------|------|------|--------|
| **0** | Foundation | Monorepo scaffold, CI/CD, core infra | Week 1 |
| **1** | Auth & Onboarding | Clerk, 4 account types, profiles | Week 2 |
| **2** | Contest Engine | Create/manage/display contests | Week 3-4 |
| **3** | Entry System | Upload, review, manage entries | Week 5 |
| **4** | Engagement & Leaderboard | Like, vote, comment, share, real-time ranks | Week 6 |
| **5** | Influencer Management | Assignments, agreements, tracking links | Week 7 |
| **6** | Email & Notifications | Resend transactional flows | Week 8 |
| **7** | Admin Panel | Full admin dashboard | Week 9 |
| **8** | QA & Staging Hardening | Load test, security audit, polish | Week 10 |
| **9** | Production Launch** | Deploy to prod, monitor | Week 11 |
| **10** | Phase 2: Marketplace | Streaming, collab packages, payouts | Week 12+ |

---

## Phase 0 — Foundation

**Goal:** Turborepo monorepo running, CI green, Render auto-deploy working, empty Next.js app with Prisma connected.

### Tickets

| ID | Title | Type | SP |
|----|-------|------|----|
| CW-001 | Initialize Turborepo monorepo with pnpm workspaces | Setup | 2 |
| CW-002 | Configure `packages/db` with Prisma + initial schema | Setup | 3 |
| CW-003 | Configure `packages/types` with shared TypeScript types | Setup | 1 |
| CW-004 | Configure `packages/ui` with shadcn/ui + Tailwind Catalyst base | Setup | 2 |
| CW-005 | Configure `packages/email` with React Email + Resend | Setup | 2 |
| CW-006 | Set up `apps/web` Next.js 14 with App Router + TailwindCSS | Setup | 2 |
| CW-007 | Configure GitHub Actions CI (lint, typecheck, test) | DevOps | 2 |
| CW-008 | Configure `render.yaml` for Render.com IaC deployment | DevOps | 2 |
| CW-009 | Docker Compose for local PostgreSQL + Redis | Setup | 1 |
| CW-010 | Set up Vitest + React Testing Library + Playwright | Testing | 2 |
| CW-011 | `/api/health` endpoint | API | 1 |
| CW-012 | `.env.example` + SETUP.md documentation | Docs | 1 |

**Sprint total: 21 SP**

---

## Phase 1 — Auth & Onboarding

**Goal:** Users can register, select account type, complete role-specific profile. Clerk webhooks sync to DB.

### Tickets

| ID | Title | Type | SP |
|----|-------|------|----|
| CW-013 | Install + configure Clerk middleware | Auth | 2 |
| CW-014 | Clerk webhook handler (`user.created`, `user.updated`, `user.deleted`) | API | 3 |
| CW-015 | Onboarding flow: account type selection page | UI | 3 |
| CW-016 | Creator profile form (genre, bio, portfolio URLs) | UI | 3 |
| CW-017 | Influencer profile form (platform handles, follower count) | UI | 3 |
| CW-018 | Brand profile form (company, website, contact) | UI | 3 |
| CW-019 | Fan profile form (basic bio, preferences) | UI | 2 |
| CW-020 | Role-based dashboard shell (routing by account type) | UI | 3 |
| CW-021 | `GET/PATCH /api/v1/users/me` — profile read/update | API | 2 |
| CW-022 | Public user profile page `/u/[username]` | UI | 2 |
| CW-023 | Unit tests: auth helpers, role guards | Testing | 2 |
| CW-024 | E2E test: full onboarding flow for each role | Testing | 3 |

**Sprint total: 31 SP**

---

## Phase 2 — Contest Engine

**Goal:** Admins can create and publish contests. Public can browse and view contest entries.

### Tickets

| ID | Title | Type | SP |
|----|-------|------|----|
| CW-025 | Prisma migration: `contests`, `contest_prizes` tables | DB | 2 |
| CW-026 | Admin: create contest form (all fields, prize structure) | UI | 5 |
| CW-027 | Admin: contest list + status management | UI | 3 |
| CW-028 | Admin: publish/pause/archive contest workflow | API | 3 |
| CW-029 | `POST /api/v1/admin/contests` — create contest | API | 3 |
| CW-030 | `PATCH /api/v1/admin/contests/[id]` — update status | API | 2 |
| CW-031 | `GET /api/v1/contests` — public contest listing | API | 2 |
| CW-032 | `GET /api/v1/contests/[slug]` — single contest detail | API | 2 |
| CW-033 | Public contest listing page (grid, filters by status) | UI | 3 |
| CW-034 | Public contest detail page (info, prize structure, entry count) | UI | 3 |
| CW-035 | Contest asset package upload (admin) + download (creator) | API+UI | 3 |
| CW-036 | Contest countdown timer component | UI | 1 |
| CW-037 | Unit tests: contest state machine | Testing | 2 |
| CW-038 | Integration tests: contest API endpoints | Testing | 3 |

**Sprint total: 37 SP**

---

## Phase 3 — Entry System

**Goal:** Creators can upload video entries. Admins can approve/reject. Approved entries display publicly.

### Tickets

| ID | Title | Type | SP |
|----|-------|------|----|
| CW-039 | Mux integration: `packages/web/lib/mux.ts` client setup | Infra | 2 |
| CW-040 | Mux webhook handler (asset.ready, asset.errored) | API | 3 |
| CW-041 | Prisma migration: `contest_entries` table | DB | 1 |
| CW-042 | `POST /api/v1/entries/upload-url` — Mux presigned upload URL | API | 3 |
| CW-043 | `POST /api/v1/entries` — create entry record | API | 2 |
| CW-044 | `PATCH /api/v1/entries/[id]` — update entry (title/description) | API | 2 |
| CW-045 | `GET /api/v1/contests/[slug]/entries` — list approved entries | API | 2 |
| CW-046 | Video upload UI: chunked uploader with progress bar | UI | 5 |
| CW-047 | Entry submission form (title, description, file input) | UI | 3 |
| CW-048 | Entry processing state UI (pending → approved/rejected) | UI | 2 |
| CW-049 | Admin: entry review queue (approve / reject with reason) | UI | 4 |
| CW-050 | `PATCH /api/v1/admin/entries/[id]/review` — approve/reject | API | 2 |
| CW-051 | Mux Player component (MuxUpchunk + Mux Player Web) | UI | 3 |
| CW-052 | Entry card component (thumbnail, title, creator, stats) | UI | 2 |
| CW-053 | Contest entries grid page (sorted by score) | UI | 3 |
| CW-054 | Creator entry dashboard (my entry, status, stats) | UI | 3 |
| CW-055 | Integration tests: entry upload + review flow | Testing | 3 |

**Sprint total: 45 SP**

---

## Phase 4 — Engagement & Leaderboard

**Goal:** Registered users can like, vote, comment, share. Leaderboard shows live rankings.

### Tickets

| ID | Title | Type | SP |
|----|-------|------|----|
| CW-056 | Prisma migration: `entry_engagements` table + vote uniqueness trigger | DB | 3 |
| CW-057 | Redis setup: Upstash client `packages/db/lib/redis.ts` | Infra | 2 |
| CW-058 | `POST /api/v1/entries/[id]/like` — idempotent like/unlike | API | 3 |
| CW-059 | `POST /api/v1/entries/[id]/vote` — one vote per contest per user | API | 3 |
| CW-060 | `POST /api/v1/entries/[id]/comment` — add comment | API | 3 |
| CW-061 | `POST /api/v1/entries/[id]/share` — track share, return referral URL | API | 2 |
| CW-062 | Rate limiting middleware (IP + user-based) on engagement endpoints | API | 3 |
| CW-063 | Leaderboard score computation service (`lib/leaderboard.ts`) | Core | 3 |
| CW-064 | `GET /api/v1/contests/[slug]/leaderboard` — cached rankings | API | 3 |
| CW-065 | Redis sorted set: update score on each engagement write | Core | 3 |
| CW-066 | Background job: full leaderboard recompute every 5min | Jobs | 3 |
| CW-067 | `leaderboard_snapshots` — snapshot at contest completion | DB+API | 2 |
| CW-068 | Like button component (optimistic UI) | UI | 2 |
| CW-069 | Vote button component (one per contest, confirmation modal) | UI | 3 |
| CW-070 | Comment thread component | UI | 3 |
| CW-071 | Share button component (copy link + social share) | UI | 2 |
| CW-072 | Leaderboard page: ranked entries with live score updates | UI | 4 |
| CW-073 | "Login to engage" modal for unauthenticated users | UI | 2 |
| CW-074 | Unit tests: leaderboard scoring algorithm | Testing | 2 |
| CW-075 | Integration tests: engagement endpoints + uniqueness | Testing | 3 |

**Sprint total: 54 SP**

---

## Phase 5 — Influencer Management

**Goal:** Admins assign influencers to contests. Influencers sign agreements, get tracking links, see daily stats.

### Tickets

| ID | Title | Type | SP |
|----|-------|------|----|
| CW-076 | Prisma migration: `influencer_contest_assignments` table | DB | 2 |
| CW-077 | Unique referral code generation per influencer (on user create) | Core | 2 |
| CW-078 | Admin: invite influencer to contest + set commission rate | UI | 3 |
| CW-079 | `POST /api/v1/admin/contests/[id]/influencers` — assign influencer | API | 3 |
| CW-080 | Service agreement page: display terms + checkbox acknowledge | UI | 3 |
| CW-081 | `POST /api/v1/influencers/assignments/[id]/sign` — record agreement | API | 2 |
| CW-082 | Influencer tracking link: `/ref/[code]` → register or track | API | 3 |
| CW-083 | Conversion tracking: attribute registrations to influencer referral | Core | 3 |
| CW-084 | Influencer dashboard: my contests, daily post checklist, stats | UI | 4 |
| CW-085 | `GET /api/v1/influencers/my-assignments` — assignments + stats | API | 2 |
| CW-086 | Integration tests: assignment flow + conversion tracking | Testing | 3 |

**Sprint total: 30 SP**

---

## Phase 6 — Email & Notifications

**Goal:** All transactional emails live. In-app notification bell with unread count.

### Tickets

| ID | Title | Type | SP |
|----|-------|------|----|
| CW-087 | Prisma migration: `notifications` table | DB | 1 |
| CW-088 | Resend client setup + domain verification (`packages/email`) | Infra | 2 |
| CW-089 | Email: Welcome (role-specific) — React Email template | Email | 3 |
| CW-090 | Email: Entry submission confirmation | Email | 2 |
| CW-091 | Email: Entry approved / rejected (with reason) | Email | 2 |
| CW-092 | Email: Contest going live — to influencers | Email | 2 |
| CW-093 | Email: Voting period open — to all contest participants | Email | 2 |
| CW-094 | Email: Contest results + winner announcement | Email | 3 |
| CW-095 | Email: Daily influencer stats digest | Email | 3 |
| CW-096 | Email: Prize payout initiated | Email | 2 |
| CW-097 | Notification bell + dropdown (in-app) | UI | 3 |
| CW-098 | `GET /api/v1/notifications` + `PATCH mark-read` | API | 2 |
| CW-099 | Notification service: create + trigger email on each event | Core | 3 |
| CW-100 | Unit tests: email templates render correctly | Testing | 2 |

**Sprint total: 32 SP**

---

## Phase 7 — Admin Panel

**Goal:** Full admin dashboard for contest ops, user management, entry queue, and analytics.

### Tickets

| ID | Title | Type | SP |
|----|-------|------|----|
| CW-101 | Admin layout + nav (role-gated, admin only) | UI | 2 |
| CW-102 | Admin: user list + search + filter by role | UI | 3 |
| CW-103 | Admin: user detail + ban/unban + role change | UI + API | 3 |
| CW-104 | Admin: contest list with status controls | UI | 2 |
| CW-105 | Admin: entry queue (paginated, filter by status) | UI | 3 |
| CW-106 | Admin: bulk approve/reject entries | UI + API | 3 |
| CW-107 | Admin: influencer assignment management | UI | 3 |
| CW-108 | Admin: analytics dashboard (member count by role, entries, votes) | UI | 4 |
| CW-109 | `GET /api/v1/admin/analytics` — platform-wide stats | API | 3 |
| CW-110 | `audit_log` table + write on all admin actions | DB + Core | 3 |
| CW-111 | Admin: audit log viewer | UI | 2 |
| CW-112 | Integration tests: admin API endpoints | Testing | 3 |

**Sprint total: 34 SP**

---

## Phase 8 — QA & Staging Hardening

**Goal:** Production-grade security, performance, and polish before launch.

### Tickets

| ID | Title | Type | SP |
|----|-------|------|----|
| CW-113 | Load test: 10k concurrent users (k6 or Artillery) | QA | 3 |
| CW-114 | Security audit: OWASP Top 10 check | Security | 3 |
| CW-115 | Accessibility audit: WCAG 2.1 AA (axe-core) | QA | 2 |
| CW-116 | Lighthouse CI: enforce LCP < 2.5s | QA | 2 |
| CW-117 | Rate limiting: harden engagement + auth endpoints | Security | 3 |
| CW-118 | Error boundaries + error monitoring (Sentry) | Infra | 2 |
| CW-119 | Leaderboard cache: stress test Redis sorted sets | QA | 2 |
| CW-120 | Video upload: test max file size (2GB) | QA | 1 |
| CW-121 | E2E test: full contest lifecycle (create → entry → vote → results) | Testing | 5 |
| CW-122 | Mobile responsiveness pass (all key flows) | UI | 3 |
| CW-123 | Database backup verification | DevOps | 1 |
| CW-124 | Staging smoke test checklist | QA | 2 |

**Sprint total: 29 SP**

---

## Phase 9 — Production Launch

**Goal:** Production environment live, monitoring in place, team ready.

### Tickets

| ID | Title | Type | SP |
|----|-------|------|----|
| CW-125 | Production env vars configured in Render | DevOps | 1 |
| CW-126 | Custom domain + SSL (collabworld.io) | DevOps | 1 |
| CW-127 | Resend domain verification (collabworld.io) | DevOps | 1 |
| CW-128 | Stripe production mode + Connect live | DevOps | 2 |
| CW-129 | Clerk production instance configured | DevOps | 1 |
| CW-130 | Mux production account + webhook configured | DevOps | 1 |
| CW-131 | Uptime monitoring (Render health checks + Better Uptime) | DevOps | 1 |
| CW-132 | Production smoke test: create contest → submit entry → vote | QA | 2 |
| CW-133 | Runbook: incident response procedure | Docs | 2 |

**Sprint total: 12 SP**

---

## Phase 10 — Marketplace (Phase 2)

**Goal:** Transform contest platform into full collaboration marketplace.

### Epic Breakdown (detailed tickets in separate ROADMAP-PHASE2.md)

| Epic | Description | Est. SP |
|------|-------------|---------|
| E-01 | Content library (upload music/film, streaming player) | 40 |
| E-02 | Fan subscription: free tier (ads) + premium $14.99/mo | 35 |
| E-03 | Collaboration packages (5 types, propose/accept workflow) | 45 |
| E-04 | Revenue tracking + 70/30 split ledger | 30 |
| E-05 | Stripe Connect payouts (creator + influencer) | 25 |
| E-06 | Brand self-serve campaign creation | 35 |
| E-07 | Direct messaging between users | 20 |
| E-08 | Content discovery + recommendation engine | 25 |

**Phase 2 total estimate: ~255 SP**

---

## Velocity Targets

| Phase | SP | Weeks |
|-------|-----|-------|
| 0: Foundation | 21 | 1 |
| 1: Auth | 31 | 1.5 |
| 2: Contests | 37 | 2 |
| 3: Entries | 45 | 2 |
| 4: Engagement | 54 | 2.5 |
| 5: Influencers | 30 | 1.5 |
| 6: Email | 32 | 1.5 |
| 7: Admin | 34 | 1.5 |
| 8: QA | 29 | 1.5 |
| 9: Launch | 12 | 0.5 |
| **Phase 1 Total** | **325** | **~16 wks** |

---

## Definition of Done

A ticket is **done** when:
- [ ] Feature works end-to-end in local dev
- [ ] Unit tests pass (`pnpm test:unit`)
- [ ] TypeScript compiles with no errors (`pnpm typecheck`)
- [ ] ESLint passes (`pnpm lint`)
- [ ] Code reviewed and approved (1 reviewer minimum)
- [ ] PR merged to `main`
- [ ] Staging deploy succeeds
- [ ] Relevant E2E test added or existing test updated
