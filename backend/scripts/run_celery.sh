#!/bin/sh
set -Eeuo pipefail
APP_HOME=${APP_HOME:-/home/steakystick/backdrop/backend}
cd "$APP_HOME"

set -a
[ -f .env ] && . ./.env
set +a

exec "$APP_HOME/venv/bin/celery" -A config worker \
  --loglevel=info --concurrency=2 -Q execution_queue
