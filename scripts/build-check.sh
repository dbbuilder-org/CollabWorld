#!/usr/bin/env bash
# Simulates the Render build locally to catch errors before deploying.
# Usage: ./scripts/build-check.sh
set -e

cd "$(dirname "$0")/.."

# Load .env.local so DATABASE_URL and other vars are available
if [ -f apps/web/.env.local ]; then
  set -a
  source apps/web/.env.local
  set +a
fi

echo "==> Installing dependencies (NODE_ENV=development)..."
NODE_ENV=development pnpm install --frozen-lockfile

echo "==> Generating Prisma client..."
pnpm --filter @collabworld/db generate

echo "==> Type-checking source files..."
TS_ERRORS=$(pnpm --filter @collabworld/web exec tsc --noEmit 2>&1 | grep "error TS" | grep -v "__tests__" | grep -v ".next/" | grep -v "node_modules" || true)
if [ -n "$TS_ERRORS" ]; then
  echo "TypeScript errors found:"
  echo "$TS_ERRORS"
  exit 1
fi
echo "✓ No TypeScript errors in source"

echo "==> Running Next.js build..."
pnpm build

echo ""
echo "✓ Build succeeded — safe to deploy"
