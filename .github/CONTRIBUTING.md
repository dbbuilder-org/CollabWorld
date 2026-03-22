# Contributing to Collab World

## Branch Naming

```
feature/CW-XXX-short-description    ← new features
fix/CW-XXX-short-description        ← bug fixes
chore/CW-XXX-short-description      ← maintenance
test/CW-XXX-short-description       ← test additions
docs/CW-XXX-short-description       ← documentation only
```

## Commit Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(entries): add chunked video upload with progress bar
fix(leaderboard): correct vote weight in composite score
chore(deps): upgrade prisma to 5.x
test(engagement): add vote uniqueness integration test
docs(setup): update Mux webhook configuration steps
```

## Workflow

1. Pick a ticket from the GitHub Issues board
2. Create branch: `git checkout -b feature/CW-XXX-description`
3. Write tests first (TDD: red → green → refactor)
4. Implement the feature
5. Run full check: `pnpm test && pnpm typecheck && pnpm lint`
6. Open PR against `main` using the PR template
7. Request review from at least 1 team member
8. Squash + merge after approval + CI green

## TDD Approach

For each feature:

```
1. Write failing test(s) that describe the expected behavior
2. Run test → confirm it fails (red)
3. Write minimum code to make test pass (green)
4. Refactor without breaking tests (refactor)
5. Add integration/E2E test for user-facing flows
```

### Test organization
```
apps/web/
├── app/api/v1/entries/__tests__/
│   ├── upload-url.test.ts      ← unit: mux URL generation
│   └── create-entry.test.ts    ← integration: DB write
├── components/entries/__tests__/
│   └── EntryCard.test.tsx      ← component: render + interactions
└── tests/e2e/
    └── entry-submission.spec.ts ← E2E: full user flow
```

## Code Standards

- **TypeScript strict mode** — no `any`, no `as` casts without comment
- **Zod** for all API input validation (never trust request body)
- **Prisma** for all DB access — no raw SQL except in migrations
- **No inline styles** — TailwindCSS only
- **Server Components** by default — use `'use client'` only when needed
- **Error handling** — API routes return typed `{ error: string }` on failure
- **Auth** — all protected routes check `auth()` from Clerk at route level

## Database Changes

1. Edit `packages/db/prisma/schema.prisma`
2. Run `pnpm db:migrate:create --name description-of-change`
3. Review generated SQL in `packages/db/prisma/migrations/`
4. Commit migration file with the PR (never commit schema without migration)

## Environment Variables

- Add new vars to `.env.example` with a comment explaining what they're for
- Never commit actual values
- Document new vars in `docs/SETUP.md` under the relevant section

## Package Responsibilities

| Package | What belongs here |
|---------|------------------|
| `packages/db` | Prisma schema, client, seed, migrations |
| `packages/types` | Shared TypeScript interfaces and API types |
| `packages/ui` | Reusable UI components (shadcn + Catalyst) |
| `packages/email` | React Email templates, Resend send helpers |
| `apps/web` | Everything else — pages, API routes, app logic |
