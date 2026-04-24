#!/usr/bin/env node

import {mkdir, readFile, unlink, writeFile} from 'node:fs/promises';
import {copyFile, readdir} from 'node:fs/promises';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {Readable} from 'node:stream';
import readline from 'node:readline';

const DEFAULT_API_VERSION = '2025-04';
const DEFAULT_OUTPUT_DIR = 'catalog/shopify';
const DEFAULT_SOURCE_DIR = 'data/lfs-library/products';
const REQUIRED_ENV_VARS = [
  'PUBLIC_STORE_DOMAIN',
  'SHOPIFY_CLIENT_ID',
  'SHOPIFY_CLIENT_SECRET',
];
const SUPPORTED_SEED_PRODUCT_TYPES = new Set([
  'eurorack_module',
  'instrument',
  'accessory',
  'eurorack_case',
]);
const SUPPLEMENTAL_SEED_MEDIA_ROOTS = {
  'alternate-frontpanel': ['accessories/alternate-frontpanels'],
};
const HELP_TEXT = `Shopify catalog sync CLI

Usage:
  node scripts/shopify-sync.mjs doctor [--offline] [--output-dir <dir>]
  node scripts/shopify-sync.mjs seed [--output-dir <dir>] [--source-dir <dir>] [--handle <handle>]
  node scripts/shopify-sync.mjs pull [--output-dir <dir>] [--handle <handle>] [--query <search>] [--no-media-download]
  node scripts/shopify-sync.mjs diff [--output-dir <dir>] [--handle <handle>] [--query <search>]
  node scripts/shopify-sync.mjs push [--output-dir <dir>] [--handle <handle>] [--query <search>] [--apply]
  node scripts/shopify-sync.mjs sync [--output-dir <dir>] [--handle <handle>] [--query <search>] [--apply]

Commands:
  doctor    Validate local sync prerequisites and environment configuration.
  seed      Build missing local catalog entries from LFS product metadata and images.
  pull      Export Shopify product data into local JSON, HTML, and media files.
  diff      Compare local catalog files against the latest Shopify product data.
  push      Plan or apply local catalog changes back to Shopify.
  sync      Run doctor and then push using the local catalog as the source of truth.

Options:
  --output-dir <dir>      Output root. Defaults to catalog/shopify.
  --source-dir <dir>      Local product library root. Defaults to data/lfs-library/products (use lfs/library/products when syncing from a full mount).
  --handle <handle>       Restrict export to one product handle. Repeatable.
  --query <search>        Additional Shopify product search filter.
  --apply                 Persist mutations instead of running in dry-run mode.
  --no-media-download     Skip downloading image assets.
  --offline               Skip Shopify credential checks for doctor.
  --help                  Show this help text.
`;

const PRODUCT_SET_MUTATION = `
  mutation UpsertProduct(
    $identifier: ProductSetIdentifiers
    $input: ProductSetInput!
    $synchronous: Boolean!
  ) {
    productSet(identifier: $identifier, input: $input, synchronous: $synchronous) {
      product {
        id
        handle
        updatedAt
      }
      productSetOperation {
        id
        status
        userErrors {
          field
          message
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const METAFIELDS_SET_MUTATION = `
  mutation SetProductMetafields($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        namespace
        key
        compareDigest
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PRODUCT_UPDATE_MEDIA_MUTATION = `
  mutation UpdateProductMedia(
    $product: ProductUpdateInput!
    $media: [CreateMediaInput!]
  ) {
    productUpdate(product: $product, media: $media) {
      product {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const STAGED_UPLOADS_CREATE_MUTATION = `
  mutation CreateStagedUploads($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PUBLICATIONS_QUERY = `
  query Publications($after: String) {
    publications(first: 50, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          name
          autoPublish
          supportsFuturePublishing
        }
      }
    }
  }
`;

const PUBLISHABLE_PUBLISH_MUTATION = `
  mutation PublishablePublish($id: ID!, $publicationId: ID!) {
    publishablePublish(id: $id, input: [{publicationId: $publicationId}]) {
      publishable {
        publishedOnPublication(publicationId: $publicationId)
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PUBLISHABLE_UNPUBLISH_MUTATION = `
  mutation PublishableUnpublish($id: ID!, $publicationId: ID!) {
    publishableUnpublish(id: $id, input: [{publicationId: $publicationId}]) {
      publishable {
        publishedOnPublication(publicationId: $publicationId)
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PRODUCT_MEDIA_STATUS_QUERY = `
  query ProductMediaStatuses($query: String!, $after: String) {
    products(first: 25, query: $query, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          handle
          updatedAt
          media(first: 100) {
            edges {
              node {
                status
              }
            }
          }
        }
      }
    }
  }
`;

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

async function main() {
  loadEnvFiles(process.cwd());

  const cli = parseArgs(process.argv.slice(2));
  if (cli.help || !cli.command) {
    console.log(HELP_TEXT);
    return;
  }

  const config = buildConfig(cli);

  if (cli.command === 'doctor') {
    const ok = await runDoctor(config, cli.flags.offline === true);
    process.exitCode = ok ? 0 : 1;
    return;
  }

  if (cli.command === 'seed') {
    await runSeed(config, cli);
    return;
  }

  if (cli.command === 'pull') {
    await runPull(config, cli);
    return;
  }

  if (cli.command === 'diff') {
    const ok = await runDiff(config, cli);
    process.exitCode = ok ? 0 : 1;
    return;
  }

  if (cli.command === 'push') {
    const ok = await runPush(config, cli);
    process.exitCode = ok ? 0 : 1;
    return;
  }

  if (cli.command === 'sync') {
    const ok = await runSync(config, cli);
    process.exitCode = ok ? 0 : 1;
    return;
  }

  throw new Error(`Unknown command: ${cli.command}`);
}

function parseArgs(args) {
  const flags = {};
  const values = {};
  const positionals = [];

  for (let index = 0; index < args.length; index++) {
    const current = args[index];
    if (!current.startsWith('--')) {
      positionals.push(current);
      continue;
    }

    const key = current.slice(2);
    if (
      key === 'help' ||
      key === 'offline' ||
      key === 'no-media-download' ||
      key === 'apply'
    ) {
      flags[key] = true;
      continue;
    }

    const next = args[index + 1];
    if (!next || next.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }

    if (key === 'handle') {
      values.handle = values.handle ?? [];
      values.handle.push(next);
    } else {
      values[key] = next;
    }
    index++;
  }

  return {
    command: positionals[0] ?? null,
    help: flags.help === true,
    flags,
    values,
  };
}

function buildConfig(cli) {
  const outputDir = path.resolve(
    process.cwd(),
    cli.values['output-dir'] ?? DEFAULT_OUTPUT_DIR,
  );
  const sourceDir = path.resolve(
    process.cwd(),
    cli.values['source-dir'] ?? DEFAULT_SOURCE_DIR,
  );

  return {
    apiVersion:
      process.env.PUBLIC_STOREFRONT_API_VERSION || DEFAULT_API_VERSION,
    outputDir,
    sourceDir,
    downloadMedia: cli.flags['no-media-download'] !== true,
    storeDomain: process.env.PUBLIC_STORE_DOMAIN || '',
    clientId: process.env.SHOPIFY_CLIENT_ID || '',
    clientSecret: process.env.SHOPIFY_CLIENT_SECRET || '',
    onlineStorePublicationId:
      process.env.SHOPIFY_ONLINE_STORE_PUBLICATION_ID || '',
  };
}

async function runDoctor(config, offline) {
  const checks = [];

  checks.push(checkNodeVersion());
  checks.push(await checkOutputDirectory(config.outputDir));

  if (!offline) {
    for (const envVar of REQUIRED_ENV_VARS) {
      checks.push(checkEnvVar(envVar));
    }
  }

  const hasFailure = checks.some((check) => check.status === 'fail');

  console.log('Shopify sync doctor');
  console.log(`Output directory: ${config.outputDir}`);
  console.log(
    `Credential checks: ${offline ? 'skipped (--offline)' : 'enabled'}`,
  );
  console.log('');

  for (const check of checks) {
    const symbol = check.status === 'ok' ? 'OK ' : 'ERR';
    console.log(`${symbol} ${check.label}: ${check.message}`);
  }

  if (hasFailure) {
    console.log('');
    console.log('Doctor failed. Fix the reported issues before running pull.');
    return false;
  }

  console.log('');
  console.log('Doctor passed.');
  return true;
}

async function runPull(config, cli) {
  assertAdminEnv();

  await mkdir(config.outputDir, {recursive: true});

  const searchQuery = buildSearchQuery(
    cli.values.handle ?? [],
    cli.values.query,
  );
  const catalog = await fetchRemoteCatalog(config, searchQuery);
  console.log(`Parsed ${catalog.products.length} product records.`);

  console.log('Writing local catalog files...');
  const summary = await writeCatalog(config, catalog, searchQuery);

  console.log('');
  console.log(`Products exported: ${summary.productCount}`);
  console.log(`Image assets downloaded: ${summary.downloadedImages}`);
  console.log(`Catalog root: ${config.outputDir}`);
}

async function runSeed(config, cli) {
  const requestedHandles = cli.values.handle ?? [];
  const summary = await seedCatalogFromLfs(config, requestedHandles);

  console.log(`Seed source root: ${config.sourceDir}`);
  console.log(`Catalog root: ${config.outputDir}`);
  console.log(
    `Handles requested: ${requestedHandles.length || 'all missing products'}`,
  );
  console.log('');
  console.log(`Products seeded: ${summary.seededCount}`);
  console.log(`Existing products skipped: ${summary.skippedExistingCount}`);
  console.log(`Images copied: ${summary.copiedImages}`);

  if (summary.missingRequestedHandles.length > 0) {
    console.log(
      `Requested handles without a matching LFS source: ${summary.missingRequestedHandles.join(
        ', ',
      )}`,
    );
  }
}

async function seedCatalogFromLfs(config, requestedHandles) {
  const candidates = await loadLfsSeedCandidates(config.sourceDir);
  const requestedSet = new Set(requestedHandles);
  const productsRoot = path.join(config.outputDir, 'products');
  await mkdir(productsRoot, {recursive: true});

  const existingHandles = new Set(await listSubdirectoryNames(productsRoot));
  const matchedRequestedHandles = new Set();
  const missingRequestedHandles = [];
  let seededCount = 0;
  let skippedExistingCount = 0;
  let copiedImages = 0;

  for (const candidate of candidates) {
    if (requestedSet.size > 0 && !requestedSet.has(candidate.handle)) {
      continue;
    }

    matchedRequestedHandles.add(candidate.handle);

    if (existingHandles.has(candidate.handle)) {
      skippedExistingCount++;
      continue;
    }

    copiedImages += await writeSeedCatalogEntry(config.outputDir, candidate);
    seededCount++;
  }

  for (const handle of requestedSet) {
    if (!matchedRequestedHandles.has(handle)) {
      missingRequestedHandles.push(handle);
    }
  }

  await rebuildCatalogSummary(config.outputDir, config.apiVersion);

  return {
    seededCount,
    skippedExistingCount,
    copiedImages,
    missingRequestedHandles: missingRequestedHandles.sort(),
  };
}

async function loadLfsSeedCandidates(sourceDir) {
  if (!existsSync(sourceDir)) {
    throw new Error(`LFS source directory not found: ${sourceDir}`);
  }

  const files = await collectFilesRecursive(sourceDir, '.json');
  const candidates = [];
  const seenHandles = new Set();

  for (const filePath of files.sort()) {
    if (filePath.endsWith(`${path.sep}product-catalog.json`)) continue;

    const raw = JSON.parse(readFileSync(filePath, 'utf8'));
    if (!SUPPORTED_SEED_PRODUCT_TYPES.has(raw?.product_type)) continue;
    if ((raw.company ?? 'lzx') !== 'lzx') continue;

    const handle = canonicalizeSeedHandle(raw);
    if (!handle || seenHandles.has(handle)) continue;

    const candidate = buildSeedCandidate(filePath, raw, handle);
    if (!candidate) continue;

    candidates.push(candidate);
    seenHandles.add(handle);
  }

  return candidates.sort((left, right) =>
    left.handle.localeCompare(right.handle),
  );
}

function buildSeedCandidate(sourcePath, raw, handle) {
  const title = stringValue(raw.name) ?? startCase(handle);
  const legacyContent = buildSeedLegacyContent(sourcePath, raw, handle, title);
  const description = legacyContent.description;
  const subtitle = stringValue(raw.subtitle);
  const isActive = raw.status?.is_active === true;
  const price = stringValue(raw.price);
  const options =
    isActive && price
      ? [
          {
            id: null,
            name: 'Title',
            position: 1,
            values: ['Default Title'],
          },
        ]
      : [];
  const variants =
    isActive && price
      ? [
          {
            id: null,
            displayName: `${title} - Default Title`,
            title: 'Default Title',
            sku: stringValue(raw.sku),
            barcode: null,
            position: 1,
            price,
            compareAtPrice: null,
            taxable: false,
            inventoryPolicy: 'CONTINUE',
            updatedAt: null,
            selectedOptions: [{name: 'Title', value: 'Default Title'}],
          },
        ]
      : [];
  const specsHtml = buildSpecsHtml(raw.specs) ?? legacyContent.specsHtml;
  const legacyContentJson =
    legacyContent.metafieldValue != null
      ? JSON.stringify(legacyContent.metafieldValue)
      : null;
  const metafields = [
    subtitle
      ? {
          id: null,
          namespace: 'descriptors',
          key: 'subtitle',
          type: 'single_line_text_field',
          value: subtitle,
          description: null,
          updatedAt: null,
          compareDigest: null,
        }
      : null,
    specsHtml
      ? {
          id: null,
          namespace: 'custom',
          key: 'specs',
          type: 'multi_line_text_field',
          value: specsHtml,
          description: null,
          updatedAt: null,
          compareDigest: null,
        }
      : null,
    legacyContentJson
      ? {
          id: null,
          namespace: 'custom',
          key: 'legacy_content',
          type: 'json',
          value: legacyContentJson,
          description: null,
          updatedAt: null,
          compareDigest: null,
        }
      : null,
  ].filter(Boolean);

  return {
    handle,
    title,
    descriptionHtml: buildDescriptionHtml(
      description,
      legacyContent.descriptionSections,
    ),
    seo: {
      title: null,
      description: truncateText(description, 320),
    },
    product: {
      id: null,
      handle,
      title,
      vendor: normalizeVendor(raw.company),
      status: isActive ? 'ACTIVE' : 'DRAFT',
      productType: normalizeSeedProductType(raw.product_type),
      tags: buildSeedTags(raw),
      templateSuffix: '',
      onlineStoreUrl: null,
      description,
      createdAt: null,
      updatedAt: null,
      options,
      seo: {
        title: null,
        description: truncateText(description, 320),
      },
    },
    variants,
    metafields,
    mediaEntries: buildSeedMediaEntries(
      sourcePath,
      raw,
      title,
      legacyContent,
      handle,
    ),
    sourcePath,
    previousShopifyProductId: stringValue(raw.shopify_id),
  };
}

async function writeSeedCatalogEntry(outputDir, candidate) {
  const productDir = path.join(outputDir, 'products', candidate.handle);
  const mediaDir = path.join(productDir, 'media');
  await mkdir(mediaDir, {recursive: true});

  await writeJson(path.join(productDir, 'product.json'), candidate.product);
  await writeFile(
    path.join(productDir, 'description.html'),
    candidate.descriptionHtml,
    'utf8',
  );
  await writeJson(path.join(productDir, 'seo.json'), candidate.seo);
  await writeJson(path.join(productDir, 'variants.json'), candidate.variants);
  await writeJson(
    path.join(productDir, 'metafields.json'),
    candidate.metafields,
  );

  const mediaManifest = [];
  let copiedImages = 0;

  for (const [index, entry] of candidate.mediaEntries.entries()) {
    if (entry.kind === 'local-image') {
      const extension = path.extname(entry.sourcePath).toLowerCase();
      const stem = `${String(index + 1).padStart(2, '0')}-${slugify(
        path.basename(entry.sourcePath, extension),
      )}`;
      const outputPath = path.join(mediaDir, `${stem}${extension}`);
      await copyFile(entry.sourcePath, outputPath);
      copiedImages++;
      mediaManifest.push({
        id: null,
        type: 'MediaImage',
        mediaContentType: 'IMAGE',
        status: null,
        alt: entry.alt,
        embeddedUrl: null,
        host: null,
        originUrl: null,
        image: null,
        sources: [],
        localPath: path.relative(process.cwd(), outputPath),
      });
      continue;
    }

    mediaManifest.push({
      id: null,
      type: entry.type,
      mediaContentType: entry.mediaContentType,
      status: null,
      alt: entry.alt,
      embeddedUrl: entry.embeddedUrl ?? null,
      host: null,
      originUrl: entry.originUrl ?? null,
      image: entry.image ?? null,
      sources: entry.sources ?? [],
    });
  }

  await writeJson(path.join(productDir, 'media.json'), mediaManifest);
  await writeJson(path.join(productDir, 'sync-state.json'), {
    handle: candidate.handle,
    productId: null,
    previousShopifyProductId: candidate.previousShopifyProductId,
    source: 'lfs-seed',
    sourcePath: candidate.sourcePath,
    seededAt: new Date().toISOString(),
  });

  return copiedImages;
}

async function rebuildCatalogSummary(outputDir, apiVersion) {
  const productsRoot = path.join(outputDir, 'products');
  const handles = await listSubdirectoryNames(productsRoot);
  const products = [];

  for (const handle of handles.sort()) {
    const product = await readJson(
      path.join(productsRoot, handle, 'product.json'),
    );
    products.push({
      id: product.id ?? null,
      handle: product.handle,
      title: product.title,
      updatedAt: product.updatedAt ?? null,
    });
  }

  await writeJson(path.join(outputDir, 'catalog.json'), {
    pulledAt: new Date().toISOString(),
    apiVersion,
    query: null,
    productCount: products.length,
    products,
  });
}

async function runDiff(config, cli) {
  assertAdminEnv();

  const requestedHandles = cli.values.handle ?? [];
  const localCatalog = await loadLocalCatalog(
    config.outputDir,
    requestedHandles,
  );
  if (localCatalog.handles.length === 0) {
    throw new Error(
      'No local catalog entries found. Run pull first or provide one or more --handle values.',
    );
  }

  const searchQuery = buildSearchQuery(localCatalog.handles, cli.values.query);
  const remoteCatalog = await fetchRemoteCatalog(config, searchQuery);
  const diff = compareCatalogs(localCatalog, remoteCatalog);

  console.log(`Compared ${diff.handleCount} product handle(s).`);

  if (diff.entries.length === 0) {
    console.log('Local catalog matches Shopify for the compared fields.');
    return true;
  }

  console.log(`Found ${diff.entries.length} difference(s):`);
  for (const entry of diff.entries) {
    console.log(`- ${entry.handle}: ${entry.field} (${entry.reason})`);
  }

  return false;
}

async function runPush(config, cli) {
  assertAdminEnv();

  const requestedHandles = cli.values.handle ?? [];
  const localCatalog = await loadLocalCatalog(
    config.outputDir,
    requestedHandles,
  );
  if (localCatalog.handles.length === 0) {
    throw new Error(
      'No local catalog entries found. Run pull first or provide one or more --handle values.',
    );
  }

  const searchQuery = buildSearchQuery(localCatalog.handles, cli.values.query);
  const remoteCatalog = await fetchRemoteCatalog(config, searchQuery);
  const plan = buildPushPlan(localCatalog, remoteCatalog);
  const apply = cli.flags.apply === true;

  printPushPlan(plan, apply);

  if (plan.errors.length > 0) {
    return false;
  }

  if (plan.summary.actionCount === 0) {
    console.log(
      apply ? 'Nothing to apply.' : 'Dry run complete. No changes pending.',
    );
    return true;
  }

  if (!apply) {
    console.log('Dry run only. Re-run with --apply to persist changes.');
    return true;
  }

  const changedHandles = await applyPushPlan(config, plan);
  if (changedHandles.length > 0) {
    console.log('Refreshing local catalog metadata from Shopify...');
    await refreshLocalCatalog(config, changedHandles);
  }

  console.log('Push completed.');
  return true;
}

async function runSync(config, cli) {
  console.log('Running sync doctor...');
  const doctorOk = await runDoctor(config, false);
  if (!doctorOk) {
    return false;
  }

  console.log('Running Shopify push...');
  return runPush(config, cli);
}

function assertAdminEnv() {
  const missing = REQUIRED_ENV_VARS.filter((envVar) => !process.env[envVar]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}

async function fetchRemoteCatalog(config, searchQuery) {
  const client = createAdminClient(config);

  console.log('Authenticating with Shopify Admin API...');
  await client.getAccessToken();
  console.log('Authenticated.');

  console.log('Submitting bulk product export...');
  const bulkOperationId = await runBulkExport(client, searchQuery);
  console.log(`Bulk operation: ${bulkOperationId}`);

  const bulkOperation = await pollBulkOperation(client, bulkOperationId);
  if (!bulkOperation.url) {
    throw new Error('Bulk export completed without a download URL.');
  }

  console.log('Downloading product catalog...');
  return downloadCatalog(bulkOperation.url);
}

function checkNodeVersion() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major > 18 || (major === 18 && minor >= 19)) {
    return {
      label: 'Node version',
      status: 'ok',
      message: `Detected ${process.versions.node}`,
    };
  }

  return {
    label: 'Node version',
    status: 'fail',
    message: `Detected ${process.versions.node}; expected >= 18.19`,
  };
}

async function checkOutputDirectory(outputDir) {
  try {
    await mkdir(outputDir, {recursive: true});
    const probePath = path.join(outputDir, '.shopify-sync-write-test');
    await writeFile(probePath, 'ok\n', 'utf8');
    await unlink(probePath);
    return {
      label: 'Output directory',
      status: 'ok',
      message: `${outputDir} is writable`,
    };
  } catch (error) {
    return {
      label: 'Output directory',
      status: 'fail',
      message:
        error instanceof Error
          ? error.message
          : 'Unable to create output directory',
    };
  }
}

function checkEnvVar(envVar) {
  if (process.env[envVar]) {
    return {label: envVar, status: 'ok', message: 'set'};
  }

  return {label: envVar, status: 'fail', message: 'missing'};
}

function buildSearchQuery(handles, extraQuery) {
  const fragments = [];

  if (handles.length > 0) {
    fragments.push(handles.map((handle) => `handle:${handle}`).join(' OR '));
  }

  if (extraQuery) {
    fragments.push(extraQuery);
  }

  if (fragments.length === 0) {
    return null;
  }

  return fragments.map((fragment) => `(${fragment})`).join(' AND ');
}

function createAdminClient(config) {
  let accessToken = null;
  let expiresAt = 0;

  return {
    async getAccessToken() {
      if (accessToken && Date.now() < expiresAt - 60_000) {
        return accessToken;
      }

      const response = await fetch(
        `https://${config.storeDomain}/admin/oauth/access_token`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: config.clientId,
            client_secret: config.clientSecret,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Admin OAuth token request failed: ${response.status} ${response.statusText}`,
        );
      }

      const json = await response.json();
      accessToken = json.access_token;
      expiresAt = Date.now() + json.expires_in * 1000;
      return accessToken;
    },

    async graphql(query, variables = {}) {
      const token = await this.getAccessToken();
      const response = await fetch(
        `https://${config.storeDomain}/admin/api/${config.apiVersion}/graphql.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': token,
          },
          body: JSON.stringify({query, variables}),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Admin API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const json = await response.json();
      if (json.errors?.length) {
        throw new Error(json.errors.map((error) => error.message).join(', '));
      }

      return json.data;
    },
  };
}

async function runBulkExport(client, searchQuery) {
  const mutation = `
    mutation RunBulkQuery($query: String!) {
      bulkOperationRunQuery(query: $query) {
        bulkOperation {
          id
          status
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const bulkQuery = buildBulkProductQuery(searchQuery);
  const data = await client.graphql(mutation, {query: bulkQuery});
  const payload = data.bulkOperationRunQuery;

  if (payload.userErrors?.length > 0) {
    throw new Error(
      payload.userErrors.map((error) => error.message).join(', '),
    );
  }

  return payload.bulkOperation.id;
}

function buildBulkProductQuery(searchQuery) {
  const filterFragment = searchQuery
    ? `(first: 250, query: ${JSON.stringify(searchQuery)})`
    : '(first: 250)';

  return `{
    products${filterFragment} {
      edges {
        node {
          __typename
          id
          handle
          title
          vendor
          status
          productType
          tags
          templateSuffix
          onlineStoreUrl
          description
          descriptionHtml
          createdAt
          updatedAt
          seo {
            title
            description
          }
          options {
            id
            name
            position
            values
          }
          variants(first: 250) {
            edges {
              node {
                __typename
                id
                displayName
                title
                sku
                barcode
                position
                price
                compareAtPrice
                taxable
                inventoryPolicy
                selectedOptions {
                  name
                  value
                }
                updatedAt
              }
            }
          }
          metafields(first: 100) {
            edges {
              node {
                __typename
                id
                namespace
                key
                type
                value
                description
                updatedAt
                compareDigest
              }
            }
          }
          media(first: 100) {
            edges {
              node {
                __typename
                ... on MediaImage {
                  id
                  alt
                  mediaContentType
                  status
                  image {
                    url
                    altText
                    width
                    height
                  }
                }
                ... on ExternalVideo {
                  id
                  alt
                  mediaContentType
                  status
                  embeddedUrl
                  host
                  originUrl
                }
                ... on Video {
                  id
                  alt
                  mediaContentType
                  status
                  sources {
                    url
                    format
                    mimeType
                    height
                    width
                  }
                }
                ... on Model3d {
                  id
                  alt
                  mediaContentType
                  status
                  sources {
                    url
                    mimeType
                    format
                    filesize
                  }
                }
              }
            }
          }
        }
      }
    }
  }`;
}

async function pollBulkOperation(client, bulkOperationId) {
  const query = `
    query CurrentBulkOperation($id: ID!) {
      node(id: $id) {
        ... on BulkOperation {
          id
          status
          errorCode
          objectCount
          url
          partialDataUrl
        }
      }
    }
  `;

  while (true) {
    const data = await client.graphql(query, {id: bulkOperationId});
    const bulkOperation = data.node;
    if (!bulkOperation) {
      throw new Error(`Bulk operation not found: ${bulkOperationId}`);
    }

    if (bulkOperation.status === 'COMPLETED') {
      return bulkOperation;
    }

    if (
      bulkOperation.status === 'FAILED' ||
      bulkOperation.status === 'CANCELED'
    ) {
      throw new Error(
        `Bulk operation ${bulkOperation.status.toLowerCase()}: ${
          bulkOperation.errorCode || 'unknown error'
        }`,
      );
    }

    console.log(
      `Waiting for bulk export: status=${bulkOperation.status} objects=${bulkOperation.objectCount}`,
    );
    await delay(2_000);
  }
}

async function downloadCatalog(url) {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(
      `Failed to download bulk export: ${response.status} ${response.statusText}`,
    );
  }

  const productsById = new Map();
  const input = Readable.fromWeb(response.body);
  const reader = readline.createInterface({input, crlfDelay: Infinity});

  for await (const line of reader) {
    if (!line.trim()) continue;

    const record = JSON.parse(line);
    if (!record.__parentId) {
      productsById.set(record.id, {
        product: normalizeProduct(record),
        variants: [],
        metafields: [],
        media: [],
      });
      continue;
    }

    const parent = productsById.get(record.__parentId);
    if (!parent) continue;

    if (isVariantRecord(record)) {
      parent.variants.push(normalizeVariant(record));
      continue;
    }

    if (isMetafieldRecord(record)) {
      parent.metafields.push(normalizeMetafield(record));
      continue;
    }

    if (isMediaRecord(record)) {
      parent.media.push(normalizeMedia(record));
    }
  }

  const products = [...productsById.values()]
    .map((entry) => ({
      ...entry,
      variants: entry.variants.sort(compareByPositionThenId),
      metafields: entry.metafields.sort(compareMetafields),
      media: entry.media.sort(compareMedia),
    }))
    .sort((left, right) =>
      left.product.handle.localeCompare(right.product.handle),
    );

  return {products};
}

function normalizeProduct(record) {
  return {
    id: record.id,
    handle: record.handle,
    title: record.title,
    vendor: record.vendor,
    status: record.status,
    productType: record.productType,
    tags: Array.isArray(record.tags) ? [...record.tags].sort() : [],
    templateSuffix: record.templateSuffix,
    onlineStoreUrl: record.onlineStoreUrl,
    description: record.description,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    options: Array.isArray(record.options)
      ? record.options
          .map((option) => ({
            id: option.id,
            name: option.name,
            position: option.position,
            values: Array.isArray(option.values) ? [...option.values] : [],
          }))
          .sort(compareByPositionThenId)
      : [],
    seo: {
      title: record.seo?.title ?? null,
      description: record.seo?.description ?? null,
    },
  };
}

function isVariantRecord(record) {
  return (
    record.__typename === 'ProductVariant' ||
    Array.isArray(record.selectedOptions)
  );
}

function normalizeVariant(record) {
  return {
    id: record.id,
    displayName: record.displayName,
    title: record.title,
    sku: record.sku,
    barcode: record.barcode,
    position: record.position,
    price: record.price,
    compareAtPrice: record.compareAtPrice,
    taxable: record.taxable,
    inventoryPolicy: record.inventoryPolicy,
    updatedAt: record.updatedAt,
    selectedOptions: Array.isArray(record.selectedOptions)
      ? record.selectedOptions.map((option) => ({
          name: option.name,
          value: option.value,
        }))
      : [],
  };
}

function isMetafieldRecord(record) {
  return (
    record.__typename === 'Metafield' ||
    (record.namespace && record.key && record.type)
  );
}

function normalizeMetafield(record) {
  return {
    id: record.id,
    namespace: record.namespace,
    key: record.key,
    type: record.type,
    value: record.value,
    description: record.description ?? null,
    updatedAt: record.updatedAt,
    compareDigest: record.compareDigest ?? null,
  };
}

function isMediaRecord(record) {
  return (
    Boolean(record.mediaContentType) ||
    Boolean(record.__typename?.includes('Video')) ||
    record.__typename === 'MediaImage' ||
    record.__typename === 'Model3d'
  );
}

function normalizeMedia(record) {
  return {
    id: record.id,
    type: record.__typename,
    mediaContentType: record.mediaContentType ?? null,
    status: record.status ?? null,
    alt: record.alt ?? null,
    embeddedUrl: record.embeddedUrl ?? null,
    host: record.host ?? null,
    originUrl: record.originUrl ?? null,
    image: record.image
      ? {
          url: record.image.url,
          altText: record.image.altText ?? null,
          width: record.image.width ?? null,
          height: record.image.height ?? null,
        }
      : null,
    sources: Array.isArray(record.sources)
      ? record.sources.map((source) => ({
          url: source.url,
          format: source.format ?? null,
          mimeType: source.mimeType ?? null,
          width: source.width ?? null,
          height: source.height ?? null,
          filesize: source.filesize ?? null,
        }))
      : [],
  };
}

async function writeCatalog(config, catalog, searchQuery) {
  const productsRoot = path.join(config.outputDir, 'products');
  await mkdir(productsRoot, {recursive: true});

  let downloadedImages = 0;

  for (const entry of catalog.products) {
    const productDir = path.join(productsRoot, entry.product.handle);
    await mkdir(productDir, {recursive: true});

    await writeJson(path.join(productDir, 'product.json'), entry.product);
    await writeFile(
      path.join(productDir, 'description.html'),
      entry.product.descriptionHtml ?? '',
      'utf8',
    );
    await writeJson(path.join(productDir, 'seo.json'), entry.product.seo);
    await writeJson(path.join(productDir, 'variants.json'), entry.variants);
    await writeJson(path.join(productDir, 'metafields.json'), entry.metafields);

    const mediaDir = path.join(productDir, 'media');
    await mkdir(mediaDir, {recursive: true});
    const existingMediaLocalPaths = await loadExistingMediaLocalPaths(
      productDir,
    );
    const mediaManifest = [];

    for (let index = 0; index < entry.media.length; index++) {
      const media = entry.media[index];
      const manifestEntry = {...media};
      const signature = buildMediaSignature(media);

      if (signature && existingMediaLocalPaths.has(signature)) {
        manifestEntry.localPath = existingMediaLocalPaths.get(signature);
      }

      if (config.downloadMedia && media.image?.url) {
        const localRelativePath = await downloadImageAsset(
          media.image.url,
          mediaDir,
          `${String(index + 1).padStart(2, '0')}-${slugify(
            media.alt || entry.product.handle || 'image',
          )}`,
        );
        manifestEntry.localPath = localRelativePath;
        downloadedImages++;
      }

      mediaManifest.push(manifestEntry);
    }

    await writeJson(path.join(productDir, 'media.json'), mediaManifest);
    await writeJson(path.join(productDir, 'sync-state.json'), {
      productId: entry.product.id,
      handle: entry.product.handle,
      shopifyUpdatedAt: entry.product.updatedAt,
      pulledAt: new Date().toISOString(),
      apiVersion: config.apiVersion,
    });
  }

  await writeJson(path.join(config.outputDir, 'catalog.json'), {
    pulledAt: new Date().toISOString(),
    apiVersion: config.apiVersion,
    query: searchQuery,
    productCount: catalog.products.length,
    products: catalog.products.map((entry) => ({
      id: entry.product.id,
      handle: entry.product.handle,
      title: entry.product.title,
      updatedAt: entry.product.updatedAt,
    })),
  });

  return {
    productCount: catalog.products.length,
    downloadedImages,
  };
}

async function loadLocalCatalog(outputDir, requestedHandles) {
  const catalogPath = path.join(outputDir, 'catalog.json');
  let handles = [...requestedHandles];

  if (handles.length === 0) {
    handles = await listSubdirectoryNames(path.join(outputDir, 'products'));
  }

  if (handles.length === 0 && existsSync(catalogPath)) {
    const summary = await readJson(catalogPath);
    handles = Array.isArray(summary.products)
      ? summary.products
          .map((product) => product?.handle)
          .filter((handle) => typeof handle === 'string')
      : [];
  }

  handles = [...new Set(handles)].sort();

  const entries = new Map();
  for (const handle of handles) {
    const entry = await readLocalCatalogEntry(outputDir, handle);
    if (entry) {
      entries.set(handle, entry);
    }
  }

  return {
    handles,
    entries,
  };
}

async function readLocalCatalogEntry(outputDir, handle) {
  const productDir = path.join(outputDir, 'products', handle);
  if (!existsSync(productDir)) {
    return null;
  }

  const [
    product,
    descriptionHtml,
    seo,
    variants,
    metafields,
    media,
    syncState,
  ] = await Promise.all([
    readJson(path.join(productDir, 'product.json')),
    readText(path.join(productDir, 'description.html')),
    readJson(path.join(productDir, 'seo.json')),
    readJson(path.join(productDir, 'variants.json')),
    readJson(path.join(productDir, 'metafields.json')),
    readJson(path.join(productDir, 'media.json')),
    readOptionalJson(path.join(productDir, 'sync-state.json')),
  ]);

  return {
    product: normalizeComparableLocalProduct(product),
    descriptionHtml,
    seo: normalizeComparableSeo(seo),
    variants: normalizeComparableVariants(variants),
    metafields: normalizeComparableMetafields(metafields),
    media: normalizeComparableMedia(media),
    raw: {
      product,
      descriptionHtml,
      seo,
      variants,
      metafields,
      media,
      syncState,
    },
  };
}

function compareCatalogs(localCatalog, remoteCatalog) {
  const remoteEntries = new Map(
    remoteCatalog.products.map((entry) => [
      entry.product.handle,
      normalizeRemoteCatalogEntry(entry),
    ]),
  );
  const handles = new Set([...localCatalog.handles, ...remoteEntries.keys()]);
  const entries = [];

  for (const handle of [...handles].sort()) {
    const localEntry = localCatalog.entries.get(handle);
    const remoteEntry = remoteEntries.get(handle);

    if (!localEntry) {
      entries.push({
        handle,
        field: 'catalog',
        reason: 'missing local catalog files',
      });
      continue;
    }

    if (!remoteEntry) {
      entries.push({
        handle,
        field: 'catalog',
        reason: 'missing in Shopify export',
      });
      continue;
    }

    compareField(
      entries,
      handle,
      'product.json',
      localEntry.product,
      remoteEntry.product,
    );
    compareField(
      entries,
      handle,
      'description.html',
      localEntry.descriptionHtml,
      remoteEntry.descriptionHtml,
    );
    compareField(entries, handle, 'seo.json', localEntry.seo, remoteEntry.seo);
    compareField(
      entries,
      handle,
      'variants.json',
      localEntry.variants,
      remoteEntry.variants,
    );
    compareField(
      entries,
      handle,
      'metafields.json',
      localEntry.metafields,
      remoteEntry.metafields,
    );
    compareField(
      entries,
      handle,
      'media.json',
      localEntry.media,
      remoteEntry.media,
    );
  }

  return {
    handleCount: handles.size,
    entries,
  };
}

function compareField(differences, handle, field, localValue, remoteValue) {
  if (stableStringify(localValue) === stableStringify(remoteValue)) {
    return;
  }

  differences.push({handle, field, reason: 'content differs'});
}

function buildPushPlan(localCatalog, remoteCatalog) {
  const remoteEntries = new Map(
    remoteCatalog.products.map((entry) => [entry.product.handle, entry]),
  );
  const items = [];
  const errors = [];

  for (const handle of localCatalog.handles) {
    const localEntry = localCatalog.entries.get(handle);
    if (!localEntry) {
      errors.push(`Missing local catalog files for ${handle}.`);
      continue;
    }

    const remoteEntry = remoteEntries.get(handle) ?? null;
    const productSliceChanged =
      stableStringify(buildPushComparableProductSliceFromLocal(localEntry)) !==
      stableStringify(buildPushComparableProductSliceFromRemote(remoteEntry));
    const metafieldsChanged =
      stableStringify(buildPushComparableMetafieldsFromLocal(localEntry)) !==
      stableStringify(buildPushComparableMetafieldsFromRemote(remoteEntry));
    const publicationPlan = buildPublicationPlan(localEntry, remoteEntry);
    const mediaPlan = buildMediaPushPlan(localEntry, remoteEntry);
    const identifier = buildProductIdentifier(localEntry, remoteEntry);
    const productId =
      remoteEntry?.product.id ??
      localEntry.raw.syncState?.productId ??
      localEntry.raw.product.id ??
      null;

    if (metafieldsChanged && !productId && !productSliceChanged) {
      errors.push(
        `Cannot set metafields for ${handle} without a Shopify product id.`,
      );
    }

    if (mediaPlan.additions.length > 0 && !productId && !productSliceChanged) {
      errors.push(
        `Cannot add media for ${handle} without a Shopify product id.`,
      );
    }

    if (publicationPlan.action && !productId && !productSliceChanged) {
      errors.push(
        `Cannot ${publicationPlan.action} ${handle} without a Shopify product id.`,
      );
    }

    items.push({
      handle,
      identifier,
      productId,
      localEntry,
      remoteEntry,
      productSliceChanged,
      metafieldsChanged,
      publicationPlan,
      productInput: buildProductSetInput(localEntry),
      metafields: buildMetafieldsSetInputs(localEntry, productId),
      mediaPlan,
    });
  }

  const actionableItems = items.filter(
    (item) =>
      item.productSliceChanged ||
      item.metafieldsChanged ||
      item.publicationPlan.action ||
      item.mediaPlan.additions.length > 0,
  );

  const actionCount = actionableItems.reduce((count, item) => {
    return (
      count +
      Number(item.productSliceChanged) +
      Number(item.metafieldsChanged) +
      Number(Boolean(item.publicationPlan.action)) +
      item.mediaPlan.additions.length
    );
  }, 0);

  const warningCount = items.reduce(
    (count, item) => count + item.mediaPlan.warnings.length,
    0,
  );

  return {
    items,
    errors,
    summary: {
      handleCount: items.length,
      actionCount,
      warningCount,
    },
  };
}

function printPushPlan(plan, apply) {
  console.log(apply ? 'Push apply plan:' : 'Push dry-run plan:');
  console.log(`Handles scanned: ${plan.summary.handleCount}`);
  console.log(`Actions planned: ${plan.summary.actionCount}`);
  console.log(`Warnings: ${plan.summary.warningCount}`);

  if (plan.errors.length > 0) {
    console.log('Errors:');
    for (const error of plan.errors) {
      console.log(`- ${error}`);
    }
  }

  for (const item of plan.items) {
    const actions = [];
    if (item.productSliceChanged) actions.push('product+variants');
    if (item.metafieldsChanged)
      actions.push(`metafields:${item.metafields.length}`);
    if (item.publicationPlan.action) {
      actions.push(`publication:${item.publicationPlan.action}`);
    }
    if (item.mediaPlan.additions.length > 0) {
      actions.push(`media-add:${item.mediaPlan.additions.length}`);
    }

    if (actions.length === 0 && item.mediaPlan.warnings.length === 0) {
      console.log(`- ${item.handle}: no changes`);
      continue;
    }

    console.log(`- ${item.handle}: ${actions.join(', ') || 'warnings only'}`);
    for (const warning of item.mediaPlan.warnings) {
      console.log(`  warning: ${warning}`);
    }
  }
}

async function applyPushPlan(config, plan) {
  const client = createAdminClient(config);
  await client.getAccessToken();

  const changedHandles = [];
  const mediaChangedHandles = [];
  const needsPublicationSync = plan.items.some(
    (item) => item.publicationPlan.action,
  );
  const onlineStorePublicationId = needsPublicationSync
    ? await resolveOnlineStorePublicationId(client, config)
    : null;

  for (const item of plan.items) {
    if (
      !item.productSliceChanged &&
      !item.metafieldsChanged &&
      !item.publicationPlan.action &&
      item.mediaPlan.additions.length === 0
    ) {
      continue;
    }

    let productId = item.productId;

    if (item.productSliceChanged) {
      console.log(`Applying product update for ${item.handle}...`);
      productId = await applyProductSet(
        client,
        item.identifier,
        item.productInput,
      );
    }

    if (item.metafieldsChanged) {
      console.log(`Applying metafields for ${item.handle}...`);
      await applyMetafieldsSet(client, productId, item.metafields);
    }

    if (item.mediaPlan.additions.length > 0) {
      console.log(`Applying media updates for ${item.handle}...`);
      await applyProductMedia(client, productId, item.mediaPlan.additions);
      mediaChangedHandles.push(item.handle);
    }

    if (item.publicationPlan.action) {
      console.log(
        `Applying publication ${item.publicationPlan.action} for ${item.handle}...`,
      );
      await applyProductPublication(
        client,
        productId,
        onlineStorePublicationId,
        item.publicationPlan.action,
      );
    }

    changedHandles.push(item.handle);
  }

  if (mediaChangedHandles.length > 0) {
    await waitForProductMediaSettled(client, mediaChangedHandles);
  }

  return changedHandles;
}

async function applyProductSet(client, identifier, input) {
  const data = await client.graphql(PRODUCT_SET_MUTATION, {
    identifier,
    input,
    synchronous: true,
  });
  const payload = data.productSet;

  if (payload.userErrors?.length > 0) {
    throw new Error(
      payload.userErrors.map((error) => error.message).join(', '),
    );
  }

  if (payload.productSetOperation?.userErrors?.length > 0) {
    throw new Error(
      payload.productSetOperation.userErrors
        .map((error) => error.message)
        .join(', '),
    );
  }

  return payload.product?.id ?? identifier?.id ?? null;
}

async function applyMetafieldsSet(client, productId, metafields) {
  if (!productId || metafields.length === 0) return;

  for (const chunk of chunkArray(metafields, 25)) {
    const data = await client.graphql(METAFIELDS_SET_MUTATION, {
      metafields: chunk,
    });
    const payload = data.metafieldsSet;
    if (payload.userErrors?.length > 0) {
      throw new Error(
        payload.userErrors.map((error) => error.message).join(', '),
      );
    }
  }
}

async function applyProductMedia(client, productId, additions) {
  if (!productId || additions.length === 0) return;

  const media = [];

  for (const addition of additions) {
    const originalSource = await resolveMediaOriginalSource(client, addition);
    media.push({
      alt: addition.alt,
      mediaContentType: addition.mediaContentType,
      originalSource,
    });
  }

  const data = await client.graphql(PRODUCT_UPDATE_MEDIA_MUTATION, {
    product: {id: productId},
    media,
  });

  const payload = data.productUpdate;
  if (payload.userErrors?.length > 0) {
    throw new Error(
      payload.userErrors.map((error) => error.message).join(', '),
    );
  }
}

async function applyProductPublication(
  client,
  productId,
  publicationId,
  action,
) {
  if (!productId || !publicationId || !action) return;

  const mutation =
    action === 'publish'
      ? PUBLISHABLE_PUBLISH_MUTATION
      : PUBLISHABLE_UNPUBLISH_MUTATION;
  const fieldName =
    action === 'publish' ? 'publishablePublish' : 'publishableUnpublish';

  try {
    const data = await client.graphql(mutation, {id: productId, publicationId});
    const payload = data[fieldName];

    if (payload.userErrors?.length > 0) {
      throw new Error(
        payload.userErrors.map((error) => error.message).join(', '),
      );
    }
  } catch (error) {
    if (isMissingPublicationScopeError(error)) {
      throw new Error(
        'Publication sync requires Shopify `write_publications` access. Update the app scopes and re-authorize the app before rerunning --apply.',
      );
    }

    throw error;
  }
}

async function resolveMediaOriginalSource(client, addition) {
  if (addition.localPath) {
    return stageLocalMediaFile(
      client,
      addition.localPath,
      addition.mediaContentType,
    );
  }

  if (addition.originalSource) {
    return addition.originalSource;
  }

  throw new Error(`No supported media source found for ${addition.handle}.`);
}

async function stageLocalMediaFile(client, localPath, mediaContentType) {
  const resolvedPath = path.resolve(process.cwd(), localPath);
  const fileBytes = await readFile(resolvedPath);
  const fileName = path.basename(resolvedPath);
  const mimeType = guessMimeType(fileName, mediaContentType);
  const input = {
    filename: fileName,
    mimeType,
    httpMethod: 'POST',
    resource: getStagedUploadResource(mediaContentType),
  };

  if (mediaContentType === 'VIDEO' || mediaContentType === 'MODEL_3D') {
    input.fileSize = String(fileBytes.byteLength);
  }

  const data = await client.graphql(STAGED_UPLOADS_CREATE_MUTATION, {
    input: [input],
  });

  const payload = data.stagedUploadsCreate;
  if (payload.userErrors?.length > 0) {
    throw new Error(
      payload.userErrors.map((error) => error.message).join(', '),
    );
  }

  const target = payload.stagedTargets?.[0];
  if (!target) {
    throw new Error(`No staged upload target returned for ${fileName}.`);
  }

  await uploadToStagedTarget(target, fileName, mimeType, fileBytes);
  return target.resourceUrl;
}

async function uploadToStagedTarget(target, fileName, mimeType, fileBytes) {
  const form = new FormData();
  for (const parameter of target.parameters ?? []) {
    form.append(parameter.name, parameter.value);
  }
  form.append('file', new Blob([fileBytes], {type: mimeType}), fileName);

  const response = await fetch(target.url, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    throw new Error(
      `Staged upload failed: ${response.status} ${response.statusText}`,
    );
  }
}

async function refreshLocalCatalog(config, handles) {
  const refreshConfig = {...config, downloadMedia: false};
  const searchQuery = buildSearchQuery(handles, null);
  const catalog = await fetchRemoteCatalog(refreshConfig, searchQuery);
  await writeCatalog(refreshConfig, catalog, searchQuery);
}

async function waitForProductMediaSettled(client, handles) {
  const uniqueHandles = [...new Set(handles)];
  const maxAttempts = 10;
  const pollIntervalMs = 3_000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const states = await fetchProductMediaStates(client, uniqueHandles);
    const pendingHandles = uniqueHandles.filter((handle) => {
      const state = states.get(handle);
      if (!state) return true;

      return state.mediaStatuses.some((status) => status && status !== 'READY');
    });

    if (pendingHandles.length === 0) {
      return;
    }

    if (attempt === maxAttempts) {
      console.warn(
        `Media still processing after ${maxAttempts} checks: ${pendingHandles.join(
          ', ',
        )}. Continuing with refresh.`,
      );
      return;
    }

    console.log(
      `Waiting for Shopify media processing (${pendingHandles.length} handle(s) pending, check ${attempt}/${maxAttempts})...`,
    );
    await delay(pollIntervalMs);
  }
}

async function fetchProductMediaStates(client, handles) {
  const states = new Map();

  for (const handleChunk of chunkArray(handles, 25)) {
    const searchQuery = buildSearchQuery(handleChunk, null);
    let cursor = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const data = await client.graphql(PRODUCT_MEDIA_STATUS_QUERY, {
        query: searchQuery,
        after: cursor,
      });
      const connection = data.products;

      for (const edge of connection.edges ?? []) {
        const product = edge.node;
        states.set(product.handle, {
          updatedAt: product.updatedAt ?? null,
          mediaStatuses: (product.media?.edges ?? []).map(
            (mediaEdge) => mediaEdge.node?.status ?? null,
          ),
        });
      }

      hasNextPage = connection.pageInfo?.hasNextPage === true;
      cursor = connection.pageInfo?.endCursor ?? null;
    }
  }

  return states;
}

async function resolveOnlineStorePublicationId(client, config) {
  if (isShopifyGid(config.onlineStorePublicationId, 'Publication')) {
    return config.onlineStorePublicationId;
  }

  try {
    const publications = await fetchPublications(client);
    const namedMatch = publications.find((publication) =>
      /online store/i.test(publication.name ?? ''),
    );

    if (namedMatch) {
      return namedMatch.id;
    }

    const futurePublishingMatches = publications.filter(
      (publication) => publication.supportsFuturePublishing === true,
    );
    if (futurePublishingMatches.length === 1) {
      return futurePublishingMatches[0].id;
    }
  } catch (error) {
    if (isMissingPublicationScopeError(error)) {
      throw new Error(
        'Publication sync requires Shopify `read_publications` and `write_publications` access. Update the app scopes and re-authorize the app, or set SHOPIFY_ONLINE_STORE_PUBLICATION_ID explicitly.',
      );
    }

    throw error;
  }

  throw new Error(
    'Unable to determine the Online Store publication. Set SHOPIFY_ONLINE_STORE_PUBLICATION_ID and rerun the sync.',
  );
}

async function fetchPublications(client) {
  const publications = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const data = await client.graphql(PUBLICATIONS_QUERY, {after: cursor});
    const connection = data.publications;

    for (const edge of connection.edges ?? []) {
      publications.push(edge.node);
    }

    hasNextPage = connection.pageInfo?.hasNextPage === true;
    cursor = connection.pageInfo?.endCursor ?? null;
  }

  return publications;
}

function isMissingPublicationScopeError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return /read_publications|write_publications/.test(message);
}

function buildPublicationPlan(localEntry, remoteEntry) {
  const desiredStatus = localEntry.raw.product?.status ?? null;
  const isActive = desiredStatus === 'ACTIVE';
  const isPublishedOnline = Boolean(remoteEntry?.product.onlineStoreUrl);

  if (isActive && !isPublishedOnline) {
    return {action: 'publish'};
  }

  if (!isActive && isPublishedOnline) {
    return {action: 'unpublish'};
  }

  return {action: null};
}

function buildPushComparableProductSliceFromLocal(localEntry) {
  return {
    product: normalizePushOwnedProduct(localEntry.raw.product),
    descriptionHtml: localEntry.raw.descriptionHtml ?? '',
    seo: normalizeComparableSeo(localEntry.raw.seo),
    variants: normalizePushComparableVariants(localEntry.raw.variants),
  };
}

function buildPushComparableProductSliceFromRemote(remoteEntry) {
  if (!remoteEntry) return null;

  return {
    product: normalizePushOwnedProduct(remoteEntry.product),
    descriptionHtml: remoteEntry.product.descriptionHtml ?? '',
    seo: normalizeComparableSeo(remoteEntry.product.seo),
    variants: normalizePushComparableVariants(remoteEntry.variants),
  };
}

function buildPushComparableMetafieldsFromLocal(localEntry) {
  return normalizePushComparableMetafields(localEntry.raw.metafields);
}

function buildPushComparableMetafieldsFromRemote(remoteEntry) {
  if (!remoteEntry) return [];
  return normalizePushComparableMetafields(remoteEntry.metafields);
}

function buildProductIdentifier(localEntry, remoteEntry) {
  const remoteProductId = remoteEntry?.product.id ?? null;
  const syncProductId = localEntry.raw.syncState?.productId ?? null;
  const localProductId = localEntry.raw.product?.id ?? null;
  const productId = remoteProductId ?? syncProductId ?? localProductId;

  if (isShopifyGid(productId, 'Product')) {
    return {id: productId};
  }

  return {handle: localEntry.raw.product.handle};
}

function buildProductSetInput(localEntry) {
  const product = localEntry.raw.product;
  return {
    handle: product.handle,
    title: product.title,
    status: product.status ?? null,
    descriptionHtml: localEntry.raw.descriptionHtml ?? '',
    vendor: product.vendor ?? null,
    productType: product.productType ?? null,
    tags: Array.isArray(product.tags) ? [...product.tags] : [],
    templateSuffix: product.templateSuffix ?? null,
    redirectNewHandle: true,
    seo: normalizeComparableSeo(localEntry.raw.seo),
    productOptions: buildProductOptionInputs(product.options),
    variants: buildProductVariantSetInputs(localEntry.raw.variants),
  };
}

function buildProductOptionInputs(options) {
  return Array.isArray(options)
    ? [...options].sort(compareByPositionThenId).map((option) => ({
        id: option.id ?? undefined,
        name: option.name,
        position: option.position ?? undefined,
        values: Array.isArray(option.values)
          ? option.values.map((value) => ({name: value}))
          : [],
      }))
    : [];
}

function buildProductVariantSetInputs(variants) {
  return Array.isArray(variants)
    ? [...variants].sort(compareByPositionThenId).map((variant) => ({
        id: isShopifyGid(variant.id, 'ProductVariant') ? variant.id : undefined,
        optionValues: Array.isArray(variant.selectedOptions)
          ? variant.selectedOptions.map((option) => ({
              optionName: option.name,
              name: option.value,
            }))
          : [],
        position: variant.position ?? undefined,
        price: variant.price ?? null,
        compareAtPrice: variant.compareAtPrice ?? null,
        taxable:
          typeof variant.taxable === 'boolean' ? variant.taxable : undefined,
        inventoryPolicy: variant.inventoryPolicy ?? undefined,
        sku: variant.sku ?? null,
        barcode: variant.barcode ?? null,
      }))
    : [];
}

function buildMetafieldsSetInputs(localEntry, productId) {
  if (!productId) return [];

  return Array.isArray(localEntry.raw.metafields)
    ? localEntry.raw.metafields.map((metafield) => ({
        ownerId: productId,
        namespace: metafield.namespace,
        key: metafield.key,
        type: metafield.type,
        value: metafield.value,
        compareDigest: metafield.compareDigest ?? null,
      }))
    : [];
}

function buildMediaPushPlan(localEntry, remoteEntry) {
  const localMedia = Array.isArray(localEntry.raw.media)
    ? localEntry.raw.media
    : [];
  const remoteMedia = Array.isArray(remoteEntry?.media)
    ? remoteEntry.media
    : [];
  const remoteBySignature = new Map();
  const localSignatures = new Set();
  const additions = [];
  const warnings = [];

  for (const media of remoteMedia) {
    const signature = buildMediaSignature(media);
    if (signature) {
      remoteBySignature.set(signature, media);
    }
  }

  for (const media of localMedia) {
    const normalized = normalizePushComparableMediaEntry(media);
    const signature = buildMediaSignature(normalized);
    if (signature) {
      localSignatures.add(signature);
    }

    const remoteMatch = signature ? remoteBySignature.get(signature) : null;
    if (remoteMatch) {
      const localAlt = normalized.alt ?? '';
      const remoteAlt =
        normalizePushComparableMediaEntry(remoteMatch).alt ?? '';
      if (localAlt !== remoteAlt) {
        warnings.push(
          `media alt differs for ${signature}; alt updates are not applied in v1`,
        );
      }
      continue;
    }

    const addition = buildMediaAddition(localEntry.raw.product.handle, media);
    if (addition) {
      additions.push(addition);
    } else {
      warnings.push('unsupported media entry skipped');
    }
  }

  for (const media of remoteMedia) {
    const signature = buildMediaSignature(media);
    if (signature && !localSignatures.has(signature)) {
      warnings.push(`remote media not present locally: ${signature}`);
    }
  }

  return {additions, warnings};
}

function buildMediaAddition(handle, media) {
  const normalized = normalizePushComparableMediaEntry(media);
  const mediaContentType = normalized.mediaContentType;
  const localPath = media.localPath ?? null;
  let originalSource = null;

  if (mediaContentType === 'EXTERNAL_VIDEO') {
    originalSource = normalized.embeddedUrl ?? normalized.originUrl ?? null;
  } else if (localPath) {
    originalSource = null;
  } else if (mediaContentType === 'IMAGE') {
    originalSource = normalized.image?.url ?? null;
  } else if (mediaContentType === 'VIDEO' || mediaContentType === 'MODEL_3D') {
    originalSource = normalized.sources?.[0]?.url ?? null;
  }

  if (!localPath && !originalSource) {
    return null;
  }

  return {
    handle,
    alt: normalized.alt,
    mediaContentType,
    localPath,
    originalSource,
  };
}

function normalizePushOwnedProduct(product) {
  return {
    handle: product.handle,
    title: product.title,
    status: product.status ?? null,
    vendor: product.vendor ?? null,
    productType: product.productType ?? null,
    tags: Array.isArray(product.tags) ? [...product.tags].sort() : [],
    templateSuffix: product.templateSuffix ?? null,
    options: Array.isArray(product.options)
      ? [...product.options].sort(compareByPositionThenId).map((option) => ({
          name: option.name,
          position: option.position ?? null,
          values: Array.isArray(option.values) ? [...option.values] : [],
        }))
      : [],
  };
}

function normalizePushComparableVariants(variants) {
  return Array.isArray(variants)
    ? [...variants]
        .map((variant) => ({
          id: variant.id ?? null,
          title: variant.title ?? null,
          sku: variant.sku ?? null,
          barcode: variant.barcode ?? null,
          position: variant.position ?? null,
          price: variant.price ?? null,
          compareAtPrice: variant.compareAtPrice ?? null,
          taxable: variant.taxable ?? null,
          inventoryPolicy: variant.inventoryPolicy ?? null,
          selectedOptions: Array.isArray(variant.selectedOptions)
            ? variant.selectedOptions.map((option) => ({
                name: option.name,
                value: option.value,
              }))
            : [],
        }))
        .sort(compareByPositionThenId)
    : [];
}

function normalizePushComparableMetafields(metafields) {
  return Array.isArray(metafields)
    ? [...metafields]
        .map((metafield) => ({
          namespace: metafield.namespace,
          key: metafield.key,
          type: metafield.type,
          value: metafield.value,
        }))
        .sort(compareMetafields)
    : [];
}

function normalizePushComparableMediaEntry(entry) {
  const mediaContentType =
    entry.mediaContentType ?? mapMediaTypeFromTypename(entry.type) ?? null;

  return {
    type: entry.type ?? null,
    mediaContentType,
    alt: entry.alt ?? entry.image?.altText ?? null,
    embeddedUrl: entry.embeddedUrl ?? null,
    originUrl: entry.originUrl ?? null,
    image: entry.image
      ? {
          url: entry.image.url,
          altText: entry.image.altText ?? null,
        }
      : null,
    sources: Array.isArray(entry.sources)
      ? entry.sources.map((source) => ({
          url: source.url,
          format: source.format ?? null,
          mimeType: source.mimeType ?? null,
        }))
      : [],
  };
}

function normalizeRemoteCatalogEntry(entry) {
  return {
    product: normalizeComparableRemoteProduct(entry.product),
    descriptionHtml: entry.product.descriptionHtml ?? '',
    seo: normalizeComparableSeo(entry.product.seo),
    variants: normalizeComparableVariants(entry.variants),
    metafields: normalizeComparableMetafields(entry.metafields),
    media: normalizeComparableMedia(entry.media),
  };
}

function normalizeComparableLocalProduct(product) {
  return normalizeComparableRemoteProduct(product);
}

function normalizeComparableRemoteProduct(product) {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    vendor: product.vendor,
    status: product.status,
    productType: product.productType,
    tags: Array.isArray(product.tags) ? [...product.tags].sort() : [],
    templateSuffix: product.templateSuffix ?? null,
    onlineStoreUrl: product.onlineStoreUrl ?? null,
    description: product.description ?? '',
    createdAt: product.createdAt ?? null,
    updatedAt: product.updatedAt ?? null,
    options: Array.isArray(product.options)
      ? [...product.options].sort(compareByPositionThenId).map((option) => ({
          id: option.id,
          name: option.name,
          position: option.position,
          values: Array.isArray(option.values) ? [...option.values] : [],
        }))
      : [],
  };
}

function normalizeComparableSeo(seo) {
  return {
    title: seo?.title ?? null,
    description: seo?.description ?? null,
  };
}

function normalizeComparableVariants(variants) {
  return Array.isArray(variants)
    ? [...variants]
        .map((variant) => ({
          id: variant.id,
          displayName: variant.displayName ?? null,
          title: variant.title ?? null,
          sku: variant.sku ?? null,
          barcode: variant.barcode ?? null,
          position: variant.position ?? null,
          price: variant.price ?? null,
          compareAtPrice: variant.compareAtPrice ?? null,
          taxable: variant.taxable ?? null,
          inventoryPolicy: variant.inventoryPolicy ?? null,
          updatedAt: variant.updatedAt ?? null,
          selectedOptions: Array.isArray(variant.selectedOptions)
            ? variant.selectedOptions.map((option) => ({
                name: option.name,
                value: option.value,
              }))
            : [],
        }))
        .sort(compareByPositionThenId)
    : [];
}

function normalizeComparableMetafields(metafields) {
  return Array.isArray(metafields)
    ? [...metafields]
        .map((metafield) => ({
          id: metafield.id,
          namespace: metafield.namespace,
          key: metafield.key,
          type: metafield.type,
          value: metafield.value,
          description: metafield.description ?? null,
          updatedAt: metafield.updatedAt ?? null,
          compareDigest: metafield.compareDigest ?? null,
        }))
        .sort(compareMetafields)
    : [];
}

function normalizeComparableMedia(media) {
  return Array.isArray(media)
    ? [...media]
        .map((entry) => ({
          id: entry.id,
          type: entry.type ?? null,
          mediaContentType: entry.mediaContentType ?? null,
          status: entry.status ?? null,
          alt: entry.alt ?? null,
          embeddedUrl: entry.embeddedUrl ?? null,
          host: entry.host ?? null,
          originUrl: entry.originUrl ?? null,
          image: entry.image
            ? {
                url: entry.image.url,
                altText: entry.image.altText ?? null,
                width: entry.image.width ?? null,
                height: entry.image.height ?? null,
              }
            : null,
          sources: Array.isArray(entry.sources)
            ? entry.sources.map((source) => ({
                url: source.url,
                format: source.format ?? null,
                mimeType: source.mimeType ?? null,
                width: source.width ?? null,
                height: source.height ?? null,
                filesize: source.filesize ?? null,
              }))
            : [],
        }))
        .sort(compareMedia)
    : [];
}

async function readJson(filePath) {
  return JSON.parse(await readText(filePath));
}

async function readOptionalJson(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  return readJson(filePath);
}

async function readText(filePath) {
  return readFile(filePath, 'utf8');
}

async function collectFilesRecursive(directoryPath, extension) {
  const entries = await readdir(directoryPath, {withFileTypes: true});
  const files = [];

  for (const entry of entries) {
    const childPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFilesRecursive(childPath, extension)));
      continue;
    }

    if (entry.isFile() && childPath.endsWith(extension)) {
      files.push(childPath);
    }
  }

  return files;
}

function collectAllFilesRecursiveSync(directoryPath) {
  const entries = readdirSync(directoryPath, {withFileTypes: true});
  const files = [];

  for (const entry of entries) {
    const childPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectAllFilesRecursiveSync(childPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(childPath);
    }
  }

  return files;
}

async function listSubdirectoryNames(directoryPath) {
  if (!existsSync(directoryPath)) {
    return [];
  }

  const entries = await readdir(directoryPath, {withFileTypes: true});
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function stableStringify(value) {
  return JSON.stringify(value);
}

async function downloadImageAsset(sourceUrl, mediaDir, fileStem) {
  const url = new URL(sourceUrl);
  const extension = path.extname(url.pathname) || '.bin';
  const fileName = `${fileStem}${extension}`;
  const outputPath = path.join(mediaDir, fileName);
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to download media: ${response.status} ${response.statusText}`,
    );
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  await writeFile(outputPath, bytes);
  return path.relative(process.cwd(), outputPath);
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function compareByPositionThenId(left, right) {
  const leftPosition = left.position ?? Number.MAX_SAFE_INTEGER;
  const rightPosition = right.position ?? Number.MAX_SAFE_INTEGER;
  if (leftPosition !== rightPosition) {
    return leftPosition - rightPosition;
  }

  return String(left.id ?? '').localeCompare(String(right.id ?? ''));
}

function compareMetafields(left, right) {
  const namespaceCompare = left.namespace.localeCompare(right.namespace);
  if (namespaceCompare !== 0) return namespaceCompare;
  return left.key.localeCompare(right.key);
}

function compareMedia(left, right) {
  return String(left.id ?? '').localeCompare(String(right.id ?? ''));
}

async function loadExistingMediaLocalPaths(productDir) {
  const mediaPath = path.join(productDir, 'media.json');
  if (!existsSync(mediaPath)) {
    return new Map();
  }

  const existingMedia = await readJson(mediaPath);
  const mediaLocalPaths = new Map();

  for (const entry of Array.isArray(existingMedia) ? existingMedia : []) {
    const signature = buildMediaSignature(entry);
    if (signature && entry.localPath) {
      mediaLocalPaths.set(signature, entry.localPath);
    }
  }

  return mediaLocalPaths;
}

function buildMediaSignature(entry) {
  const normalized = normalizePushComparableMediaEntry(entry);

  switch (normalized.mediaContentType) {
    case 'IMAGE':
      return normalized.image?.url
        ? `IMAGE:${normalized.image.url}`
        : entry.localPath
        ? `IMAGE_LOCAL:${entry.localPath}`
        : null;
    case 'EXTERNAL_VIDEO':
      return normalized.embeddedUrl || normalized.originUrl
        ? `EXTERNAL_VIDEO:${normalized.embeddedUrl ?? normalized.originUrl}`
        : null;
    case 'VIDEO':
      return normalized.sources?.[0]?.url
        ? `VIDEO:${normalized.sources[0].url}`
        : entry.localPath
        ? `VIDEO_LOCAL:${entry.localPath}`
        : null;
    case 'MODEL_3D':
      return normalized.sources?.[0]?.url
        ? `MODEL_3D:${normalized.sources[0].url}`
        : entry.localPath
        ? `MODEL_3D_LOCAL:${entry.localPath}`
        : null;
    default:
      return null;
  }
}

function slugify(value) {
  return (
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'asset'
  );
}

function stringValue(value) {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

function canonicalizeSeedHandle(raw) {
  const name = stringValue(raw.name);
  const slug = stringValue(raw.slug);
  if (name === 'P' || slug === 'p') return 'pot';
  if (name === 'Sum/Dist' || slug === 'sum-dist') return 'sumdist';
  return slug;
}

function normalizeVendor(company) {
  return company === 'lzx' ? 'LZX Industries' : startCase(company ?? '');
}

function normalizeSeedProductType(productType) {
  if (!productType) return null;
  if (productType === 'eurorack_module') return 'EuroRack Module';
  if (productType === 'instrument') return 'Instrument';
  if (productType === 'accessory') return 'Accessory';
  return startCase(productType.replace(/_/g, ' '));
}

function buildSeedTags(raw) {
  const tags = [];
  tags.push(raw.status?.is_active === true ? 'Active' : 'Legacy');

  const category = stringValue(raw.category);
  if (category) {
    tags.push(startCase(category));
  }

  tags.push(raw.status?.is_hidden === true ? 'Hidden' : 'Visible');
  return tags;
}

function buildDescriptionHtml(description, sections = []) {
  const paragraphs = description
    ? description
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    : [];
  const htmlSections = sections.filter(Boolean);

  return [...paragraphs, ...htmlSections].join('\n');
}

function buildSpecsHtml(specs) {
  if (!specs || typeof specs !== 'object') return null;

  const entries = Object.entries(specs)
    .filter(([, value]) => value != null && value !== '')
    .map(
      ([key, value]) =>
        `<li><strong>${escapeHtml(
          startCase(key.replace(/_/g, ' ')),
        )}:</strong> ${escapeHtml(String(value))}</li>`,
    );

  return entries.length > 0 ? `<ul>${entries.join('')}</ul>` : null;
}

function flattenSeedManifestEntries(value, category = 'other') {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((entry) => ({...entry, category}));
  }

  return Object.entries(value).flatMap(([key, child]) =>
    flattenSeedManifestEntries(child, `${category}.${key}`),
  );
}

function isSeedGalleryImageRelativePath(relativePath) {
  const normalized = String(relativePath).replace(/\\/g, '/').toLowerCase();
  const extension = path.extname(normalized);
  if (!['.png', '.jpg', '.jpeg', '.webp'].includes(extension)) {
    return false;
  }

  const segments = normalized.split('/');
  return segments.includes('website') || segments.includes('photos');
}

function buildSeedLegacyContent(sourcePath, raw, handle, title) {
  const modulargridDescription = readSeedModulargridDescription(
    sourcePath,
    raw,
  );
  const forumTopic = readSeedForumTopic(sourcePath, raw, handle);
  const description =
    stringValue(raw.description) ??
    modulargridDescription ??
    forumTopic?.excerpt ??
    '';
  const downloads = collectSeedDownloadAssets(sourcePath, raw);
  const descriptionSections = buildSeedDescriptionSections(
    downloads,
    forumTopic,
  );

  return {
    description,
    specsHtml: forumTopic?.specsHtml ?? null,
    descriptionSections,
    forumTopic,
    downloads,
    metafieldValue:
      downloads.length > 0 || forumTopic
        ? {
            downloads: downloads.map((download) => ({
              title: download.title,
              note: download.note,
              extension: download.extension,
              localPath: download.localPath,
            })),
            forumThreadUrl: forumTopic?.url ?? null,
            forumVideoUrls: forumTopic?.videoUrls ?? [],
            forumImageUrls: forumTopic?.imageUrls ?? [],
          }
        : null,
  };
}

function buildSeedDescriptionSections(downloads, forumTopic) {
  const sections = [];

  if (downloads.length > 0) {
    sections.push(
      [
        '<h2>Legacy Downloads</h2>',
        '<ul>',
        ...downloads.map(
          (download) =>
            `<li>${escapeHtml(download.title)}${
              download.note ? ` - ${escapeHtml(download.note)}` : ''
            }</li>`,
        ),
        '</ul>',
      ].join(''),
    );
  }

  if (forumTopic) {
    const links = [
      `<li><a href="${escapeHtmlAttribute(
        forumTopic.url,
      )}">Original community thread</a></li>`,
      ...forumTopic.videoUrls.map(
        (url, index) =>
          `<li><a href="${escapeHtmlAttribute(url)}">Community video ${
            index + 1
          }</a></li>`,
      ),
    ];

    sections.push(
      [
        '<h2>Community Archive</h2>',
        forumTopic.excerpt ? `<p>${escapeHtml(forumTopic.excerpt)}</p>` : '',
        links.length > 0 ? `<ul>${links.join('')}</ul>` : '',
      ].join(''),
    );
  }

  return sections;
}

function getSupplementalSeedMediaRoots(sourcePath, handle) {
  const productRoot = path.join(resolveLfsLibraryRoot(sourcePath), 'products');
  return (SUPPLEMENTAL_SEED_MEDIA_ROOTS[handle] ?? []).map((relativePath) =>
    path.resolve(productRoot, relativePath),
  );
}

function buildSeedMediaEntries(sourcePath, raw, title, legacyContent, handle) {
  const productRoot = path.dirname(sourcePath);
  const seenLocalPaths = new Set();
  const seenRemoteUrls = new Set();
  const entries = [];
  const localCandidates = new Set();

  const preferredFrontpanel = stringValue(raw.images?.frontpanel);
  if (preferredFrontpanel) {
    const absolutePath = path.resolve(productRoot, preferredFrontpanel);
    if (
      isSeedGalleryImageRelativePath(preferredFrontpanel) ||
      existsSync(absolutePath)
    ) {
      localCandidates.add(absolutePath);
    }
  }

  for (const entry of flattenSeedManifestEntries(raw.file_manifest, 'other')) {
    if (!entry?.path || !isSeedGalleryImageRelativePath(entry.path)) continue;
    localCandidates.add(path.resolve(productRoot, entry.path));
  }

  for (const absolutePath of collectAllFilesRecursiveSync(productRoot)) {
    const relativePath = path
      .relative(productRoot, absolutePath)
      .split(path.sep)
      .join('/');
    if (!isSeedGalleryImageRelativePath(relativePath)) continue;
    localCandidates.add(absolutePath);
  }

  for (const supplementalRoot of getSupplementalSeedMediaRoots(
    sourcePath,
    handle,
  )) {
    if (!existsSync(supplementalRoot)) continue;

    for (const absolutePath of collectAllFilesRecursiveSync(supplementalRoot)) {
      const relativePath = path
        .relative(supplementalRoot, absolutePath)
        .split(path.sep)
        .join('/');
      if (!isSeedGalleryImageRelativePath(relativePath)) continue;
      localCandidates.add(absolutePath);
    }
  }

  const localEntries = [...localCandidates]
    .filter((absolutePath) => {
      if (!existsSync(absolutePath)) return false;
      if (seenLocalPaths.has(absolutePath)) return false;
      seenLocalPaths.add(absolutePath);
      return true;
    })
    .sort(compareSeedMediaPaths)
    .map((absolutePath, index) => ({
      kind: 'local-image',
      sourcePath: absolutePath,
      alt: index === 0 ? title : `${title} image ${index + 1}`,
    }));

  entries.push(...localEntries);

  if (legacyContent.forumTopic) {
    for (const url of legacyContent.forumTopic.imageUrls) {
      if (seenRemoteUrls.has(url)) continue;
      seenRemoteUrls.add(url);
      entries.push({
        kind: 'remote',
        type: 'MediaImage',
        mediaContentType: 'IMAGE',
        alt: `${title} archive image`,
        embeddedUrl: null,
        originUrl: url,
        image: {
          url,
          altText: `${title} archive image`,
        },
        sources: [],
      });
    }

    for (const url of legacyContent.forumTopic.videoUrls) {
      if (seenRemoteUrls.has(url)) continue;
      seenRemoteUrls.add(url);
      entries.push({
        kind: 'remote',
        type: 'ExternalVideo',
        mediaContentType: 'EXTERNAL_VIDEO',
        alt: `${title} community video`,
        embeddedUrl: url,
        originUrl: url,
        image: null,
        sources: [],
      });
    }
  }

  return entries;
}

function collectSeedDownloadAssets(sourcePath, raw) {
  const productRoot = path.dirname(sourcePath);
  const downloadEntries = Array.isArray(raw.file_manifest?.downloads)
    ? raw.file_manifest.downloads
    : [];

  return downloadEntries
    .map((entry) => {
      if (!entry?.path) return null;
      const absolutePath = path.resolve(productRoot, entry.path);
      if (!existsSync(absolutePath)) return null;
      const extension =
        path.extname(absolutePath).replace(/^\./, '').toLowerCase() || null;
      return {
        title: startCase(
          path.basename(absolutePath, path.extname(absolutePath)),
        ),
        note: stringValue(entry.note),
        extension,
        localPath: path.relative(process.cwd(), absolutePath),
      };
    })
    .filter(Boolean);
}

function readSeedModulargridDescription(sourcePath, raw) {
  const metadataPath = Array.isArray(raw.file_manifest?.modulargrid)
    ? raw.file_manifest.modulargrid
        .map((entry) => entry?.path)
        .find(
          (candidate) =>
            typeof candidate === 'string' && candidate.endsWith('metadata.md'),
        )
    : null;

  if (!metadataPath) return null;

  const absolutePath = path.resolve(path.dirname(sourcePath), metadataPath);
  if (!existsSync(absolutePath)) return null;

  const markdown = readFileSync(absolutePath, 'utf8');
  const match = markdown.match(/## Description\s+([\s\S]*?)(?:\n---|$)/);
  if (!match) return null;

  return stripMarkdown(match[1]);
}

function readSeedForumTopic(sourcePath, raw, handle) {
  const threadUrl = stringValue(raw.images?.external_url);
  const slug = threadUrl
    ? extractTopicSlugFromUrl(threadUrl)
    : `all-about-${handle}`;
  if (!slug) return null;

  const topicPath = path.join(
    resolveLfsLibraryRoot(sourcePath),
    'scrape',
    'community',
    'topics',
    `${slug}.json`,
  );
  if (!existsSync(topicPath)) return null;

  const topic = JSON.parse(readFileSync(topicPath, 'utf8'));
  const cooked = topic?.posts?.[0]?.cooked;
  if (typeof cooked !== 'string' || !cooked) return null;

  return {
    url:
      threadUrl ?? `https://community.lzxindustries.net/t/${slug}/${topic.id}`,
    excerpt: extractFirstParagraphText(cooked),
    imageUrls: extractAttributeValues(cooked, 'img', 'src').slice(0, 8),
    videoUrls: extractAttributeValues(cooked, 'iframe', 'src').slice(0, 4),
    specsHtml: extractForumSectionHtml(cooked, 'Specifications'),
  };
}

function resolveLfsLibraryRoot(sourcePath) {
  let current = path.dirname(sourcePath);

  while (current !== path.dirname(current)) {
    if (
      path.basename(current) === 'products' &&
      path.basename(path.dirname(current)) === 'library'
    ) {
      return path.dirname(current);
    }
    current = path.dirname(current);
  }

  return path.resolve(process.cwd(), 'lfs', 'library');
}

function extractTopicSlugFromUrl(value) {
  try {
    const url = new URL(value);
    const segments = url.pathname.split('/').filter(Boolean);
    const topicIndex = segments.findIndex((segment) => segment === 't');
    return topicIndex >= 0 ? segments[topicIndex + 1] ?? null : null;
  } catch {
    return null;
  }
}

function extractFirstParagraphText(html) {
  const normalized = html
    .replace(/<div class="lightbox-wrapper">[\s\S]*?<\/div>/gi, ' ')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ');
  const paragraphs = [...normalized.matchAll(/<p>([\s\S]*?)<\/p>/gi)];

  for (const paragraph of paragraphs) {
    const text = collapseWhitespace(
      decodeHtmlEntities(stripHtml(paragraph[1])),
    );
    if (text) {
      return text;
    }
  }

  return '';
}

function extractForumSectionHtml(html, title) {
  const escapedTitle = escapeRegExp(title);
  const match = html.match(
    new RegExp(
      `<h1[^>]*>${'[\\s\\S]*?'}${escapedTitle}<\\/h1>([\\s\\S]*?)(?=<h1|$)`,
      'i',
    ),
  );
  return match ? match[1].trim() : null;
}

function extractAttributeValues(html, tagName, attributeName) {
  const pattern = new RegExp(
    `<${tagName}[^>]*\\s${attributeName}="([^"]+)"`,
    'gi',
  );
  const matches = [];
  let match = pattern.exec(html);

  while (match) {
    matches.push(decodeHtmlEntities(match[1]));
    match = pattern.exec(html);
  }

  return [...new Set(matches)];
}

function compareSeedMediaPaths(left, right) {
  return (
    scoreSeedMediaPath(left) - scoreSeedMediaPath(right) ||
    left.localeCompare(right)
  );
}

function scoreSeedMediaPath(filePath) {
  const normalized = filePath.toLowerCase();
  if (normalized.includes('front-panel-square')) return 0;
  if (normalized.includes('frontpanel-square')) return 1;
  if (normalized.includes('front-panel')) return 2;
  if (normalized.includes('frontpanel')) return 3;
  if (normalized.includes('front-photo')) return 4;
  if (normalized.includes('angle-photo')) return 5;
  return 10;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeHtmlAttribute(value) {
  return escapeHtml(value);
}

function stripMarkdown(value) {
  return collapseWhitespace(
    String(value)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/[_*`>#-]/g, ' '),
  );
}

function stripHtml(value) {
  return String(value).replace(/<[^>]+>/g, ' ');
}

function collapseWhitespace(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeHtmlEntities(value) {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function truncateText(value, maxLength) {
  const normalized = stringValue(value)?.replace(/\s+/g, ' ') ?? null;
  if (!normalized) return null;
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trimEnd()}...`;
}

function startCase(value) {
  return String(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function delay(durationMs) {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}

function chunkArray(values, size) {
  const chunks = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

function isShopifyGid(value, resource) {
  return (
    typeof value === 'string' && value.startsWith(`gid://shopify/${resource}/`)
  );
}

function mapMediaTypeFromTypename(typeName) {
  switch (typeName) {
    case 'MediaImage':
      return 'IMAGE';
    case 'ExternalVideo':
      return 'EXTERNAL_VIDEO';
    case 'Video':
      return 'VIDEO';
    case 'Model3d':
      return 'MODEL_3D';
    default:
      return null;
  }
}

function getStagedUploadResource(mediaContentType) {
  switch (mediaContentType) {
    case 'IMAGE':
      return 'PRODUCT_IMAGE';
    case 'VIDEO':
      return 'VIDEO';
    case 'MODEL_3D':
      return 'MODEL_3D';
    default:
      throw new Error(
        `Unsupported staged upload media type: ${mediaContentType}`,
      );
  }
}

function guessMimeType(fileName, mediaContentType) {
  const extension = path.extname(fileName).toLowerCase();

  switch (extension) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.mp4':
      return 'video/mp4';
    case '.mov':
      return 'video/quicktime';
    case '.webm':
      return 'video/webm';
    case '.glb':
      return 'model/gltf-binary';
    case '.gltf':
      return 'model/gltf+json';
    default:
      if (mediaContentType === 'VIDEO') return 'video/mp4';
      if (mediaContentType === 'MODEL_3D') return 'model/gltf-binary';
      return 'application/octet-stream';
  }
}

function loadEnvFiles(cwd) {
  for (const fileName of ['.env', '.env.local']) {
    const filePath = path.join(cwd, fileName);
    if (!existsSync(filePath)) continue;

    const contents = readFileSync(filePath, 'utf8');
    const lines = contents.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex < 0) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      process.env[key] = unquoteEnvValue(rawValue);
    }
  }
}

function unquoteEnvValue(rawValue) {
  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    return rawValue.slice(1, -1);
  }

  return rawValue;
}
