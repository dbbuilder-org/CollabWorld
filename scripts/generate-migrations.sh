#!/usr/bin/env bash
# generate-migrations.sh
# Run this ONCE to generate the initial Prisma migration files.
# Requires a running local PostgreSQL instance.
#
# Usage:
#   docker compose up -d      # start local postgres
#   ./scripts/generate-migrations.sh
#   git add packages/db/prisma/migrations/
#   git commit -m "chore: generate initial prisma migration"

set -euo pipefail

echo "→ Generating Prisma migration from current schema..."
pnpm --filter @collabworld/db exec prisma migrate dev --name init

echo ""
echo "→ Migration files generated in packages/db/prisma/migrations/"
echo "→ Commit them with:"
echo "    git add packages/db/prisma/migrations/"
echo "    git commit -m 'chore: generate initial prisma migration'"
echo ""
echo "→ Update render.yaml to use migrate:deploy instead of db:push:"
echo "    Change: pnpm --filter @collabworld/db db:push"
echo "    To:     pnpm --filter @collabworld/db migrate:deploy"
