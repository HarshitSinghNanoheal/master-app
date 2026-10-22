#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

cd /app/backend
npx prisma migrate deploy

nginx
exec node --experimental-strip-types src/server.ts
