---
draft: true
title: 'Product hub — editing guide'
description: 'Internal reference for tab naming, support files, and Learn cards so the storefront stays one coherent information system.'
sidebar_position: 999
---

# Product hub — editing guide

This page is for **content and web contributors** who touch product hubs
(`/modules/...`, `/instruments/...`), support snippets, or global docs. It
does not replace the [Writing Style Guide](./WRITING_STYLE_GUIDE.md); it
describes *where* copy belongs, not *how* to phrase every sentence.

## Two different “doc” words

- **Site Documentation** (breadcrumb **Docs**, URL `/docs/...`) — cross-product
  guides, glossary, case power, and the technical library. Docusaurus-style
  sidebars, search, and `DocLayout`.
- **Product Manual** (hub tab **Manual**, URL `.../manual/...`) — per-product
  reference drawn from `content/docs/modules/*.md` and
  `content/docs/instruments/...`. Same markdown pipeline in many cases, but
  different navigation: the hub nav is the primary frame, not the global docs
  chrome.

Never label a hub tab “Docs” — that word is reserved for the `/docs` area so
customers are not sent to two different mental models for the same word.

## Tabs (see `app/data/hub-tabs.ts`)

The tab contract is documented in code: each tab must answer a **different**
user question. In short:

| Tab        | Role |
|------------|------|
| Overview   | Buy box, gallery, and product story. |
| Manual     | Full reference. |
| Learn      | **Curated** cards only. Shown for instruments with a hand-authored card list — not a second copy of the default hub links. |
| Setup      | First-run prerequisites, signal-flow, firmware entry points. Hidden when there is nothing beyond generic text. |
| Patches    | Module-only, recipe-style content from the database. |
| Videos / Downloads / Specs / Support | As named; Support combines FAQ, forum, troubleshooting, contact. |

If you add a new hub tab in code, start by updating the taxonomy comment in
`hub-tabs.ts` so the next editor does not fork the product IA.

## Per-product support (`content/support/<slug>.md`)

- File name = **canonical slug** from `app/data/product-slugs.ts` (not the
  Shopify handle).
- `SUPPORT_MANIFEST` lists product slugs for related products and some flags;
  optional FAQ and prerequisites come **only** from the markdown front matter.
- Do **not** add empty files. If you have no new FAQ and no real prerequisites,
  leave the file out. See `content/support/README.md`.
- Long answers belong in the **Manual**, not the FAQ. Point to the right
  heading with a normal markdown link.

## Canonical URLs (redirects, bookmarks)

- Onboarding: **`/getting-started/...`** is canonical; **`/docs/getting-started/...`**
  redirects with `301`.
- Glossary: **`/docs/guides/glossary`** is canonical; **`/glossary`** is a
  legacy `301` only.

If you add cross-links in markdown, prefer the canonical path so you do not
split analytics and SEO across duplicates.

## Learn tab curation

Instrument learn cards are defined in `app/data/instrument-learn-cards.ts`. Add
a slug-keyed set only when you have a **deliberate learning path** (e.g. quick
start → programs → deep references). Generic cards that only repeat
Overview / Manual / Videos / Patches are intentionally **not** activated at
the hub level — the nav already does that job.

## Checklist before you ship

- [ ] Copy matches voice in `content/docs/WRITING_STYLE_GUIDE.md` (we / you, no
      first-person *I*, no marketing filler).
- [ ] The destination URL is the **canonical** one (hubs, docs, or support).
- [ ] You did not duplicate a full manual section inside FAQ or support body.
- [ ] `draft: true` in front matter if the page is not ready for production
      search and sitemaps (see `app/lib/content.server.ts`).

When in doubt, leave the file out and open a thread in design or engineering
so we do not accrue “maybe” copy on the public site.
