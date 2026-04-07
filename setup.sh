#!/usr/bin/env bash
set -euo pipefail

echo "=== LZX Frontend Setup ==="

# ---- Node.js check ----
if ! command -v node &>/dev/null; then
  echo "Error: Node.js is not installed. Install Node >= 18.19 from https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/^v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
NODE_MINOR=$(echo "$NODE_VERSION" | cut -d. -f2)

if (( NODE_MAJOR < 18 )) || { (( NODE_MAJOR == 18 )) && (( NODE_MINOR < 19 )); }; then
  echo "Error: Node >= 18.19 is required (found $NODE_VERSION)"
  exit 1
fi
echo "Node.js $NODE_VERSION OK"

# ---- Enable Corepack (provides Yarn 4) ----
if ! command -v corepack &>/dev/null; then
  echo "Installing corepack..."
  npm install -g corepack
fi

# Try without sudo first; fall back to sudo if permission denied
if ! corepack enable 2>/dev/null; then
  echo "corepack enable requires elevated permissions, retrying with sudo..."
  sudo corepack enable
fi
echo "Corepack enabled"

# ---- Install dependencies via Yarn ----
echo "Installing dependencies..."
yarn install

# ---- Environment file ----
if [ ! -f .env ]; then
  SESSION_SECRET=$(openssl rand -hex 32)
  echo ""
  echo "Creating .env with auto-generated SESSION_SECRET."
  cat > .env <<EOF
SESSION_SECRET=${SESSION_SECRET}
PUBLIC_STOREFRONT_API_TOKEN=
PRIVATE_STOREFRONT_API_TOKEN=
PUBLIC_STORE_DOMAIN=
PUBLIC_STOREFRONT_ID=
PUBLIC_STOREFRONT_API_VERSION=2024-04
CLUSTER_NAME=
DATA_API_BASE_URL=
DATA_API_KEY=
DATABASE_NAME=
EOF
  echo ".env file created. Please populate the remaining values before running the app."
  echo ""
  echo "Required variables still empty:"
  echo "  PUBLIC_STOREFRONT_API_TOKEN  - Shopify Storefront API public token"
  echo "  PRIVATE_STOREFRONT_API_TOKEN - Shopify Storefront API private token"
  echo "  PUBLIC_STORE_DOMAIN          - e.g. your-store.myshopify.com"
  echo "  PUBLIC_STOREFRONT_ID         - Shopify storefront ID"
  echo "  CLUSTER_NAME                 - MongoDB Atlas cluster name"
  echo "  DATA_API_BASE_URL            - MongoDB Data API base URL"
  echo "  DATA_API_KEY                 - MongoDB Data API key"
  echo "  DATABASE_NAME                - MongoDB database name"
else
  echo ".env already exists — skipping creation."
fi

echo ""
echo "Setup complete. Run ./build.sh to build, or 'yarn dev' to start the dev server."
