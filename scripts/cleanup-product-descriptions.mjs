#!/usr/bin/env node
/**
 * One-off script: Clean up Shopify product descriptions via Admin GraphQL API.
 *
 * Cleanup rules:
 *  1. Remove orphaned PDF references (e.g. "Owner's Manual (PDF)")
 *  2. Remove stale availability notices ("SOLD OUT", "No longer available", "Limited stock", etc.)
 *  3. Remove raw spec lines (Width/Mounting Depth/Power) -- these live in metafields now
 *  4. Normalize legacy URLs (community.lzxindustries.net, docs.lzxindustries.net, github lzxdocs)
 *  5. Strip leading/trailing whitespace and collapse excessive blank lines
 *
 * Usage:
 *   node scripts/cleanup-product-descriptions.mjs --dry-run   # preview only (default)
 *   node scripts/cleanup-product-descriptions.mjs --apply      # actually update Shopify
 */

import dotenv from 'dotenv';

// For this one-off maintenance script, prefer checked-in local env values
// over inherited shell exports to avoid stale app credentials.
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
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OAuth failed ${res.status}: ${text}`);
  }
  const json = await res.json();
  return json.access_token;
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
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Admin API ${res.status}: ${text}`);
  }
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(
      `GraphQL errors: ${json.errors.map((e) => e.message).join('; ')}`,
    );
  }
  return json.data;
}

// ─── Fetch all products ──────────────────────────────────────────────────────

const PRODUCTS_QUERY = `
  query Products($cursor: String) {
    products(first: 50, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        title
        descriptionHtml
      }
    }
  }
`;

async function fetchAllProducts(token) {
  const products = [];
  let cursor = null;
  let page = 0;
  do {
    const data = await adminGql(token, PRODUCTS_QUERY, {cursor});
    products.push(...data.products.nodes);
    cursor = data.products.pageInfo.hasNextPage
      ? data.products.pageInfo.endCursor
      : null;
    page++;
    console.log(`  Fetched page ${page} (${products.length} products so far)`);
  } while (cursor);
  return products;
}

// ─── Cleanup logic ───────────────────────────────────────────────────────────

/**
 * Patterns to remove from descriptions.
 * Each pattern is applied to the descriptionHtml string.
 */
const REMOVAL_PATTERNS = [
  // Orphaned PDF references (with or without links)
  /(?:<a[^>]*>)?\s*(?:Owner'?s?\s+Manual|User\s+Reference\s+Card|Info\s+Sheet)\s*\(PDF\)\s*(?:<\/a>)?/gi,
  /(?:<a[^>]*>)?\s*(?:View\s+the\s+Owner'?s?\s+Manual\s+on\s+the\s+LZX\s+Community\s+Forum)\s*(?:<\/a>)?/gi,
  /(?:<a[^>]*>)?\s*(?:Download\s+the\s+User\s+Reference\s+Card\s+\[PDF\])\s*(?:<\/a>)?/gi,

  // Stale availability / limited edition notices
  /Limited\s+edition\s+black\s+panel\s+(?:shipping\s+in\s+\S+\.?)?\s*SOLD\s+OUT\.?\s*/gi,
  /Limited\s+edition\s+black\s+panel\s+SOLD\s+OUT!?\s*/gi,
  /Limited\s+stock\.?\s*/gi,
  /No\s+longer\s+available\.?\s*/gi,
  /Temporarily\s+unavailable\.?\s*/gi,
  /SOLD\s+OUT\.?\s*/gi,

  // Raw spec lines (Width, Mounting Depth, Power)
  /Width,?\s+\d+HP\s*/gi,
  /Mounting\s+Depth,?\s+\d+mm\s*/gi,
  /Power\s+\+12V\s+@\s+\d+mA\s*/gi,
  /Power\s+-12V\s+@\s+\d+mA\s*/gi,
  /Power\s+\+5V\s+@\s+\d+mA\s*/gi,
];

/**
 * URL rewriting rules: [pattern, replacement]
 */
const URL_REWRITES = [
  // community.lzxindustries.net → community.lzxindustries.net (keep as-is, it is a valid external site)
  // docs.lzxindustries.net/foo → /docs/foo (server already redirects, but normalize in descriptions)
  [/https?:\/\/docs\.lzxindustries\.net\/?/gi, 'https://lzxindustries.net/docs/'],
  // github lzxdocs → /docs/
  [
    /https?:\/\/github\.com\/lzxindustries\/lzxdocs[^\s<"]*/gi,
    'https://lzxindustries.net/docs/',
  ],
];

function cleanDescription(html) {
  if (!html) return html;

  let cleaned = html;

  // Apply removal patterns
  for (const pattern of REMOVAL_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Apply URL rewrites
  for (const [pattern, replacement] of URL_REWRITES) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  // Collapse runs of <br> / whitespace
  cleaned = cleaned.replace(/(<br\s*\/?\s*>\s*){3,}/gi, '<br><br>');
  // Remove empty paragraphs
  cleaned = cleaned.replace(/<p>\s*<\/p>/gi, '');
  // Trim leading/trailing whitespace and <br>
  cleaned = cleaned.replace(/^(\s|<br\s*\/?\s*>)+/i, '');
  cleaned = cleaned.replace(/(\s|<br\s*\/?\s*>)+$/i, '');
  // Collapse multiple spaces
  cleaned = cleaned.replace(/  +/g, ' ');

  return cleaned.trim();
}

// ─── Update mutation ─────────────────────────────────────────────────────────

const UPDATE_MUTATION = `
  mutation UpdateProduct($input: ProductInput!) {
    productUpdate(input: $input) {
      product { id title }
      userErrors { field message }
    }
  }
`;

async function updateProduct(token, id, descriptionHtml) {
  const data = await adminGql(token, UPDATE_MUTATION, {
    input: {id, descriptionHtml},
  });
  if (data.productUpdate.userErrors?.length) {
    throw new Error(
      `Update failed for ${id}: ${data.productUpdate.userErrors.map((e) => e.message).join('; ')}`,
    );
  }
  return data.productUpdate.product;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Mode: ${APPLY ? 'APPLY (writing to Shopify)' : 'DRY RUN (preview only)'}`);
  console.log('');

  console.log('Authenticating...');
  const token = await getAccessToken();
  console.log('Authenticated OK');

  console.log('Fetching products...');
  const products = await fetchAllProducts(token);
  console.log(`Fetched ${products.length} products total\n`);

  const changes = [];

  for (const product of products) {
    const original = product.descriptionHtml || '';
    const cleaned = cleanDescription(original);

    if (cleaned !== original) {
      changes.push({id: product.id, title: product.title, original, cleaned});
    }
  }

  if (changes.length === 0) {
    console.log('No changes needed — all descriptions are clean.');
    return;
  }

  console.log(`Found ${changes.length} product(s) needing cleanup:\n`);

  for (const change of changes) {
    console.log(`━━━ ${change.title} (${change.id}) ━━━`);
    console.log('BEFORE:');
    console.log(change.original.substring(0, 500));
    console.log('');
    console.log('AFTER:');
    console.log(change.cleaned.substring(0, 500));
    console.log('');
  }

  if (!APPLY) {
    console.log('─────────────────────────────────────────────');
    console.log(`Dry run complete. ${changes.length} product(s) would be updated.`);
    console.log('Run with --apply to write changes to Shopify.');
    return;
  }

  console.log('Applying changes...\n');
  let success = 0;
  let failed = 0;

  for (const change of changes) {
    try {
      await updateProduct(token, change.id, change.cleaned);
      console.log(`  ✓ ${change.title}`);
      success++;
    } catch (err) {
      console.error(`  ✗ ${change.title}: ${err.message}`);
      failed++;
    }
    // Gentle rate limiting
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log(`\nDone. ${success} updated, ${failed} failed.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
