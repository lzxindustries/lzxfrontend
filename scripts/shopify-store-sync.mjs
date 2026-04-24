#!/usr/bin/env node

import {mkdir, readFile, readdir, unlink, writeFile} from 'node:fs/promises';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_API_VERSION = '2025-04';
const DEFAULT_OUTPUT_DIR = 'catalog/shopify/store';
const DEFAULT_SOURCE_DIR = 'policies';
const REQUIRED_ENV_VARS = [
  'PUBLIC_STORE_DOMAIN',
  'SHOPIFY_CLIENT_ID',
  'SHOPIFY_CLIENT_SECRET',
];

const POLICY_DEFINITIONS = [
  {
    handle: 'privacy-policy',
    title: 'Privacy Policy',
    type: 'PRIVACY_POLICY',
  },
  {
    handle: 'shipping-policy',
    title: 'Shipping Policy',
    type: 'SHIPPING_POLICY',
  },
  {
    handle: 'terms-of-service',
    title: 'Terms of Service',
    type: 'TERMS_OF_SERVICE',
  },
  {
    handle: 'refund-policy',
    title: 'Refund Policy',
    type: 'REFUND_POLICY',
  },
  {
    handle: 'subscription-policy',
    title: 'Subscription Policy',
    type: 'SUBSCRIPTION_POLICY',
  },
];

const PAGE_DEFINITIONS = [
  {handle: 'contact-information', title: 'Contact Information'},
  {handle: 'legal-notice', title: 'Legal Notice'},
];

const POLICY_BY_HANDLE = new Map(
  POLICY_DEFINITIONS.map((definition) => [definition.handle, definition]),
);
const POLICY_BY_TYPE = new Map(
  POLICY_DEFINITIONS.map((definition) => [definition.type, definition]),
);
const PAGE_BY_HANDLE = new Map(
  PAGE_DEFINITIONS.map((definition) => [definition.handle, definition]),
);

const HELP_TEXT = `Shopify store sync CLI

Usage:
  node scripts/shopify-store-sync.mjs doctor [--offline] [--output-dir <dir>]
  node scripts/shopify-store-sync.mjs seed [--output-dir <dir>] [--from-dir <dir>] [--handle <handle>]
  node scripts/shopify-store-sync.mjs pull [--output-dir <dir>] [--handle <handle>]
  node scripts/shopify-store-sync.mjs diff [--output-dir <dir>] [--handle <handle>]
  node scripts/shopify-store-sync.mjs push [--output-dir <dir>] [--handle <handle>] [--apply]
  node scripts/shopify-store-sync.mjs sync [--output-dir <dir>] [--handle <handle>] [--apply]

Commands:
  doctor    Validate local sync prerequisites and environment configuration.
  seed      Import existing local policy/page source files into the canonical store mirror.
  pull      Export Shopify store policies and configured store pages into local files.
  diff      Compare local store files against the latest Shopify store data.
  push      Plan or apply local store changes back to Shopify.
  sync      Run doctor and then push using the local store mirror as the source of truth.

Options:
  --output-dir <dir>      Output root. Defaults to catalog/shopify/store.
  --from-dir <dir>        Seed source root. Defaults to policies.
  --handle <handle>       Restrict work to one resource handle. Repeatable.
  --apply                 Persist mutations instead of running in dry-run mode.
  --offline               Skip Shopify credential checks for doctor.
  --help                  Show this help text.
`;

const STORE_POLICIES_QUERY = `
  query StorePoliciesQuery {
    shop {
      shopPolicies {
        id
        title
        body
        type
        url
        createdAt
        updatedAt
      }
    }
  }
`;

const STORE_PAGES_QUERY = `
  query StorePagesQuery($first: Int!, $after: String, $query: String) {
    pages(first: $first, after: $after, query: $query, sortKey: UPDATED_AT) {
      nodes {
        id
        title
        handle
        body
        isPublished
        publishedAt
        templateSuffix
        createdAt
        updatedAt
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const SHOP_POLICY_UPDATE_MUTATION = `
  mutation UpdateShopPolicy($shopPolicy: ShopPolicyInput!) {
    shopPolicyUpdate(shopPolicy: $shopPolicy) {
      shopPolicy {
        id
        title
        body
        type
        url
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PAGE_CREATE_MUTATION = `
  mutation CreatePage($page: PageCreateInput!) {
    pageCreate(page: $page) {
      page {
        id
        handle
        title
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const PAGE_UPDATE_MUTATION = `
  mutation UpdatePage($id: ID!, $page: PageUpdateInput!) {
    pageUpdate(id: $id, page: $page) {
      page {
        id
        handle
        title
        updatedAt
      }
      userErrors {
        field
        message
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
    if (key === 'help' || key === 'offline' || key === 'apply') {
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
  return {
    apiVersion:
      process.env.PUBLIC_STOREFRONT_API_VERSION || DEFAULT_API_VERSION,
    outputDir: path.resolve(
      process.cwd(),
      cli.values['output-dir'] ?? DEFAULT_OUTPUT_DIR,
    ),
    sourceDir: path.resolve(
      process.cwd(),
      cli.values['from-dir'] ?? DEFAULT_SOURCE_DIR,
    ),
    storeDomain: process.env.PUBLIC_STORE_DOMAIN || '',
    clientId: process.env.SHOPIFY_CLIENT_ID || '',
    clientSecret: process.env.SHOPIFY_CLIENT_SECRET || '',
  };
}

async function runDoctor(config, offline) {
  const checks = [];

  checks.push(checkNodeVersion());
  checks.push(await checkOutputDirectory(config.outputDir));
  checks.push(await checkSourceDirectory(config.sourceDir));

  if (!offline) {
    for (const envVar of REQUIRED_ENV_VARS) {
      checks.push(checkEnvVar(envVar));
    }
  }

  const hasFailure = checks.some((check) => check.status === 'fail');

  console.log('Shopify store sync doctor');
  console.log(`Output directory: ${config.outputDir}`);
  console.log(`Source directory: ${config.sourceDir}`);
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
    console.log(
      'Doctor failed. Fix the reported issues before running store sync commands.',
    );
    return false;
  }

  console.log('');
  console.log('Doctor passed.');
  return true;
}

async function runSeed(config, cli) {
  await mkdir(config.outputDir, {recursive: true});

  const requestedHandles = new Set(cli.values.handle ?? []);
  const summary = {
    seededPolicies: 0,
    seededPages: 0,
    skipped: 0,
  };

  for (const definition of POLICY_DEFINITIONS) {
    if (requestedHandles.size > 0 && !requestedHandles.has(definition.handle)) {
      continue;
    }

    const htmlPath = path.join(config.sourceDir, `${definition.handle}.html`);
    if (!existsSync(htmlPath)) {
      continue;
    }

    const resourceDir = path.join(
      config.outputDir,
      'policies',
      definition.handle,
    );
    const targetBodyPath = path.join(resourceDir, 'body.html');
    if (existsSync(targetBodyPath)) {
      summary.skipped += 1;
      continue;
    }

    await mkdir(resourceDir, {recursive: true});
    await writeFile(targetBodyPath, await readText(htmlPath), 'utf8');
    const sourceMdPath = path.join(config.sourceDir, `${definition.handle}.md`);
    if (existsSync(sourceMdPath)) {
      await writeFile(
        path.join(resourceDir, 'source.md'),
        await readText(sourceMdPath),
        'utf8',
      );
    }
    await writeJson(path.join(resourceDir, 'policy.json'), {
      handle: definition.handle,
      title: definition.title,
      type: definition.type,
    });
    summary.seededPolicies += 1;
  }

  for (const definition of PAGE_DEFINITIONS) {
    if (requestedHandles.size > 0 && !requestedHandles.has(definition.handle)) {
      continue;
    }

    const htmlPath = path.join(config.sourceDir, `${definition.handle}.html`);
    if (!existsSync(htmlPath)) {
      continue;
    }

    const resourceDir = path.join(config.outputDir, 'pages', definition.handle);
    const targetBodyPath = path.join(resourceDir, 'body.html');
    if (existsSync(targetBodyPath)) {
      summary.skipped += 1;
      continue;
    }

    await mkdir(resourceDir, {recursive: true});
    await writeFile(targetBodyPath, await readText(htmlPath), 'utf8');
    const sourceMdPath = path.join(config.sourceDir, `${definition.handle}.md`);
    if (existsSync(sourceMdPath)) {
      await writeFile(
        path.join(resourceDir, 'source.md'),
        await readText(sourceMdPath),
        'utf8',
      );
    }
    await writeJson(path.join(resourceDir, 'page.json'), {
      handle: definition.handle,
      title: definition.title,
      isPublished: true,
      templateSuffix: null,
    });
    summary.seededPages += 1;
  }

  const localCatalog = await loadLocalStoreCatalog(config.outputDir, []);
  await writeLocalCatalogSummary(config.outputDir, localCatalog);

  console.log('Seeded local store mirror.');
  console.log(`Policies seeded: ${summary.seededPolicies}`);
  console.log(`Pages seeded: ${summary.seededPages}`);
  console.log(`Entries skipped: ${summary.skipped}`);
  console.log(`Store catalog root: ${config.outputDir}`);
}

async function runPull(config, cli) {
  assertAdminEnv();

  await mkdir(config.outputDir, {recursive: true});

  const handles = cli.values.handle ?? [];
  const remoteCatalog = await fetchRemoteStoreCatalog(config, handles);
  const summary = await writeRemoteStoreCatalog(config, remoteCatalog);

  for (const warning of remoteCatalog.warnings) {
    console.log(`Warning: ${warning}`);
  }

  console.log('');
  console.log(`Policies exported: ${summary.policyCount}`);
  console.log(`Pages exported: ${summary.pageCount}`);
  console.log(`Store catalog root: ${config.outputDir}`);
}

async function runDiff(config, cli) {
  assertAdminEnv();

  const requestedHandles = cli.values.handle ?? [];
  const localCatalog = await loadLocalStoreCatalog(
    config.outputDir,
    requestedHandles,
  );
  if (localCatalog.handles.length === 0) {
    throw new Error(
      'No local store entries found. Run seed or pull first, or provide one or more --handle values.',
    );
  }

  const remoteCatalog = await fetchRemoteStoreCatalog(
    config,
    localCatalog.handles,
  );
  const diff = compareStoreCatalogs(localCatalog, remoteCatalog);

  for (const warning of remoteCatalog.warnings) {
    console.log(`Warning: ${warning}`);
  }

  console.log(`Compared ${diff.handleCount} store handle(s).`);

  if (diff.entries.length === 0) {
    console.log('Local store catalog matches Shopify for the compared fields.');
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
  const localCatalog = await loadLocalStoreCatalog(
    config.outputDir,
    requestedHandles,
  );
  if (localCatalog.handles.length === 0) {
    throw new Error(
      'No local store entries found. Run seed or pull first, or provide one or more --handle values.',
    );
  }

  const remoteCatalog = await fetchRemoteStoreCatalog(
    config,
    localCatalog.handles,
  );
  const plan = buildPushPlan(localCatalog, remoteCatalog, requestedHandles);
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
    console.log('Refreshing local store metadata from Shopify...');
    const remoteCatalogAfterApply = await fetchRemoteStoreCatalog(
      config,
      changedHandles,
    );
    await writeRemoteStoreCatalog(config, remoteCatalogAfterApply);
  }

  console.log('Push completed.');
  return true;
}

async function runSync(config, cli) {
  console.log('Running store sync doctor...');
  const doctorOk = await runDoctor(config, false);
  if (!doctorOk) {
    return false;
  }

  console.log('Running Shopify store push...');
  return runPush(config, cli);
}

function assertAdminEnv() {
  const missing = REQUIRED_ENV_VARS.filter((envVar) => !process.env[envVar]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }
}

async function fetchRemoteStoreCatalog(config, handles) {
  const client = createAdminClient(config);
  const policyHandles = filterPolicyHandles(handles);
  const pageHandles = filterPageHandles(handles);
  const shouldFetchPolicies = handles.length === 0 || policyHandles.length > 0;
  const shouldFetchPages = handles.length === 0 || pageHandles.length > 0;

  console.log('Authenticating with Shopify Admin API...');
  await client.getAccessToken();
  console.log('Authenticated.');

  const policiesResult = shouldFetchPolicies
    ? (console.log('Downloading store policies...'),
      await fetchRemotePolicies(client, handles))
    : {entries: [], warnings: [], available: true};

  const pagesResult = shouldFetchPages
    ? (console.log('Downloading store pages...'),
      await fetchRemotePages(client, handles))
    : {entries: [], warnings: [], available: true};

  return {
    policies: policiesResult.entries,
    pages: pagesResult.entries,
    warnings: [...policiesResult.warnings, ...pagesResult.warnings],
    capabilities: {
      policies: policiesResult.available,
      pages: pagesResult.available,
    },
  };
}

async function fetchRemotePolicies(client, handles) {
  const policyHandles = filterPolicyHandles(handles);
  if (handles.length > 0 && policyHandles.length === 0) {
    return {entries: [], warnings: [], available: true};
  }

  let data;

  try {
    data = await client.graphql(STORE_POLICIES_QUERY);
  } catch (error) {
    if (isAccessDeniedError(error, 'shopPolicies')) {
      return {
        entries: [],
        warnings: [
          'Admin access to shop policies is unavailable. Grant read/write legal policy scopes to enable full policy sync.',
        ],
        available: false,
      };
    }

    throw error;
  }

  const shopPolicies = Array.isArray(data.shop?.shopPolicies)
    ? data.shop.shopPolicies
    : [];

  const policies = [];
  for (const policy of shopPolicies) {
    const definition = POLICY_BY_TYPE.get(policy.type);
    if (!definition) continue;
    if (
      policyHandles.length > 0 &&
      !policyHandles.includes(definition.handle)
    ) {
      continue;
    }

    policies.push({
      id: policy.id,
      handle: definition.handle,
      title: policy.title ?? definition.title,
      type: policy.type,
      body: policy.body ?? '',
      url: policy.url ?? null,
      createdAt: policy.createdAt ?? null,
      updatedAt: policy.updatedAt ?? null,
    });
  }

  return {
    entries: policies.sort(compareByHandle),
    warnings: [],
    available: true,
  };
}

async function fetchRemotePages(client, handles) {
  const pageHandles = filterPageHandles(handles);
  if (handles.length > 0 && pageHandles.length === 0) {
    return {entries: [], warnings: [], available: true};
  }

  const queryHandles =
    pageHandles.length > 0
      ? pageHandles
      : PAGE_DEFINITIONS.map((definition) => definition.handle);

  if (queryHandles.length === 0) {
    return [];
  }

  const searchQuery = queryHandles
    .map((handle) => `handle:${handle}`)
    .join(' OR ');
  const pages = [];
  let after = null;

  while (true) {
    let data;

    try {
      data = await client.graphql(STORE_PAGES_QUERY, {
        first: 50,
        after,
        query: searchQuery,
      });
    } catch (error) {
      if (isAccessDeniedError(error, 'pages')) {
        return {
          entries: [],
          warnings: [
            'Admin access to pages is unavailable. Grant read/write online store page scopes to enable page pull, diff, and push.',
          ],
          available: false,
        };
      }

      throw error;
    }

    const connection = data.pages;
    for (const page of connection?.nodes ?? []) {
      if (queryHandles.length > 0 && !queryHandles.includes(page.handle)) {
        continue;
      }

      pages.push({
        id: page.id,
        handle: page.handle,
        title: page.title,
        body: page.body ?? '',
        isPublished: page.isPublished ?? false,
        publishedAt: page.publishedAt ?? null,
        templateSuffix: normalizeNullableString(page.templateSuffix),
        createdAt: page.createdAt ?? null,
        updatedAt: page.updatedAt ?? null,
      });
    }

    if (!connection?.pageInfo?.hasNextPage) {
      break;
    }

    after = connection.pageInfo.endCursor;
  }

  return {
    entries: pages.sort(compareByHandle),
    warnings: [],
    available: true,
  };
}

async function writeRemoteStoreCatalog(config, remoteCatalog) {
  await mkdir(path.join(config.outputDir, 'policies'), {recursive: true});
  await mkdir(path.join(config.outputDir, 'pages'), {recursive: true});

  for (const policy of remoteCatalog.policies) {
    const policyDir = path.join(config.outputDir, 'policies', policy.handle);
    await mkdir(policyDir, {recursive: true});
    const existingSource = await readOptionalText(
      path.join(policyDir, 'source.md'),
    );
    await writeJson(path.join(policyDir, 'policy.json'), {
      id: policy.id,
      handle: policy.handle,
      title: policy.title,
      type: policy.type,
      url: policy.url,
      createdAt: policy.createdAt,
      updatedAt: policy.updatedAt,
    });
    await writeFile(
      path.join(policyDir, 'body.html'),
      `${policy.body}\n`,
      'utf8',
    );
    if (existingSource !== null) {
      await writeFile(
        path.join(policyDir, 'source.md'),
        existingSource,
        'utf8',
      );
    }
    await writeJson(path.join(policyDir, 'sync-state.json'), {
      resourceType: 'policy',
      policyType: policy.type,
      policyId: policy.id,
      shopifyUpdatedAt: policy.updatedAt,
      pulledAt: new Date().toISOString(),
      apiVersion: config.apiVersion,
    });
  }

  for (const page of remoteCatalog.pages) {
    const pageDir = path.join(config.outputDir, 'pages', page.handle);
    await mkdir(pageDir, {recursive: true});
    const existingSource = await readOptionalText(
      path.join(pageDir, 'source.md'),
    );
    await writeJson(path.join(pageDir, 'page.json'), {
      id: page.id,
      handle: page.handle,
      title: page.title,
      isPublished: page.isPublished,
      publishedAt: page.publishedAt,
      templateSuffix: page.templateSuffix,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    });
    await writeFile(path.join(pageDir, 'body.html'), `${page.body}\n`, 'utf8');
    if (existingSource !== null) {
      await writeFile(path.join(pageDir, 'source.md'), existingSource, 'utf8');
    }
    await writeJson(path.join(pageDir, 'sync-state.json'), {
      resourceType: 'page',
      pageId: page.id,
      shopifyUpdatedAt: page.updatedAt,
      pulledAt: new Date().toISOString(),
      apiVersion: config.apiVersion,
    });
  }

  await writeJson(path.join(config.outputDir, 'catalog.json'), {
    pulledAt: new Date().toISOString(),
    apiVersion: config.apiVersion,
    policyCount: remoteCatalog.policies.length,
    pageCount: remoteCatalog.pages.length,
    policies: remoteCatalog.policies.map((policy) => ({
      handle: policy.handle,
      title: policy.title,
      type: policy.type,
      updatedAt: policy.updatedAt,
    })),
    pages: remoteCatalog.pages.map((page) => ({
      handle: page.handle,
      title: page.title,
      updatedAt: page.updatedAt,
    })),
  });

  return {
    policyCount: remoteCatalog.policies.length,
    pageCount: remoteCatalog.pages.length,
  };
}

async function loadLocalStoreCatalog(outputDir, requestedHandles) {
  const policyHandles = filterPolicyHandles(requestedHandles);
  const pageHandles = filterPageHandles(requestedHandles);
  const hasExplicitHandles = requestedHandles.length > 0;

  const resolvedPolicyHandles =
    policyHandles.length > 0
      ? policyHandles
      : hasExplicitHandles
      ? []
      : await listSubdirectoryNames(path.join(outputDir, 'policies'));
  const resolvedPageHandles =
    pageHandles.length > 0
      ? pageHandles
      : hasExplicitHandles
      ? []
      : await listSubdirectoryNames(path.join(outputDir, 'pages'));

  const policies = new Map();
  const pages = new Map();

  for (const handle of resolvedPolicyHandles) {
    const entry = await readLocalPolicyEntry(outputDir, handle);
    if (entry) {
      policies.set(handle, entry);
    }
  }

  for (const handle of resolvedPageHandles) {
    const entry = await readLocalPageEntry(outputDir, handle);
    if (entry) {
      pages.set(handle, entry);
    }
  }

  return {
    handles: [...new Set([...policies.keys(), ...pages.keys()])].sort(),
    policies,
    pages,
  };
}

async function readLocalPolicyEntry(outputDir, handle) {
  const resourceDir = path.join(outputDir, 'policies', handle);
  if (!existsSync(resourceDir)) {
    return null;
  }

  const policy =
    (await readOptionalJson(path.join(resourceDir, 'policy.json'))) ?? {};
  const definition = POLICY_BY_HANDLE.get(handle);
  if (!definition) {
    throw new Error(`Unknown policy handle in local catalog: ${handle}`);
  }

  return {
    handle,
    type: policy.type ?? definition.type,
    title: policy.title ?? definition.title,
    body: await readText(path.join(resourceDir, 'body.html')),
    raw: {
      policy,
      syncState: await readOptionalJson(
        path.join(resourceDir, 'sync-state.json'),
      ),
      sourceMd: await readOptionalText(path.join(resourceDir, 'source.md')),
    },
  };
}

async function readLocalPageEntry(outputDir, handle) {
  const resourceDir = path.join(outputDir, 'pages', handle);
  if (!existsSync(resourceDir)) {
    return null;
  }

  const page =
    (await readOptionalJson(path.join(resourceDir, 'page.json'))) ?? {};
  const definition = PAGE_BY_HANDLE.get(handle);

  return {
    handle,
    title: page.title ?? definition?.title ?? startCase(handle),
    body: await readText(path.join(resourceDir, 'body.html')),
    isPublished: page.isPublished ?? true,
    templateSuffix: normalizeNullableString(page.templateSuffix),
    raw: {
      page,
      syncState: await readOptionalJson(
        path.join(resourceDir, 'sync-state.json'),
      ),
      sourceMd: await readOptionalText(path.join(resourceDir, 'source.md')),
    },
  };
}

function compareStoreCatalogs(localCatalog, remoteCatalog) {
  const localPolicies = new Map(
    [...localCatalog.policies.entries()].map(([handle, entry]) => [
      handle,
      normalizeLocalPolicy(entry),
    ]),
  );
  const localPages = new Map(
    [...localCatalog.pages.entries()].map(([handle, entry]) => [
      handle,
      normalizeLocalPage(entry),
    ]),
  );
  const remotePolicies = new Map(
    remoteCatalog.policies.map((entry) => [
      entry.handle,
      normalizeRemotePolicy(entry),
    ]),
  );
  const remotePages = new Map(
    remoteCatalog.pages.map((entry) => [
      entry.handle,
      normalizeRemotePage(entry),
    ]),
  );
  const handles = new Set();

  if (remoteCatalog.capabilities.policies !== false) {
    for (const handle of localPolicies.keys()) handles.add(handle);
    for (const handle of remotePolicies.keys()) handles.add(handle);
  }

  if (remoteCatalog.capabilities.pages !== false) {
    for (const handle of localPages.keys()) handles.add(handle);
    for (const handle of remotePages.keys()) handles.add(handle);
  }

  const entries = [];

  for (const handle of [...handles].sort()) {
    const localPolicy = localCatalog.policies.get(handle);
    const comparableLocalPolicy = localPolicies.get(handle);
    const remotePolicy = remotePolicies.get(handle);
    const localPage = localCatalog.pages.get(handle);
    const comparableLocalPage = localPages.get(handle);
    const remotePage = remotePages.get(handle);

    if (localPolicy || remotePolicy) {
      compareResource(
        entries,
        handle,
        'policy',
        comparableLocalPolicy,
        remotePolicy,
      );
      continue;
    }

    compareResource(entries, handle, 'page', comparableLocalPage, remotePage);
  }

  return {
    handleCount: handles.size,
    entries,
  };
}

function compareResource(differences, handle, field, localEntry, remoteEntry) {
  if (!localEntry && remoteEntry) {
    differences.push({handle, field, reason: 'missing local store files'});
    return;
  }

  if (localEntry && !remoteEntry) {
    differences.push({handle, field, reason: 'missing in Shopify'});
    return;
  }

  if (stableStringify(localEntry) !== stableStringify(remoteEntry)) {
    differences.push({handle, field, reason: 'content differs'});
  }
}

function buildPushPlan(localCatalog, remoteCatalog, requestedHandles) {
  const remotePolicies = new Map(
    remoteCatalog.policies.map((entry) => [entry.handle, entry]),
  );
  const remotePages = new Map(
    remoteCatalog.pages.map((entry) => [entry.handle, entry]),
  );
  const items = [];
  const errors = [];
  const warnings = [...remoteCatalog.warnings];
  const explicitPageHandles = filterPageHandles(requestedHandles ?? []);
  const explicitPolicyHandles = filterPolicyHandles(requestedHandles ?? []);

  if (
    remoteCatalog.capabilities.policies === false &&
    explicitPolicyHandles.length > 0
  ) {
    errors.push(
      'Policy sync was explicitly requested, but Admin legal policy access is unavailable.',
    );
  }

  if (
    remoteCatalog.capabilities.pages === false &&
    explicitPageHandles.length > 0
  ) {
    errors.push(
      'Page sync was explicitly requested, but Admin page access is unavailable.',
    );
  }

  if (remoteCatalog.capabilities.policies !== false) {
    for (const [handle, localEntry] of localCatalog.policies) {
      const definition = POLICY_BY_HANDLE.get(handle);
      if (!definition) {
        errors.push(`Unknown policy handle: ${handle}`);
        continue;
      }

      const remoteEntry = remotePolicies.get(handle) ?? null;
      const changed =
        stableStringify(normalizeLocalPolicy(localEntry)) !==
        stableStringify(normalizeRemotePolicy(remoteEntry));

      items.push({
        kind: 'policy',
        handle,
        changed,
        localEntry,
        remoteEntry,
        type: definition.type,
      });
    }
  }

  if (remoteCatalog.capabilities.pages !== false) {
    for (const [handle, localEntry] of localCatalog.pages) {
      const remoteEntry = remotePages.get(handle) ?? null;
      const changed =
        stableStringify(normalizeLocalPage(localEntry)) !==
        stableStringify(normalizeRemotePage(remoteEntry));

      items.push({
        kind: 'page',
        handle,
        changed,
        localEntry,
        remoteEntry,
        create: remoteEntry === null,
      });
    }
  }

  return {
    items,
    errors,
    warnings,
    summary: {
      handleCount: items.length,
      actionCount: items.filter((item) => item.changed).length,
    },
  };
}

function printPushPlan(plan, apply) {
  console.log(apply ? 'Store push apply plan:' : 'Store push dry-run plan:');
  console.log(`Handles scanned: ${plan.summary.handleCount}`);
  console.log(`Actions planned: ${plan.summary.actionCount}`);

  for (const warning of plan.warnings ?? []) {
    console.log(`Warning: ${warning}`);
  }

  if (plan.errors.length > 0) {
    console.log('Errors:');
    for (const error of plan.errors) {
      console.log(`- ${error}`);
    }
  }

  for (const item of plan.items) {
    if (!item.changed) {
      console.log(`- ${item.handle}: no changes`);
      continue;
    }

    if (item.kind === 'policy') {
      console.log(`- ${item.handle}: policy update`);
      continue;
    }

    console.log(
      `- ${item.handle}: ${item.create ? 'page create' : 'page update'}`,
    );
  }
}

async function applyPushPlan(config, plan) {
  const client = createAdminClient(config);
  await client.getAccessToken();

  const changedHandles = [];

  for (const item of plan.items) {
    if (!item.changed) {
      continue;
    }

    if (item.kind === 'policy') {
      console.log(`Applying policy update for ${item.handle}...`);
      await applyPolicyUpdate(client, item.type, item.localEntry.body);
      changedHandles.push(item.handle);
      continue;
    }

    console.log(
      `${item.create ? 'Creating' : 'Updating'} page for ${item.handle}...`,
    );
    await applyPageMutation(client, item.localEntry, item.remoteEntry);
    changedHandles.push(item.handle);
  }

  return changedHandles;
}

async function applyPolicyUpdate(client, type, body) {
  const data = await client.graphql(SHOP_POLICY_UPDATE_MUTATION, {
    shopPolicy: {
      type,
      body: stripTrailingWhitespace(body),
    },
  });

  const payload = data.shopPolicyUpdate;
  if (payload.userErrors?.length > 0) {
    throw new Error(
      payload.userErrors.map((error) => error.message).join(', '),
    );
  }
}

async function applyPageMutation(client, localEntry, remoteEntry) {
  const pageInput = {
    title: localEntry.title,
    handle: localEntry.handle,
    body: stripTrailingWhitespace(localEntry.body),
    isPublished: localEntry.isPublished,
    templateSuffix: localEntry.templateSuffix,
  };

  if (!remoteEntry) {
    const data = await client.graphql(PAGE_CREATE_MUTATION, {page: pageInput});
    const payload = data.pageCreate;
    if (payload.userErrors?.length > 0) {
      throw new Error(
        payload.userErrors.map((error) => error.message).join(', '),
      );
    }
    return;
  }

  const data = await client.graphql(PAGE_UPDATE_MUTATION, {
    id: remoteEntry.id,
    page: {
      ...pageInput,
      redirectNewHandle: true,
    },
  });
  const payload = data.pageUpdate;
  if (payload.userErrors?.length > 0) {
    throw new Error(
      payload.userErrors.map((error) => error.message).join(', '),
    );
  }
}

function normalizeLocalPolicy(localEntry) {
  if (!localEntry) return null;

  return {
    handle: localEntry.handle,
    type: localEntry.type,
    body: normalizeHtml(localEntry.body),
  };
}

function normalizeRemotePolicy(remoteEntry) {
  if (!remoteEntry) return null;

  return {
    handle: remoteEntry.handle,
    type: remoteEntry.type,
    body: normalizeHtml(remoteEntry.body),
  };
}

function normalizeLocalPage(localEntry) {
  if (!localEntry) return null;

  return {
    handle: localEntry.handle,
    title: localEntry.title,
    body: normalizeHtml(localEntry.body),
    isPublished: localEntry.isPublished,
    templateSuffix: normalizeNullableString(localEntry.templateSuffix),
  };
}

function normalizeRemotePage(remoteEntry) {
  if (!remoteEntry) return null;

  return {
    handle: remoteEntry.handle,
    title: remoteEntry.title,
    body: normalizeHtml(remoteEntry.body),
    isPublished: remoteEntry.isPublished,
    templateSuffix: normalizeNullableString(remoteEntry.templateSuffix),
  };
}

async function writeLocalCatalogSummary(outputDir, localCatalog) {
  await writeJson(path.join(outputDir, 'catalog.json'), {
    generatedAt: new Date().toISOString(),
    policyCount: localCatalog.policies.size,
    pageCount: localCatalog.pages.size,
    policies: [...localCatalog.policies.values()].map((entry) => ({
      handle: entry.handle,
      title: entry.title,
      type: entry.type,
    })),
    pages: [...localCatalog.pages.values()].map((entry) => ({
      handle: entry.handle,
      title: entry.title,
    })),
  });
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
    const probePath = path.join(outputDir, '.shopify-store-sync-write-test');
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

async function checkSourceDirectory(sourceDir) {
  if (existsSync(sourceDir)) {
    return {
      label: 'Source directory',
      status: 'ok',
      message: `${sourceDir} exists`,
    };
  }

  return {
    label: 'Source directory',
    status: 'fail',
    message: `${sourceDir} does not exist`,
  };
}

function checkEnvVar(envVar) {
  if (process.env[envVar]) {
    return {label: envVar, status: 'ok', message: 'set'};
  }

  return {label: envVar, status: 'fail', message: 'missing'};
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

function filterPolicyHandles(handles) {
  return dedupe(
    handles.filter((handle) => POLICY_BY_HANDLE.has(handle)),
  ).sort();
}

function filterPageHandles(handles) {
  return dedupe(
    handles.filter((handle) => !POLICY_BY_HANDLE.has(handle)),
  ).sort();
}

function dedupe(values) {
  return [...new Set(values)];
}

async function listSubdirectoryNames(dirPath) {
  if (!existsSync(dirPath)) {
    return [];
  }

  const entries = await readdir(dirPath, {withFileTypes: true});
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
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

async function readOptionalText(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  return readText(filePath);
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function stableStringify(value) {
  return JSON.stringify(value);
}

function normalizeHtml(value) {
  return stripTrailingWhitespace(String(value ?? ''))
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/>\s+</g, '><')
    .trim();
}

function stripTrailingWhitespace(value) {
  return String(value ?? '')
    .replace(/[ \t]+$/gm, '')
    .trimEnd();
}

function normalizeNullableString(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return String(value);
}

function compareByHandle(left, right) {
  return left.handle.localeCompare(right.handle);
}

function startCase(value) {
  return String(value)
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function isAccessDeniedError(error, fieldName) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('access denied') &&
    message.includes(String(fieldName).toLowerCase())
  );
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
