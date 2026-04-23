/**
 * Canonical Product Hub tab taxonomy.
 *
 * Single source of truth for tab labels, URL segments, and visibility
 * rules across instruments and modules. Both hub layouts (and any
 * future hub type) build their `HubTab[]` through these helpers so
 * labels, ordering, and inclusion rules stay consistent.
 *
 * ## Tab contract
 *
 * Every tab answers a distinct user question. If a user cannot name
 * what a tab is for, it does not belong in the nav.
 *
 * | Tab        | User question                                    | Content shape                                              |
 * |------------|--------------------------------------------------|------------------------------------------------------------|
 * | Overview   | "What is this product and can I buy it?"         | Hero, gallery, subtitle, buy box, recommended products.    |
 * | Manual     | "How does this work in detail?"                  | Reference documentation rendered from `content/docs/...`.  |
 * | Learn      | "Where do I start with curated lessons?"         | Curated launchpad cards to key doc pages and tutorials.    |
 * | Setup      | "How do I get first signal from this product?"   | First-run prerequisites, signal flow, quick-start steps.   |
 * | Patches    | "What example patches exist for this module?"    | Signal routing recipes and example patches from lzxdb.     |
 * | Videos     | "What video tutorials or demos cover this?"      | Curated and community video embeds.                        |
 * | Downloads  | "What files do I need: firmware, manuals, PDFs?" | Downloadable assets — firmware, PDFs, schematics, images.  |
 * | Specs      | "What are the electrical and mechanical specs?"  | Connectors, controls, features, metafield spec tables.     |
 * | Support    | "I have a problem — what should I do next?"      | FAQ, troubleshooting, forum archive, contact channels.     |
 *
 * ## Naming decisions
 *
 * - The reference-documentation tab is labelled **Manual** in every
 *   hub. This matches the URL segment (`/manual`), the breadcrumb
 *   label used deeper in the doc tree, and the plain-language term
 *   most customers use. The old label "Docs" is reserved for the
 *   site-wide `/docs` content hub, which includes guides, glossary,
 *   and cross-product reference material.
 * - The downloads tab is labelled **Downloads** everywhere. The
 *   legacy "Software & Downloads" variant collapsed into the same
 *   tab.
 * - **Learn** and **Setup** are reserved for product lines that have
 *   curated per-product content. The tab builder hides Learn when
 *   only the generic launchpad cards would render, because those
 *   duplicate the rest of the nav.
 *
 * Adding a new tab: start here. Route file changes without a matching
 * update to this taxonomy are the anti-pattern.
 */

import type {HubTab} from '~/components/HubNavBar';

export type HubType = 'module' | 'instrument';

export const MANUAL_LABEL = 'Manual';
export const DOWNLOADS_LABEL = 'Downloads';

export interface InstrumentTabContext {
  slug: string;
  hasManual: boolean;
  hasCuratedLearn: boolean;
  hasSetupContent: boolean;
  videoCount: number;
  downloadCount: number;
  hasSpecs: boolean;
}

export interface ModuleTabContext {
  slug: string;
  hasLocalDocumentation: boolean;
  patchCount: number;
  videoCount: number;
  downloadCount: number;
  hasSpecs: boolean;
}

/**
 * Returns the ordered set of tabs for an instrument hub, applying
 * visibility rules defined in the tab contract above.
 */
export function buildInstrumentTabs(ctx: InstrumentTabContext): HubTab[] {
  const base = `/instruments/${ctx.slug}`;

  return [
    {label: 'Overview', to: base},
    {label: MANUAL_LABEL, to: `${base}/manual`, hidden: !ctx.hasManual},
    {label: 'Learn', to: `${base}/learn`, hidden: !ctx.hasCuratedLearn},
    {label: 'Setup', to: `${base}/setup`, hidden: !ctx.hasSetupContent},
    {label: 'Videos', to: `${base}/videos`, hidden: ctx.videoCount === 0},
    {
      label: DOWNLOADS_LABEL,
      to: `${base}/downloads`,
      hidden: ctx.downloadCount === 0,
    },
    {label: 'Specs', to: `${base}/specs`, hidden: !ctx.hasSpecs},
    {label: 'Support', to: `${base}/support`},
  ];
}

/**
 * Returns the ordered set of tabs for a module hub. Modules do not
 * currently surface Learn or Setup tabs — those content shapes are
 * instrument-specific. Patches takes the educational slot for modules.
 */
export function buildModuleTabs(ctx: ModuleTabContext): HubTab[] {
  const base = `/modules/${ctx.slug}`;

  return [
    {label: 'Overview', to: base},
    {
      label: MANUAL_LABEL,
      to: `${base}/manual`,
      hidden: !ctx.hasLocalDocumentation,
    },
    {
      label: 'Patches',
      to: `${base}/patches`,
      hidden: ctx.patchCount === 0,
    },
    {label: 'Videos', to: `${base}/videos`, hidden: ctx.videoCount === 0},
    {
      label: DOWNLOADS_LABEL,
      to: `${base}/downloads`,
      hidden: ctx.downloadCount === 0,
    },
    {label: 'Specs', to: `${base}/specs`, hidden: !ctx.hasSpecs},
    {label: 'Support', to: `${base}/support`},
  ];
}
