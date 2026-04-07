#!/usr/bin/env bash
set -euo pipefail

echo "=== LZX Frontend Build ==="

# ---- Pre-flight checks ----
if [ ! -d node_modules ]; then
  echo "node_modules not found — running setup first..."
  bash "$(dirname "$0")/setup.sh"
fi

# ---- Type checking (non-blocking) ----
echo "Running type check..."
if ! yarn typecheck; then
  echo ""
  echo "Warning: typecheck reported errors (see above). Continuing with build..."
  echo ""
fi

# ---- Production build (includes GraphQL codegen) ----
echo "Building for production..."
yarn build

echo ""
echo "Build complete. Output is in dist/."
echo "Run ./deploy.sh to deploy, or 'yarn preview' to preview locally."
