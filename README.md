# Collab World

**The Collaboration Economy for Film & Music**

Collab World is a next-generation entertainment platform that unites creators, influencers, brands, and fans into one collaborative, revenue-sharing ecosystem.

## Quick Links

| Document | Purpose |
|----------|---------|
| [REQUIREMENTS](docs/REQUIREMENTS.md) | What the system does — functional + non-functional specs |
| [ARCHITECTURE](docs/ARCHITECTURE.md) | How it's built — tech stack, system design, ADRs |
| [DATAMODEL](docs/DATAMODEL.md) | Database schema — all tables, fields, indexes |
| [SETUP](docs/SETUP.md) | Local development setup guide |
| [ROADMAP](docs/ROADMAP.md) | Phased delivery plan — all 133 Phase 1 tickets |
| [TODO](docs/TODO.md) | Current sprint tasks |
| [CONTRIBUTING](.github/CONTRIBUTING.md) | Branch strategy, commit format, TDD workflow |

## Tech Stack

| | |
|-|-|
| **Framework** | Next.js 14 (App Router) + TypeScript |
| **Monorepo** | Turborepo + pnpm workspaces |
| **Auth** | Clerk |
| **Database** | PostgreSQL 16 (Render) + Prisma ORM |
| **Styling** | TailwindCSS + Tailwind Catalyst + shadcn/ui |
| **Video** | Mux |
| **Email** | Resend + React Email |
| **Payments** | Stripe + Stripe Connect |
| **Cache** | Upstash Redis |
| **Deploy** | Render.com (IaC via render.yaml) |
| **Testing** | Vitest + Playwright |

## Getting Started

```bash
git clone https://github.com/dbbuilder-org/CollabWorld.git
cd CollabWorld
pnpm install
cp .env.example .env.local
# Fill in .env.local — see docs/SETUP.md
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm dev
```

App runs at http://localhost:3000

## Monorepo Structure

```
CollabWorld/
├── apps/
│   └── web/          ← Next.js 14 (port 3000)
├── packages/
│   ├── db/           ← Prisma schema + client
│   ├── ui/           ← shadcn/ui + Catalyst components
│   ├── email/        ← React Email templates
│   └── types/        ← Shared TypeScript types
├── render.yaml       ← Render.com deployment
└── docs/             ← Project documentation
```

## Development Commands

```bash
pnpm dev              # Start all services
pnpm test             # Run all tests
pnpm typecheck        # TypeScript check
pnpm lint             # ESLint
pnpm db:studio        # Prisma Studio
```

## Platform Overview

### Phase 1 — Viral Contest Engine
Structured, performance-driven contests where:
- **Creators** produce brand-integrated film trailers or music videos
- **Influencers** promote contest entries daily (signed service agreements)
- **Brands** fund prize pools and affiliate commissions
- **Fans** register to like, vote, comment, and share

The contest model converts engaged audiences into registered platform members — targeting 500,000+ members per contest cycle.

### Phase 2 — Collaboration Marketplace
Once critical mass is achieved:
- Creators stream content (ad-supported free / $14.99/month premium)
- Structured collaboration packages (5 types) between all user types
- 70/30 revenue split — creators keep 70%
- Automated Stripe Connect payouts

## Deployment

- **Production:** https://collabworld.io (auto-deploys from `main`)
- **Staging:** https://staging.collabworld.io (auto-deploys from `staging`)

See [render.yaml](render.yaml) for full IaC configuration.

---

Built with ❤️ by [ServiceVision](https://servicevision.net) for RyanJae Entertainment
