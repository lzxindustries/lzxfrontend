# SOP: Mining forum exports for product content

Forum and scrape data under the local LZX library (e.g. `scrape/community/topics/`) are **research inputs**, not paste-ready storefront copy.

## Do

1. **Search** the export (or live forum) for a **product name**, slug, or failure mode (`sync`, `firmware`, `no output`). Prefer patterns that show up **more than once** for the same product.
2. For each **repeatable** issue, decide:
   - **Short triage** → add or extend [`content/support/<slug>.md`](../../content/support) FAQ front matter (per [Support README](../../content/support/README.md)).
   - **Definitive procedure** → add a **Manual** section under `content/docs/modules/` or `content/docs/instruments/`, then link from a one-line FAQ answer.
3. **Rewrite** in the [writing style guide](../../content/docs/WRITING_STYLE_GUIDE.md) voice. Do not quote long forum posts verbatim in the storefront.
4. **Link** the canonical community thread as “more discussion” when it adds context, not as the only answer.

## Do not

- Bulk-import thread bodies into **Shopify product descriptions** or **Overview** HTML.
- Add **support .md** stubs with no real FAQ or setup prerequisites; empty files do not help users.

## Suggested command-line workflow (WSL / repo root)

```bash
# Example: topics mentioning a product slug in the library path (adjust to your mount)
rg -l "tbc2" /mnt/e/lfs/library/scrape/community/topics/ 2>/dev/null | head
```

Triage the hits, then author in-repo markdown and use `yarn shopify:sync:pull` / `yarn catalog:bootstrap` when changing Shopify.
