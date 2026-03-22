# Collab World — Developer Setup

**Version:** 1.0 | **Date:** 2026-03-22

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20 LTS+ | `nvm install 20` |
| pnpm | 9.x | `npm i -g pnpm@9` |
| Docker Desktop | latest | https://www.docker.com/products/docker-desktop |
| Git | 2.x | system |

---

## 1. Clone & Install

```bash
git clone https://github.com/dbbuilder-org/CollabWorld.git
cd CollabWorld
pnpm install
```

---

## 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` — see each section below. **Never commit `.env.local`.**

### 2.1 Database
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/collabworld"
```

### 2.2 Clerk (Auth)
Create a project at https://dashboard.clerk.com
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...   # from Clerk dashboard → Webhooks
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### 2.3 Mux (Video)
Create account at https://dashboard.mux.com
```env
MUX_TOKEN_ID=...
MUX_TOKEN_SECRET=...
MUX_WEBHOOK_SECRET=...
```

### 2.4 Resend (Email)
Create account at https://resend.com
```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL="Collab World <hello@collabworld.servicevision.io>"
```

### 2.5 Stripe (Payments)
Create account at https://dashboard.stripe.com
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PREMIUM_PRICE_ID=price_...  # $14.99/month premium plan
```

### 2.6 Redis (Upstash)
Create database at https://console.upstash.com
```env
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

### 2.7 Cloudflare R2 (Static Assets)
```env
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=collabworld-assets
R2_PUBLIC_URL=https://assets.collabworld.servicevision.io
```

### 2.8 App
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 3. Local Database

```bash
# Start PostgreSQL and Redis via Docker
docker compose up -d

# Run Prisma migrations
pnpm db:migrate

# Seed with test data
pnpm db:seed
```

**`docker-compose.yml` services:**
- PostgreSQL 16 on port `5432`
- Redis on port `6379`

---

## 4. Running Locally

```bash
# Run all apps and packages in dev mode (turborepo)
pnpm dev

# Run only the web app
pnpm --filter @collabworld/web dev

# Run Prisma Studio (DB browser)
pnpm db:studio
```

Web app runs at: http://localhost:3000
Prisma Studio at: http://localhost:5555

---

## 5. Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all services in watch mode |
| `pnpm build` | Build all packages for production |
| `pnpm test` | Run all tests (Vitest + Playwright) |
| `pnpm test:unit` | Run unit tests only |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm lint` | ESLint across all packages |
| `pnpm typecheck` | TypeScript check across all packages |
| `pnpm db:migrate` | Apply pending Prisma migrations |
| `pnpm db:migrate:create` | Create a new migration |
| `pnpm db:seed` | Seed the database with test data |
| `pnpm db:reset` | Drop, re-migrate, re-seed (⚠ destructive) |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm format` | Prettier format all files |

---

## 6. Webhooks (Local Dev)

Use Stripe CLI and Clerk CLI to forward webhooks to localhost:

```bash
# Stripe
stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe

# Clerk — use the Clerk dashboard "Testing" mode with ngrok
ngrok http 3000
# Set ngrok URL in Clerk dashboard → Webhooks

# Mux — use ngrok
# Set ngrok URL in Mux dashboard → Webhooks
```

---

## 7. Monorepo Structure

```
CollabWorld/                    ← Turborepo root
├── apps/
│   └── web/                    ← Next.js 14 app (primary)
├── packages/
│   ├── db/                     ← Prisma schema + client
│   ├── ui/                     ← Shared shadcn/Catalyst components
│   ├── email/                  ← React Email templates
│   └── types/                  ← Shared TypeScript types
├── turbo.json
├── pnpm-workspace.yaml
├── docker-compose.yml
├── render.yaml
└── package.json
```

---

## 8. Testing Guide

### Unit Tests (Vitest)
```bash
pnpm test:unit
# or in watch mode:
pnpm test:unit --watch
```

Tests live alongside source files in `__tests__/` directories or with `.test.ts` suffix.

### Integration Tests
API route tests use Vitest with a test database (`DATABASE_URL_TEST`).
```bash
pnpm test:integration
```

### E2E Tests (Playwright)
```bash
# Install Playwright browsers (first time)
pnpm exec playwright install

# Run E2E tests
pnpm test:e2e

# Run in UI mode (interactive)
pnpm test:e2e --ui
```

E2E tests run against a local dev server with a seeded test database.

---

## 9. Code Quality

- **ESLint:** `pnpm lint` — must pass on all PRs
- **TypeScript:** `pnpm typecheck` — must pass with `strict: true`
- **Prettier:** auto-formatted on commit via lint-staged
- **Husky:** pre-commit hooks run lint + typecheck

---

## 10. Render.com Deployment

```bash
# Render auto-deploys from main branch
# Manual deploy via Render dashboard or:
render deploy --service collabworld-web
```

Environment variables are set in the Render dashboard (copy from `.env.local`, excluding local-only vars).

Production URL: https://collabworld.servicevision.io
Staging URL: https://staging.collabworld.servicevision.io

---

## 11. Common Issues

**`prisma generate` fails after install**
```bash
pnpm --filter @collabworld/db generate
```

**Clerk middleware redirect loop**
- Ensure `NEXT_PUBLIC_CLERK_*` variables are set in `.env.local`
- Check that `/sign-in` and `/sign-up` are in the public routes list in `middleware.ts`

**Docker ports in use**
```bash
docker compose down && docker compose up -d
```

**Mux upload timeouts locally**
- Use Mux test mode — uploads don't actually process in test mode
- Check `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET` are correct
