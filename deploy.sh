#!/usr/bin/env bash
set -euo pipefail

echo "=== LZX Frontend Deploy ==="

# ---- Pre-flight checks ----
if [ ! -d node_modules ]; then
  echo "node_modules not found — running setup first..."
  bash "$(dirname "$0")/setup.sh"
fi

if [ ! -d dist ]; then
  echo "dist/ not found — running build first..."
  bash "$(dirname "$0")/build.sh"
fi

# ---- Deploy to Shopify Oxygen ----
echo "Deploying to Shopify Oxygen..."
yarn shopify hydrogen deploy

echo ""
echo "Deploy complete."
