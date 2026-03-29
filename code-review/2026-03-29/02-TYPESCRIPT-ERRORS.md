# TypeScript Error Report — 2026-03-29

## Before / After

| Area | Before | After | Fixed | Deferred |
|------|--------|-------|-------|---------|
| Source (`app/`, `components/`, `lib/`) | 0 | 0 | 0 | 0 |
| Test files (`__tests__/`) | ~30 | ~30 | 0 | ~30 |

## Source File Errors: None

`pnpm --filter @collabworld/web exec tsc --noEmit` produces zero errors outside `__tests__/`.

## Test File Errors (Deferred)

All ~30 errors are the same root cause: Clerk auth mock shape.

**Pattern:**
```ts
// In test setup:
vi.mocked(auth).mockReturnValue({ userId: 'user_123', sessionClaims: { publicMetadata: { role: 'admin' } } })
// Error: Type '{ userId: string; sessionClaims: ... }' is not assignable to 'Auth'
// Missing: sessionId, actor, orgId, orgRole, protect, redirectToSignIn, etc.
```

**Files affected:**
- `__tests__/sprint7/admin-analytics.test.ts` (2 errors)
- `__tests__/sprint7/admin-contests.test.ts` (6 errors)
- `__tests__/sprint7/admin-entries.test.ts` (4 errors)
- `__tests__/sprint7/admin-users.test.ts` (5 errors)
- `__tests__/sprint9/clerk-webhook.test.ts` (8 errors — `Request` vs `NextRequest`)
- `__tests__/sprint8/security.test.tsx` (2 errors — missing `beforeEach`/`afterEach` types)
- `__tests__/sprint5/convert.test.ts` (1 error — implicit `any`)

**Fix approach (Sprint 1):** Create a `__tests__/helpers/clerk-mock.ts` that exports a typed `mockAuthAdmin()` and `mockAuthUser()` helper:
```ts
import type { Auth } from '@clerk/nextjs/server'
export const mockAuthAdmin = (): Auth => ({
  userId: 'user_admin',
  sessionId: 'sess_test',
  sessionClaims: { publicMetadata: { role: 'admin' } },
  actor: null,
  orgId: null,
  orgRole: null,
  orgSlug: null,
  orgPermissions: null,
  factorVerificationAge: null,
  // ...
} as Auth)
```
