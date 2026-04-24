import {useMemo, useState} from 'react';
import {useLoaderData, Link} from '@remix-run/react';
import type {SeoConfig} from '@shopify/hydrogen';
import type {LoaderFunctionArgs, MetaArgs} from '@shopify/remix-oxygen';
import {json} from '@shopify/remix-oxygen';

import {CACHE_LONG, routeHeaders} from '~/data/cache';
import {Breadcrumbs} from '~/components/Breadcrumbs';
import {
  getAllModuleSpecRows,
  type ModuleSpecRow,
  type ModuleStatus,
} from '~/data/module-specs';
import {seoMetaFromLoaderData} from '~/lib/seo-meta-route';

export const headers = routeHeaders;

// Series ordering and labels mirror ($lang).modules._index.tsx so the two
// pages present the catalog in a consistent order.
const ACTIVE_SERIES_ORDER = ['pseries', 'gen3', 'castle'];
const LEGACY_SERIES_ORDER = [
  'orion',
  'expedition',
  'cadet',
  'visionary',
  'legacy',
  'other',
];
const SERIES_ORDER = [...ACTIVE_SERIES_ORDER, ...LEGACY_SERIES_ORDER];

const SERIES_LABELS: Record<string, string> = {
  pseries: 'P',
  gen3: 'Gen3',
  orion: 'Orion',
  visionary: 'Visionary',
  castle: 'Castle',
  cadet: 'Cadet',
  expedition: 'Expedition',
  legacy: 'Legacy',
  other: 'Other',
};

function seriesRank(key: string | null): number {
  if (!key) return SERIES_ORDER.length + 1;
  const idx = SERIES_ORDER.indexOf(key);
  return idx === -1 ? SERIES_ORDER.length : idx;
}

function seriesLabel(key: string | null): string {
  if (!key) return '—';
  return SERIES_LABELS[key] ?? key;
}

export async function loader({request}: LoaderFunctionArgs) {
  const rows = getAllModuleSpecRows();

  // Default order: Active first, then Legacy, by series rank, then by name.
  const sortedRows = [...rows].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'Active' ? -1 : 1;
    const sa = seriesRank(a.series);
    const sb = seriesRank(b.series);
    if (sa !== sb) return sa - sb;
    return a.name.localeCompare(b.name);
  });

  const seo: SeoConfig = {
    title: 'All Modules — Specifications',
    titleTemplate: '%s | LZX Industries',
    description:
      'Master comparison table of every LZX video synthesis module: width, depth, power draw, sync I/O, and series.',
    url: request.url,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Module Specifications',
    },
  };

  return json(
    {rows: sortedRows, seo},
    {headers: {'Cache-Control': CACHE_LONG}},
  );
}

export const meta = ({data}: MetaArgs<typeof loader>) => {
  return seoMetaFromLoaderData(data);
};

// --- UI ---

type SortKey =
  | 'name'
  | 'company'
  | 'status'
  | 'series'
  | 'hp'
  | 'depthMm'
  | 'posMa'
  | 'negMa'
  | 'powerEntry'
  | 'videoSyncIO'
  | 'isSyncGenerator'
  | 'releaseYear'
  | 'discontinuedYear';

type SortDir = 'asc' | 'desc';

type StatusFilter = 'all' | ModuleStatus;

const COLUMNS: {key: SortKey; label: string; numeric?: boolean}[] = [
  {key: 'company', label: 'Brand'},
  {key: 'name', label: 'Name'},
  {key: 'status', label: 'Status'},
  {key: 'series', label: 'Series'},
  {key: 'hp', label: 'HP', numeric: true},
  {key: 'depthMm', label: 'Depth (mm)', numeric: true},
  {key: 'posMa', label: '+12V mA', numeric: true},
  {key: 'negMa', label: '−12V mA', numeric: true},
  {key: 'powerEntry', label: 'Power'},
  {key: 'videoSyncIO', label: 'Video Sync I/O'},
  {key: 'isSyncGenerator', label: 'Sync Gen'},
  {key: 'releaseYear', label: 'Released', numeric: true},
  {key: 'discontinuedYear', label: 'Discontinued', numeric: true},
];

function compareRows(a: ModuleSpecRow, b: ModuleSpecRow, key: SortKey): number {
  switch (key) {
    case 'series': {
      const ra = seriesRank(a.series);
      const rb = seriesRank(b.series);
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name);
    }
    case 'isSyncGenerator': {
      const av = a.isSyncGenerator ? 1 : 0;
      const bv = b.isSyncGenerator ? 1 : 0;
      return av - bv;
    }
    case 'hp':
    case 'depthMm':
    case 'posMa':
    case 'negMa':
    case 'releaseYear':
    case 'discontinuedYear': {
      const av = a[key];
      const bv = b[key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return av - bv;
    }
    default: {
      const av = String((a as unknown as Record<string, unknown>)[key] ?? '');
      const bv = String((b as unknown as Record<string, unknown>)[key] ?? '');
      return av.localeCompare(bv);
    }
  }
}

function nameLink(row: ModuleSpecRow) {
  const target = row.externalUrl ?? `/modules/${row.slug}`;
  const isExternal = !!row.externalUrl;
  return (
    <Link
      to={target}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="link link-primary"
    >
      {row.name}
    </Link>
  );
}

function fmtNum(n: number | null, suffix = ''): string {
  if (n == null) return '—';
  return `${n}${suffix}`;
}

function fmtBool(b: boolean): string {
  return b ? 'Yes' : '—';
}

export default function ModuleSpecsPage() {
  const {rows} = useLoaderData<typeof loader>();

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [seriesFilter, setSeriesFilter] = useState<Set<string>>(new Set());
  const [syncGenOnly, setSyncGenOnly] = useState(false);
  const [search, setSearch] = useState('');

  const allSeries = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) if (r.series) set.add(r.series);
    return [...set].sort((a, b) => seriesRank(a) - seriesRank(b));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (seriesFilter.size > 0 && (!r.series || !seriesFilter.has(r.series)))
        return false;
      if (syncGenOnly && !r.isSyncGenerator) return false;
      if (q) {
        const haystack = `${r.name} ${r.subtitle ?? ''} ${
          r.company
        }`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [rows, statusFilter, seriesFilter, syncGenOnly, search]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => compareRows(a, b, sortKey));
    if (sortDir === 'desc') copy.reverse();
    return copy;
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleSeries = (s: string) => {
    setSeriesFilter((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setSeriesFilter(new Set());
    setSyncGenOnly(false);
    setSearch('');
  };

  const totalCount = rows.length;
  const visibleCount = sorted.length;

  return (
    <>
      <Breadcrumbs
        items={[
          {label: 'Home', to: '/'},
          {label: 'Modules', to: '/modules'},
          {label: 'Specs'},
        ]}
      />
      <div className="px-6 pb-16 md:px-10 lg:px-12 max-w-screen-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Module Specifications</h1>
        <p className="text-base opacity-70 mb-6">
          Master comparison table for every LZX video synthesis module — width,
          depth, power draw, sync I/O, and series. Sort any column or filter to
          narrow down the catalog.
        </p>

        {/* Filter controls */}
        <div className="mb-4 rounded-lg border border-base-300 bg-base-200 p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="form-control">
              <span className="label-text mr-2">Search</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, subtitle, brand…"
                className="input input-sm input-bordered w-64"
              />
            </label>

            <label className="form-control">
              <span className="label-text mr-2">Status</span>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as StatusFilter)
                }
                className="select select-sm select-bordered"
              >
                <option value="all">All</option>
                <option value="Active">Active</option>
                <option value="Legacy">Legacy</option>
              </select>
            </label>

            <label className="label cursor-pointer gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={syncGenOnly}
                onChange={(e) => setSyncGenOnly(e.target.checked)}
              />
              <span className="label-text">Sync generators only</span>
            </label>

            <button
              type="button"
              onClick={clearFilters}
              className="btn btn-ghost btn-sm ml-auto"
            >
              Clear filters
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="label-text mr-1">Series:</span>
            {allSeries.map((s) => {
              const active = seriesFilter.has(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSeries(s)}
                  className={`badge badge-sm cursor-pointer ${
                    active ? 'badge-primary' : 'badge-outline'
                  }`}
                >
                  {seriesLabel(s)}
                </button>
              );
            })}
          </div>

          <div className="text-xs opacity-70">
            Showing {visibleCount} of {totalCount} modules
          </div>
        </div>

        {/* Desktop / tablet table */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-base-300">
          <table className="table table-sm table-zebra">
            <thead className="sticky top-0 bg-base-200 z-10">
              <tr>
                {COLUMNS.map((col) => {
                  const isSorted = sortKey === col.key;
                  const indicator = isSorted
                    ? sortDir === 'asc'
                      ? ' ▲'
                      : ' ▼'
                    : '';
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      className={`whitespace-nowrap cursor-pointer select-none ${
                        col.numeric ? 'text-right' : 'text-left'
                      }`}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      <span className="opacity-60">{indicator}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap">{row.company}</td>
                  <td className="whitespace-nowrap">{nameLink(row)}</td>
                  <td className="whitespace-nowrap">
                    <span
                      className={`badge badge-sm ${
                        row.status === 'Active'
                          ? 'badge-success'
                          : 'badge-ghost'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap">
                    {seriesLabel(row.series)}
                  </td>
                  <td className="text-right">{fmtNum(row.hp)}</td>
                  <td className="text-right">{fmtNum(row.depthMm)}</td>
                  <td className="text-right">{fmtNum(row.posMa)}</td>
                  <td className="text-right">{fmtNum(row.negMa)}</td>
                  <td className="whitespace-nowrap">{row.powerEntry}</td>
                  <td>{row.videoSyncIO}</td>
                  <td>{fmtBool(row.isSyncGenerator)}</td>
                  <td className="text-right">{fmtNum(row.releaseYear)}</td>
                  <td className="text-right">{fmtNum(row.discontinuedYear)}</td>
                </tr>
              ))}
              {sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="text-center py-8 opacity-60"
                  >
                    No modules match the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden flex flex-col gap-3">
          {sorted.map((row) => (
            <div
              key={row.id}
              className="rounded-lg border border-base-300 bg-base-100 p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="font-semibold">{nameLink(row)}</div>
                  <div className="text-xs opacity-70">
                    {row.company} · {seriesLabel(row.series)}
                  </div>
                </div>
                <span
                  className={`badge badge-sm ${
                    row.status === 'Active' ? 'badge-success' : 'badge-ghost'
                  }`}
                >
                  {row.status}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                <dt className="opacity-60">Width</dt>
                <dd>{fmtNum(row.hp, ' HP')}</dd>
                <dt className="opacity-60">Depth</dt>
                <dd>{fmtNum(row.depthMm, ' mm')}</dd>
                <dt className="opacity-60">+12V</dt>
                <dd>{fmtNum(row.posMa, ' mA')}</dd>
                <dt className="opacity-60">−12V</dt>
                <dd>{fmtNum(row.negMa, ' mA')}</dd>
                <dt className="opacity-60">Power</dt>
                <dd>{row.powerEntry}</dd>
                <dt className="opacity-60">Sync I/O</dt>
                <dd>{row.videoSyncIO}</dd>
                <dt className="opacity-60">Sync gen</dt>
                <dd>{fmtBool(row.isSyncGenerator)}</dd>
                {row.releaseYear != null ? (
                  <>
                    <dt className="opacity-60">Released</dt>
                    <dd>{row.releaseYear}</dd>
                  </>
                ) : null}
                {row.discontinuedYear != null ? (
                  <>
                    <dt className="opacity-60">Discontinued</dt>
                    <dd>{row.discontinuedYear}</dd>
                  </>
                ) : null}
              </dl>
            </div>
          ))}
          {sorted.length === 0 ? (
            <div className="text-center py-8 opacity-60">
              No modules match the current filters.
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
