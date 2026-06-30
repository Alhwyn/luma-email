#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ENV_FILE="$ROOT/.env"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +a
fi

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "setup-deps: set GITHUB_TOKEN in .env (PAT with read:packages)" >&2
  echo "  https://github.com/settings/tokens" >&2
  exit 1
fi

cd "$ROOT"
bun install
