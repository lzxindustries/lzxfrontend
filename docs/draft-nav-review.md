# Draft Nav Items — Review Before Re-Integration

These navigation items have been removed from public-facing menus and the homepage. Each needs content and/or data review before being restored.

## ~~Products > All Instruments (`/instruments`)~~ ✅ Re-integrated

- **Re-integrated:** Added `{label: 'All Instruments', to: '/instruments'}` to Products group in `MegaMenu.tsx`.

## ~~Products > Starter Systems (`/systems`)~~ ✅ Re-integrated

- **Re-integrated:** Added `{label: 'Systems', to: '/systems'}` to Products group in `MegaMenu.tsx`.

## ~~Products > B-Stock (`/b-stock`)~~ ✅ Re-integrated

- **Re-integrated:** Added `{label: 'B-Stock', to: '/b-stock'}` to Products group in `MegaMenu.tsx`.

## ~~Support > Glossary (`/glossary`)~~ ✅ Re-integrated

- **Re-integrated:** Added `{label: 'Glossary', to: '/glossary'}` to Support group in `MegaMenu.tsx`.

## ~~Community > Artists (`/artists`)~~ ✅ Re-integrated

- **Re-integrated:** Moved to About group as `{label: 'Artists', to: '/artists'}` in `MegaMenu.tsx`.

## ~~About > Legacy Modules (`/legacy`)~~ ✅ Re-integrated

- **Re-integrated:** Added `{label: 'Legacy Modules', to: '/legacy'}` to About group in `MegaMenu.tsx`.

---

## How to re-integrate

1. Edit `app/components/MegaMenu.tsx` — add the item back to the appropriate `MENU_GROUPS` entry.
2. If the item had homepage visibility (cards, link rows, CTA buttons), restore those in `app/routes/($lang)._index.tsx`.
3. Run `yarn test` and `yarn run typecheck` to verify.
4. Visually confirm the page loads correctly at the route before pushing.
