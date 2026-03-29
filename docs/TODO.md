> **Superseded by:** [ROADMAP-2026-03-29.md](ROADMAP-2026-03-29.md) — Updated 2026-03-29. All Phase 0 items complete.

# Collab World — Sprint 1 TODO

**Sprint:** Phase 0 Foundation | **Date:** 2026-03-22 | **Owner:** Development Team

---

## Immediate Actions (This Week)

### Infrastructure & Repo

- [ ] **CW-001** Initialize Turborepo monorepo with pnpm workspaces
  - `pnpm dlx create-turbo@latest` → select pnpm
  - Configure `turbo.json` with `build`, `dev`, `lint`, `test`, `typecheck` pipelines
  - Set up `pnpm-workspace.yaml` with `apps/*` and `packages/*`

- [ ] **CW-002** Configure `packages/db` — Prisma schema + migrations
  - Install `prisma`, `@prisma/client`
  - Create initial schema with all Phase 1 tables (see DATAMODEL.md)
  - First migration: `pnpm db:migrate --name init`
  - Export typed Prisma client

- [ ] **CW-003** Configure `packages/types`
  - Shared TypeScript interfaces for all domain entities
  - Re-export Prisma generated types + add API response types

- [ ] **CW-004** Configure `packages/ui`
  - Install shadcn/ui: `pnpm dlx shadcn@latest init`
  - Install Tailwind Catalyst: copy Catalyst components into package
  - Configure TailwindCSS with shared preset
  - Export: Button, Input, Card, Badge, Dialog, Table, Form, Select, Textarea

- [ ] **CW-005** Configure `packages/email`
  - Install `@react-email/components`, `resend`
  - Create base email layout template
  - Create `Welcome` email template stub

- [ ] **CW-006** Set up `apps/web` — Next.js 14
  - `pnpm create next-app@latest apps/web --typescript --tailwind --app --eslint`
  - Configure to use `packages/ui`, `packages/db`, `packages/types`, `packages/email`
  - Set up `@` path aliases
  - Configure TailwindCSS to extend from `packages/ui`

- [ ] **CW-007** GitHub Actions CI
  - File: `.github/workflows/ci.yml`
  - Jobs: `lint`, `typecheck`, `test`, `build`
  - Runs on: `push` to `main`, all `pull_request` events
  - Cache: pnpm store

- [ ] **CW-008** Render.com IaC
  - File: `render.yaml` (see template below)
  - Services: `collabworld-web` (Next.js), `collabworld-db` (PostgreSQL)
  - Health check path: `/api/health`
  - Build command: `pnpm build`
  - Start command: `pnpm start`

- [ ] **CW-009** Docker Compose
  - PostgreSQL 16
  - Redis 7
  - Volumes for data persistence
  - Health checks

- [ ] **CW-010** Testing setup
  - Vitest config in `apps/web`
  - `@testing-library/react`, `@testing-library/jest-dom`
  - Playwright: `pnpm exec playwright install`
  - `playwright.config.ts` with base URL http://localhost:3000

- [ ] **CW-011** Health endpoint
  - `apps/web/app/api/health/route.ts`
  - Returns `{ status: 'ok', db: boolean, timestamp: string }`
  - Checks Prisma connection

- [ ] **CW-012** Environment files
  - `.env.example` with all required keys (no values)
  - `SETUP.md` local dev guide
  - `.gitignore`: `.env.local`, `node_modules`, `.next`, `dist`

---

## GitHub Setup Checklist

- [ ] Create GitHub repo: `dbbuilder-org/CollabWorld`
- [ ] Push initial commit (scaffold)
- [ ] Add branch protection on `main`: require PR + 1 review + CI pass
- [ ] Create `staging` branch
- [ ] Create milestones: Phase 0, Phase 1, Phase 2... Phase 9
- [ ] Add labels: `type:feature`, `type:bug`, `type:chore`, `type:testing`, `type:docs`, `priority:high`, `priority:medium`, `priority:low`, `phase:0` through `phase:10`, `area:auth`, `area:contest`, `area:entry`, `area:engagement`, `area:influencer`, `area:email`, `area:admin`, `area:infra`
- [ ] Create GitHub issues for all Phase 0 tickets (CW-001 through CW-012)
- [ ] Create GitHub issues for Phase 1 tickets (CW-013 through CW-024) — backlog

---

## Render.com Setup

- [ ] Create Render account / connect to dbbuilder-org GitHub org
- [ ] Connect repository to Render
- [ ] Create PostgreSQL database service (Standard plan)
- [ ] Deploy web service from `render.yaml`
- [ ] Set all environment variables in Render dashboard
- [ ] Verify health check at `/api/health`

---

## External Services Setup

- [ ] **Clerk:** Create project, configure `collabworld` app, enable Google OAuth, create webhook pointing to staging URL
- [ ] **Mux:** Create account, get API keys, configure webhook endpoint
- [ ] **Resend:** Create account, add `collabworld.servicevision.io` domain (or dev domain), get API key
- [ ] **Upstash:** Create Redis database, copy REST URL + token
- [ ] **Stripe:** Create account, enable Stripe Connect, create `premium` subscription price ($14.99/month)

---

## Definition of Done — Phase 0

Phase 0 is complete when:
- [ ] `pnpm dev` starts without errors
- [ ] `pnpm build` succeeds
- [ ] `pnpm test` runs (even if no tests yet)
- [ ] `pnpm typecheck` passes
- [ ] CI runs on a test PR
- [ ] Health endpoint returns 200 on Render staging
- [ ] Prisma can connect to Render DB
- [ ] `README.md` is accurate

---

## Notes

- Use `pnpm` throughout — no `npm` or `yarn`
- All commits: conventional commit format (`feat:`, `fix:`, `chore:`, `test:`)
- Feature branches: `feature/CW-XXX-short-description`
- No direct commits to `main` after initial scaffold
