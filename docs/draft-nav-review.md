# Draft Nav Items — Review Before Re-Integration

These navigation items have been removed from public-facing menus and the homepage. Each needs content and/or data review before being restored.

## Products > All Instruments (`/instruments`)

- **Route:** `app/routes/($lang).instruments._index.tsx`
- **Current state:** Lists all instruments. Only Videomancer is actively linked from Products menu.
- **Review needed:**
  - Confirm all instrument entries have complete product data in Shopify (images, descriptions, pricing).
  - Verify that discontinued instruments (Vidiot, Chromagnon, etc.) display correctly with "Discontinued" badges and don't show add-to-cart.
  - Decide whether this page should exist separately from the Videomancer product link or if it should only appear once there are multiple active instruments.
- **Re-integration:** Add `{label: 'All Instruments', to: '/instruments'}` to Products group in `app/components/MegaMenu.tsx`. Optionally restore the "Instruments" card on the homepage product categories section.

## Products > Starter Systems (`/systems`)

- **Route:** `app/routes/($lang).systems.tsx`
- **Current state:** Shows 3 curated systems (Double Vision, Colorizer, Studio Rack) with module suggestions.
- **Review needed:**
  - Confirm all modules referenced in each system are currently in stock or available to order.
  - Verify links to module pages, docs, patches, and shop are valid.
  - Confirm pricing/availability expectations are accurate.
  - Consider whether system configurations need updating for current product line.
- **Re-integration:** Add `{label: 'Starter Systems', to: '/systems'}` to Products group in `MegaMenu.tsx`. Restore "Starter Systems" button in the Getting Started CTA section on the homepage.

## Products > B-Stock (`/b-stock`)

- **Route:** `app/routes/($lang).b-stock.tsx` (redirects to `/collections/b-stock`)
- **Current state:** Redirects to a Shopify collection. Depends on the `b-stock` collection existing and having products.
- **Review needed:**
  - Confirm the `b-stock` Shopify collection exists and is populated.
  - Verify the redirect resolves to a page with actual products (not an empty collection).
  - Decide on copy/policy for B-stock items (warranty, condition descriptions).
- **Re-integration:** Add `{label: 'B-Stock', to: '/b-stock'}` to Products group in `MegaMenu.tsx`. Optionally restore B-Stock/Legacy link row below catalog grid on homepage.

## Support > Glossary (`/glossary`)

- **Route:** `app/routes/($lang).glossary.tsx` (or inline content)
- **Data source:** `db/lzxdb.GlossaryTerm.json` + `db/lzxdb.GlossaryDefinition.json`
- **Current state:** Glossary of video synthesis terms.
- **Review needed:**
  - Audit glossary entries for completeness and accuracy — are all Gen3 / Videomancer-era terms included?
  - Check for broken or missing definitions in the lzxdb data.
  - Confirm the page renders correctly and search/filter works if present.
- **Re-integration:** Add `{label: 'Glossary', to: '/glossary'}` to Support group in `MegaMenu.tsx`.

## Community > Artists (`/artists`)

- **Route:** `app/routes/($lang).artists.tsx` or similar
- **Data source:** `db/lzxdb.Artist.json`
- **Current state:** Lists artists creating with LZX instruments.
- **Review needed:**
  - Verify artist data is current — are all listed artists still active/relevant?
  - Confirm artist images, bios, and links are valid (no broken URLs or missing media).
  - Check whether artist permissions/consent for listing are up to date.
  - Decide if the page needs curation or reorganization before public visibility.
- **Re-integration:** Add `{label: 'Artists', to: '/artists'}` to Community group in `MegaMenu.tsx`. Restore Artists card in the Community section on the homepage.

## About > Legacy Modules (`/legacy`)

- **Route:** `app/routes/($lang).legacy.tsx`
- **Current state:** Shows discontinued/hidden modules with image tiles, links to individual module pages.
- **Review needed:**
  - Confirm all legacy module pages load correctly (no 404s or missing data).
  - Verify that legacy modules with `is_hidden: true` render properly with appropriate "Discontinued" messaging.
  - Ensure no legacy modules are incorrectly marked (active products showing as legacy, or vice versa).
  - Check that documentation/manual links for legacy modules still work.
- **Re-integration:** Add `{label: 'Legacy Modules', to: '/legacy'}` to About group in `MegaMenu.tsx`. Optionally restore legacy link on homepage.

---

## How to re-integrate

1. Edit `app/components/MegaMenu.tsx` — add the item back to the appropriate `MENU_GROUPS` entry.
2. If the item had homepage visibility (cards, link rows, CTA buttons), restore those in `app/routes/($lang)._index.tsx`.
3. Run `yarn test` and `yarn run typecheck` to verify.
4. Visually confirm the page loads correctly at the route before pushing.
