#!/usr/bin/env node

import {mkdir, unlink, writeFile} from 'node:fs/promises';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {Readable} from 'node:stream';
import readline from 'node:readline';

const DEFAULT_API_VERSION = '2025-04';
const DEFAULT_OUTPUT_DIR = 'catalog/shopify';
const REQUIRED_ENV_VARS = [
  'PUBLIC_STORE_DOMAIN',
  'SHOPIFY_CLIENT_ID',
  'SHOPIFY_CLIENT_SECRET',
];
const HELP_TEXT = `Shopify catalog sync CLI

Usage:
  node scripts/shopify-sync.mjs doctor [--offline] [--output-dir <dir>]
  node scripts/shopify-sync.mjs pull [--output-dir <dir>] [--handle <handle>] [--query <search>] [--no-media-download]

Commands:
  doctor    Validate local sync prerequisites and environment configuration.
  pull      Export Shopify product data into local JSON, HTML, and media files.

Options:
  --output-dir <dir>      Output root. Defaults to catalog/shopify.
  --handle <handle>       Restrict export to one product handle. Repeatable.
  --query <search>        Additional Shopify product search filter.
  --no-media-download     Skip downloading image assets.
  --offline               Skip Shopify credential checks for doctor.
  --help                  Show this help text.
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

  if (cli.command === 'pull') {
    await runPull(config, cli);
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
    if (key === 'help' || key === 'offline' || key === 'no-media-download') {
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

  return {
    apiVersion: process.env.PUBLIC_STOREFRONT_API_VERSION || DEFAULT_API_VERSION,
    outputDir,
    downloadMedia: cli.flags['no-media-download'] !== true,
    storeDomain: process.env.PUBLIC_STORE_DOMAIN || '',
    clientId: process.env.SHOPIFY_CLIENT_ID || '',
    clientSecret: process.env.SHOPIFY_CLIENT_SECRET || '',
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
  console.log(`Credential checks: ${offline ? 'skipped (--offline)' : 'enabled'}`);
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
  const missing = REQUIRED_ENV_VARS.filter((envVar) => !process.env[envVar]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }

  await mkdir(config.outputDir, {recursive: true});

  const searchQuery = buildSearchQuery(cli.values.handle ?? [], cli.values.query);
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
  const catalog = await downloadCatalog(bulkOperation.url);
  console.log(`Parsed ${catalog.products.length} product records.`);

  console.log('Writing local catalog files...');
  const summary = await writeCatalog(config, catalog, searchQuery);

  console.log('');
  console.log(`Products exported: ${summary.productCount}`);
  console.log(`Image assets downloaded: ${summary.downloadedImages}`);
  console.log(`Catalog root: ${config.outputDir}`);
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
        error instanceof Error ? error.message : 'Unable to create output directory',
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

    if (bulkOperation.status === 'FAILED' || bulkOperation.status === 'CANCELED') {
      throw new Error(
        `Bulk operation ${bulkOperation.status.toLowerCase()}: ${bulkOperation.errorCode || 'unknown error'}`,
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
    throw new Error(`Failed to download bulk export: ${response.status} ${response.statusText}`);
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
    .sort((left, right) => left.product.handle.localeCompare(right.product.handle));

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
  return record.__typename === 'ProductVariant' || Array.isArray(record.selectedOptions);
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
  return record.__typename === 'Metafield' || (record.namespace && record.key && record.type);
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
  return Boolean(record.mediaContentType) || Boolean(record.__typename?.includes('Video')) || record.__typename === 'MediaImage' || record.__typename === 'Model3d';
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

    await writeJson(
      path.join(productDir, 'product.json'),
      entry.product,
    );
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
    const mediaManifest = [];

    for (let index = 0; index < entry.media.length; index++) {
      const media = entry.media[index];
      const manifestEntry = {...media};

      if (config.downloadMedia && media.image?.url) {
        const localRelativePath = await downloadImageAsset(
          media.image.url,
          mediaDir,
          `${String(index + 1).padStart(2, '0')}-${slugify(media.alt || entry.product.handle || 'image')}`,
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

async function downloadImageAsset(sourceUrl, mediaDir, fileStem) {
  const url = new URL(sourceUrl);
  const extension = path.extname(url.pathname) || '.bin';
  const fileName = `${fileStem}${extension}`;
  const outputPath = path.join(mediaDir, fileName);
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to download media: ${response.status} ${response.statusText}`);
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

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'asset';
}

function delay(durationMs) {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
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