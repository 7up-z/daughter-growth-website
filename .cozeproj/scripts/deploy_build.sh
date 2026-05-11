#!/bin/bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_DIR"

echo "Installing dependencies..."
pnpm install

echo "Applying database migrations..."
pnpm run db:migrate

echo "Building the project..."
pnpm run build

echo "Build completed successfully!"
