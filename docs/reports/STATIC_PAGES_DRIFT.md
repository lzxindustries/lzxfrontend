# Static Shopify pages vs. Hydrogen (drift check)

A snapshot of **legacy Online Store** body HTML (team, dealers, warranty, and similar) may exist under a local LZX library path, for example `scrape/content/shopify_pages.json`, when you maintain a copy of the asset library.

**What to do**

1. If that JSON exists on your machine, spot-check a few **handles** (e.g. `about-us`, `dealers`, `warranty-repair-return`, `contact-us`) against:
   - The live Shopify **Online Store** theme for marketing truth, and  
   - The routes and copy in this **Remix** app (footer links, policy routes, and custom pages).
2. Prefer **one** owner: either the **theme page** in Shopify or a **Remix** route, not two conflicting bodies for the same user-facing page.
3. If you do not have the library mount, this step is a **manual** Admin review only.

**Completed in repo:** this document records the process; re-run the comparison when you pull a fresh `shopify_pages` scrape or change legal/warranty text.
