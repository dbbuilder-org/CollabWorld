# Collab World — Architecture

**Version:** 1.0 | **Date:** 2026-03-22 | **Status:** Approved

---

## 1. System Overview

Collab World is a **Next.js 14 monolith** deployed on Render.com with a managed PostgreSQL database. The system is designed to handle two phases of growth: a viral contest engine (Phase 1) that can scale to hundreds of thousands of members, evolving into a full collaboration marketplace (Phase 2).

```
┌────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                        │
│         Next.js 14 App Router + TailwindCSS + shadcn       │
└─────────────────────────┬──────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────▼──────────────────────────────────┐
│              RENDER.COM — Web Service (Next.js)             │
│   ┌─────────────────┐  ┌──────────────┐  ┌─────────────┐  │
│   │  App Router UI  │  │  API Routes  │  │  Clerk Auth │  │
│   │  (RSC + Client) │  │  /api/v1/*   │  │  Middleware │  │
│   └─────────────────┘  └──────┬───────┘  └─────────────┘  │
└──────────────────────────────┼─────────────────────────────┘
                               │
       ┌───────────────────────┼────────────────────────┐
       │                       │                        │
┌──────▼──────┐  ┌─────────────▼────┐  ┌───────────────▼──┐
│  Render DB   │  │  Upstash Redis   │  │  External APIs   │
│  PostgreSQL  │  │  (Cache + Queue) │  │  Mux, Stripe,    │
│  (Managed)   │  │                  │  │  Resend, Clerk   │
└─────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 14 (App Router) | RSC for performance, API routes co-located, SEO-friendly |
| **Language** | TypeScript 5.x | Type safety across full stack |
| **Auth** | Clerk | Multi-role auth, social login, webhooks, zero custom session code |
| **Database** | PostgreSQL 16 (Render managed) | ACID compliance, complex queries, connection pooling built-in |
| **ORM** | Prisma 5.x | Type-safe queries, migrations, seeding |
| **Styling** | TailwindCSS + Catalyst + shadcn/ui | Licensed Catalyst components + shadcn for accessibility |
| **Email** | Resend + React Email | Transactional email with React templates |
| **Video** | Mux | Upload, transcode, CDN streaming, thumbnail generation |
| **Payments** | Stripe | Subscriptions, Connect (creator payouts), brand funding |
| **Cache/Queue** | Upstash Redis | Leaderboard hot cache, background job queue |
| **File Storage** | Mux (video) + Cloudflare R2 (assets) | Separate concerns for streaming vs. static files |
| **Deployment** | Render.com | IaC via render.yaml, auto-deploys from GitHub |
| **Testing** | Vitest + React Testing Library + Playwright | Fast unit, component, and E2E coverage |
| **CI/CD** | GitHub Actions | Run tests + type-check on every PR |

---

## 3. Application Structure

```
collabworld/
├── app/                        # Next.js App Router
│   ├── (public)/               # Unauthenticated routes
│   │   ├── page.tsx            # Marketing home
│   │   ├── contests/           # Public contest browse
│   │   │   └── [slug]/         # Individual contest + entries
│   │   └── sign-in/ sign-up/  # Clerk auth pages
│   ├── (auth)/                 # Authenticated routes (Clerk middleware)
│   │   ├── dashboard/          # Role-based dashboard
│   │   ├── contests/           # Contest participation
│   │   ├── entries/            # Entry management
│   │   ├── leaderboard/        # Live leaderboard
│   │   ├── packages/           # Collab packages (Phase 2)
│   │   ├── streaming/          # Content streaming (Phase 2)
│   │   ├── earnings/           # Revenue dashboard
│   │   └── settings/           # Profile + account settings
│   ├── admin/                  # Admin panel (role-gated)
│   │   ├── contests/
│   │   ├── entries/
│   │   ├── users/
│   │   └── analytics/
│   └── api/
│       └── v1/
│           ├── webhooks/       # Clerk, Stripe, Mux webhooks
│           ├── contests/
│           ├── entries/
│           ├── engagement/
│           ├── leaderboard/
│           ├── users/
│           ├── packages/       # Phase 2
│           ├── revenue/        # Phase 2
│           └── health/
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── catalyst/               # Tailwind Catalyst components
│   ├── forms/                  # Form components with react-hook-form
│   ├── contests/               # Contest-specific components
│   ├── entries/                # Entry cards, video player
│   ├── leaderboard/            # Leaderboard table + live updates
│   ├── email/                  # React Email templates
│   └── layout/                 # Nav, sidebar, shell
├── lib/
│   ├── db.ts                   # Prisma client singleton
│   ├── auth.ts                 # Clerk helpers + role utils
│   ├── mux.ts                  # Mux upload + asset helpers
│   ├── stripe.ts               # Stripe client + helpers
│   ├── resend.ts               # Resend client + send helpers
│   ├── redis.ts                # Upstash Redis client
│   ├── leaderboard.ts          # Score computation + cache logic
│   └── validations/            # Zod schemas
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/
│   ├── unit/                   # Vitest unit tests
│   ├── integration/            # API route tests
│   └── e2e/                    # Playwright tests
├── .github/
│   ├── workflows/
│   │   └── ci.yml
│   └── ISSUE_TEMPLATE/
├── render.yaml                 # Render IaC
├── .env.example
└── package.json
```

---

## 4. Authentication Architecture (Clerk)

```
User visits page
    │
    ▼
Clerk Middleware (middleware.ts)
    ├── Public route? → Serve directly
    └── Protected route?
            ├── Has session? → Inject auth context → Serve
            └── No session? → Redirect to /sign-in

Role enforcement:
    Clerk user metadata: { role: 'fan' | 'creator' | 'influencer' | 'brand' | 'admin' }
    Set during onboarding, synced to DB via webhook
    API routes check: auth().sessionClaims?.publicMetadata?.role
```

**Clerk Webhooks** → `/api/v1/webhooks/clerk`
- `user.created` → Create DB user record + send welcome email
- `user.updated` → Sync profile changes to DB
- `user.deleted` → Anonymize user data

---

## 5. Video Upload Flow (Mux)

```
Creator selects file (browser)
    │
    ▼
POST /api/v1/entries/upload-url
    → Mux.Video.Uploads.create() → returns upload_url + upload_id
    │
    ▼
Browser uploads directly to Mux (presigned URL, chunked)
    │
    ▼
Mux processes → fires webhook → /api/v1/webhooks/mux
    ├── video.upload.asset_created → Store asset_id in DB
    ├── video.asset.ready → Update entry status, store playback_id + thumbnail
    └── video.asset.errored → Notify creator, mark entry failed
```

---

## 6. Leaderboard Cache Strategy

- Leaderboard scores computed on write (engagement event)
- Stored in Redis sorted set: `leaderboard:{contest_id}`
- Score = votes×3 + likes×1 + comments×0.5 + shares×2
- TTL: refreshed on every engagement write during active contest
- Read path: Redis → miss → Postgres aggregate → re-cache
- Background job recomputes full leaderboard every 5 min (active) / 30 min (voting)

---

## 7. Email Architecture (Resend)

- Templates written as React Email components in `components/email/`
- Sent via `resend.emails.send()` in API routes or background jobs
- Domain: `@collabworld.io` (configure DNS on Resend)
- Transactional only in Phase 1; marketing emails deferred

---

## 8. Deployment — Render.com

### Services defined in `render.yaml`:

| Service | Type | Plan |
|---------|------|------|
| `collabworld-web` | Web Service (Node/Next.js) | Starter+ (auto-scale) |
| `collabworld-db` | PostgreSQL | Standard (with backups) |
| `collabworld-redis` | Redis (Upstash external) | Free → Pro |

### Environment promotion:
- `main` branch → Production (auto-deploy)
- `staging` branch → Staging (auto-deploy)
- Feature branches → Preview environments (manual trigger)

### Health checks:
- `GET /api/health` → `{ status: 'ok', db: 'connected', timestamp }` — checked every 30s

---

## 9. Key Architectural Decisions (ADRs)

### ADR-001: Next.js Monolith vs. Separate API
**Decision:** Single Next.js app with API routes.
**Rationale:** Phase 1 scale doesn't justify microservice complexity. Render.com horizontal scaling handles peak load. Easier to iterate.

### ADR-002: Prisma ORM
**Decision:** Prisma with PostgreSQL.
**Rationale:** Type-safe queries eliminate a class of bugs. Migration system is mature. Generates TypeScript types directly from schema.

### ADR-003: Mux for Video
**Decision:** Mux over self-hosted or Cloudflare Stream.
**Rationale:** Mux handles upload, transcoding, adaptive streaming, and thumbnail generation. Per-minute pricing scales with actual usage. SDK integrates cleanly with Next.js.

### ADR-004: Redis for Leaderboard
**Decision:** Upstash Redis sorted sets for leaderboard hot path.
**Rationale:** Leaderboard reads will be high-frequency during contest. Redis sorted sets give O(log N) updates and O(log N + K) range reads. Upstash is serverless-compatible and free to start.

### ADR-005: Clerk for Auth
**Decision:** Clerk over NextAuth or custom auth.
**Rationale:** Multi-role metadata, social OAuth, webhook sync, and managed session handling. Reduces auth surface area dramatically for a platform that will handle financial transactions.
