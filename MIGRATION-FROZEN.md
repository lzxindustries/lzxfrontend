# Repository frozen — storefront absorbed into the monorepo

**Status:** Archived · read-only · **2026-06-04**

The Hydrogen storefront, catalog data, and Oxygen deploy pipeline now live in the private monorepo:

**https://github.com/lzxindustries/lzxindustries**

| Former path here | Authoritative location |
|------------------|------------------------|
| App source | `software/web/storefront/` |
| `db/` catalog | `data/catalog/`, `data/content/`, `data/sales/` |
| Oxygen CI deploy | `.github/workflows/storefront-deploy.yml` |
| Forum S3 verify | Same workflow (secrets on monorepo + this repo legacy) |

**Do not commit or open PRs here.** Edit the monorepo only.

Rollback snapshot: git tag `pre-migration-2026-06-03` on `main`.

Docs: `docs/monorepo-consolidation/14-publishing-and-decommission.md` in the monorepo.
