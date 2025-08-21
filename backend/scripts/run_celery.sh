#!/usr/bin/env bash
set -Eeuo pipefail
APP_HOME="${APP_HOME:-"$(cd "$(dirname "$0")/.."; pwd)"}"
cd "$APP_HOME"

set -a
[ -f .env ] && . ./.env
set +a

exec "$APP_HOME/venv/bin/celery" -A config worker \
  --loglevel=info --concurrency=2 -Q execution_queue
