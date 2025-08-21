#!/usr/bin/env bash
set -Eeuo pipefail

APP_HOME="${APP_HOME:-"$(cd "$(dirname "$0")/.."; pwd)"}"
cd "$APP_HOME"

# Load env if present
set -a
[ -f .env ] && . ./.env
set +a

# Gunicorn from venv
exec "$APP_HOME/venv/bin/gunicorn" config.wsgi:application \
  --workers 4 --bind 127.0.0.1:8000 --keep-alive 60
