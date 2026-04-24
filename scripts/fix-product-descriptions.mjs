#!/usr/bin/env node
/**
 * Fix specific product description issues found during website audit:
 * 1. Chromagnon: /docs/blog link → /blog
 * 2. Vidiot: empty markdown-style link [](https://...)
 *
 * Usage:
 *   node scripts/fix-product-descriptions.mjs --dry-run   # preview (default)
 *   node scripts/fix-product-descriptions.mjs --apply      # write to Shopify
 */

import dotenv from 'dotenv';
dotenv.config({override: true});

const {
  PUBLIC_STORE_DOMAIN,
  SHOPIFY_CLIENT_ID,
  SHOPIFY_CLIENT_SECRET,
  PUBLIC_STOREFRONT_API_VERSION = '2025-04',
} = process.env;

if (!PUBLIC_STORE_DOMAIN || !SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET) {
  console.error(
    'Missing required env vars: PUBLIC_STORE_DOMAIN, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET',
  );
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');

// ─── Auth ────────────────────────────────────────────────────────────────────

async function getAccessToken() {
  const res = await fetch(
    `https://${PUBLIC_STORE_DOMAIN}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
      }),
    },
  );
  if (!res.ok)
    throw new Error(`OAuth failed ${res.status}: ${await res.text()}`);
  return (await res.json()).access_token;
}

async function adminGql(token, query, variables = {}) {
  const res = await fetch(
    `https://${PUBLIC_STORE_DOMAIN}/admin/api/${PUBLIC_STOREFRONT_API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({query, variables}),
    },
  );
  if (!res.ok) throw new Error(`Admin API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors?.length)
    throw new Error(
      `GraphQL errors: ${json.errors.map((e) => e.message).join('; ')}`,
    );
  return json.data;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

const FIND_PRODUCTS = `
  query FindProducts($query: String!) {
    products(first: 10, query: $query) {
      nodes { id title handle descriptionHtml }
    }
  }
`;

const UPDATE_MUTATION = `
  mutation UpdateProduct($input: ProductInput!) {
    productUpdate(input: $input) {
      product { id title }
      userErrors { field message }
    }
  }
`;

// ─── Fixes ───────────────────────────────────────────────────────────────────

const FIXES = [
  {
    handle: 'chromagnon',
    description: 'Fix /docs/blog link → /blog',
    transform(html) {
      // Fix links pointing to /docs/blog → /blog
      return html.replace(
        /href="(https?:\/\/[^"]*)?\/docs\/blog"/gi,
        'href="/blog"',
      );
    },
  },
  {
    handle: 'vidiot',
    description:
      'Remove empty link [](url) rendered as <a href="..."></a> with no text',
    transform(html) {
      // Remove <a> tags that have no inner text/content (empty links)
      return html.replace(
        /<a\s+[^>]*href="https?:\/\/www\.lzxindustries\.net\/products\/vidiot"[^>]*>\s*<\/a>/gi,
        '',
      );
    },
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(
    `Mode: ${
      APPLY ? 'APPLY (writing to Shopify)' : 'DRY RUN (preview only)'
    }\n`,
  );

  console.log('Authenticating...');
  const token = await getAccessToken();
  console.log('Authenticated OK\n');

  for (const fix of FIXES) {
    console.log(`━━━ ${fix.handle}: ${fix.description} ━━━`);

    const data = await adminGql(token, FIND_PRODUCTS, {
      query: `handle:${fix.handle}`,
    });
    const product = data.products.nodes.find((p) => p.handle === fix.handle);

    if (!product) {
      console.log(`  ⚠ Product "${fix.handle}" not found — skipping\n`);
      continue;
    }

    const original = product.descriptionHtml || '';
    const cleaned = fix.transform(original);

    if (cleaned === original) {
      console.log(`  ✓ No changes needed (already clean)\n`);
      continue;
    }

    // Show diff context
    console.log('  BEFORE (relevant excerpt):');
    // Find changed regions
    const origLines = original.split('\n');
    const cleanLines = cleaned.split('\n');
    for (let i = 0; i < origLines.length; i++) {
      if (origLines[i] !== (cleanLines[i] || '')) {
        console.log(`    L${i}: ${origLines[i].substring(0, 200)}`);
      }
    }
    console.log('  AFTER (relevant excerpt):');
    for (let i = 0; i < cleanLines.length; i++) {
      if (cleanLines[i] !== (origLines[i] || '')) {
        console.log(`    L${i}: ${cleanLines[i].substring(0, 200)}`);
      }
    }

    if (APPLY) {
      const result = await adminGql(token, UPDATE_MUTATION, {
        input: {id: product.id, descriptionHtml: cleaned},
      });
      if (result.productUpdate.userErrors?.length) {
        console.log(
          `  ✗ Failed: ${result.productUpdate.userErrors
            .map((e) => e.message)
            .join('; ')}`,
        );
      } else {
        console.log(`  ✓ Updated`);
      }
    } else {
      console.log('  (dry run — no changes written)');
    }
    console.log('');
  }

  if (!APPLY) {
    console.log('Run with --apply to write changes to Shopify.');
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
