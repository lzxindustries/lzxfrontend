# Static Shopify pages vs. Hydrogen (drift check)

## Current ownership

Legacy Online Store pages are **all** either owned by this repo or
intentionally retired. The table below records where each user-facing
page lives today so a casual audit of the live storefront doesn't
resurrect a Shopify-theme duplicate.

| Page               | Owner                                 | Source                                                                                            |
| ------------------ | ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Shipping policy    | Remix (`/policies/shipping-policy`)   | [`policies/shipping-policy.html`](../../policies/shipping-policy.html)                            |
| Refund policy      | Remix (`/policies/refund-policy`)     | [`policies/refund-policy.html`](../../policies/refund-policy.html)                                |
| Terms of service   | Remix (`/policies/terms-of-service`)  | [`policies/terms-of-service.html`](../../policies/terms-of-service.html) (includes warranty text) |
| Privacy policy     | Remix (`/policies/privacy-policy`)    | [`policies/privacy-policy.html`](../../policies/privacy-policy.html)                              |
| Contact            | Remix (`/policies/contact-information`) | [`policies/contact-information.html`](../../policies/contact-information.html)                 |
| Legal notice       | Remix (`/policies/legal-notice`)      | [`policies/legal-notice.html`](../../policies/legal-notice.html)                                  |
| About              | Remix (`/about`)                      | [`content/pages/about.md`](../../content/pages/about.md)                                          |
| Artists            | Remix (`/artists`)                    | `app/routes/($lang).artists.tsx`                                                                  |
| Warranty           | Section of Terms of Service           | `policies/terms-of-service.html` (`#warranty` anchor), linked from the footer                     |
| Dealers / Team     | Retired                               | No Remix route; removed from Shopify theme navigation                                             |

The `policies/*.html` files are the canonical source for the four
standard Shopify policy slots and are pasted into Shopify admin when
they change; `app/data/policies.server.ts` reads the same files so
`/policies/<handle>` renders without a Storefront API round-trip.

## When to re-run this check

Re-run this check whenever:

- Legal or marketing copy changes on Shopify or in `policies/`.
- A new page is added to the Shopify theme navigation.
- A new Remix route is added under `app/routes/` that would shadow an
  existing Shopify page.

If you maintain a local snapshot of the Shopify Online Store bodies
(for example at `scrape/content/shopify_pages.json`), spot-check a few
handles (`about-us`, `dealers`, `warranty-repair-return`,
`contact-us`) against both the theme admin and the table above. Prefer
one owner per user-facing page; if the theme has a body that also
exists as a Remix route, retire the theme body rather than maintaining
both.

Without the local library mount this step is a manual Admin review.
