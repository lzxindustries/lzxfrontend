# docs.lzxindustries.net → lzxindustries.net Migration Plan

All content from `docs.lzxindustries.net` (Docusaurus) has been migrated to `lzxindustries.net` (Hydrogen/Oxygen). This document covers phasing out the old subdomain so all URLs forward correctly.

## Current State

- **Old site**: `docs.lzxindustries.net` — Docusaurus, still live on its original host
- **New site**: `lzxindustries.net` — Shopify Hydrogen on Oxygen (storefront ID `950295`)
- **URL structure**: Paths are identical between old and new (`/docs/modules/dsg3`, `/blog/arcs-and-anvils`, etc.)
- **Redirect code**: `server.ts` already contains a 301 redirect that swaps the hostname and remaps Docusaurus-specific paths
- **131 URLs** in the old sitemap (blog posts, docs, tag pages, category pages)

### Docusaurus-specific paths with no direct equivalent

These are remapped in `server.ts` before the hostname redirect:

| Old path                        | Redirects to                                |
| ------------------------------- | ------------------------------------------- |
| `/blog/archive`                 | `/blog`                                     |
| `/blog/authors`                 | `/blog`                                     |
| `/docs/category/program-guides` | `/docs`                                     |
| `/docs/category/videomancer`    | `/docs/instruments/videomancer/quick-start` |

All other paths (docs, blog posts, blog tag pages) map 1:1.

---

## Phase 1 — Pre-flight

### 1.1 Verify redirects locally

```bash
yarn dev
# In another terminal:
curl -I -H "Host: docs.lzxindustries.net" http://127.0.0.1:3000/docs/modules/dsg3
# Expect: 301 → https://lzxindustries.net/docs/modules/dsg3

curl -I -H "Host: docs.lzxindustries.net" http://127.0.0.1:3000/blog/archive
# Expect: 301 → https://lzxindustries.net/blog

curl -I -H "Host: docs.lzxindustries.net" http://127.0.0.1:3000/docs/category/videomancer
# Expect: 301 → https://lzxindustries.net/docs/instruments/videomancer/quick-start
```

### 1.2 Identify current docs hosting

Run `dig docs.lzxindustries.net` or check DNS dashboard. Note the current provider (Vercel, Netlify, Cloudflare Pages, etc.) so it can be decommissioned later.

### 1.3 Deploy redirect code

The redirect logic is already in `server.ts`. Push to `main` so it's live on Oxygen before flipping DNS:

```bash
git push origin main
```

Wait for GitHub Actions (`oxygen-deployment-950295.yml`) to complete.

---

## Phase 2 — Add custom domain to Shopify Oxygen

### 2.1 Add domain in Shopify Admin

1. Go to **Shopify Admin → Settings → Domains** (or **Sales channels → Hydrogen → Storefront settings**)
2. Click **Connect existing domain** or **Add domain**
3. Enter `docs.lzxindustries.net`
4. Note the CNAME target Shopify provides (e.g., `shops.myshopify.com` or an Oxygen-specific endpoint)

### 2.2 Update DNS

In the DNS provider (likely Cloudflare):

1. Find the existing DNS record for `docs` subdomain
2. Change it to a **CNAME** pointing to the target from step 2.1
3. If using Cloudflare DNS proxy (orange cloud): keep it enabled, set SSL mode to **Full (strict)** to avoid redirect loops
4. Set TTL low during migration (1 min or Auto), increase after verification

### 2.3 SSL/TLS

- Shopify Oxygen auto-provisions SSL for custom domains
- If Cloudflare proxy is enabled, SSL mode **must** be Full (strict)
- Allow a few minutes for certificate provisioning

---

## Phase 3 — Verify (within 1 hour of DNS change)

### 3.1 Test redirect paths

```bash
# Normal docs path
curl -I https://docs.lzxindustries.net/docs/modules/dsg3
# Expect: 301 → https://lzxindustries.net/docs/modules/dsg3

# Docusaurus-specific path
curl -I https://docs.lzxindustries.net/blog/archive
# Expect: 301 → https://lzxindustries.net/blog

# Root
curl -I https://docs.lzxindustries.net/
# Expect: 301 → https://lzxindustries.net/

# Blog post
curl -I https://docs.lzxindustries.net/blog/arcs-and-anvils
# Expect: 301 → https://lzxindustries.net/blog/arcs-and-anvils

# Static asset from old site
curl -I https://docs.lzxindustries.net/img/some-image.png
# Expect: 301 (not 404)
```

### 3.2 Check for redirect loops

Open `https://docs.lzxindustries.net` in a browser. Should land on `https://lzxindustries.net/` with no ERR_TOO_MANY_REDIRECTS. If there's a loop, check Cloudflare SSL mode.

---

## Phase 4 — SEO migration (within 1 week)

### 4.1 Google Search Console

1. Verify `docs.lzxindustries.net` as a property (if not already)
2. Verify `lzxindustries.net` as a property (if not already)
3. On the `docs.lzxindustries.net` property, go to **Settings → Change of Address** and indicate it moved to `lzxindustries.net`
4. Submit `/sitemap.xml` on the `lzxindustries.net` property

### 4.2 Update external references

Update links you control to point to `lzxindustries.net`:

- GitHub READMEs (lzxindustries repos)
- npm packages
- Social media bios
- YouTube video descriptions
- Forum signatures / pinned posts

Redirects handle old links, but direct links are better for SEO.

### 4.3 Monitor 404s

Check Google Search Console → Pages for 404s originating from the old domain. Add path remaps to the `docusaurusRedirects` map in `server.ts` as needed.

---

## Phase 5 — Decommission old host (2–4 weeks after DNS flip)

Once DNS points to Oxygen, the old Docusaurus deployment is unreachable:

1. **Delete the old deployment** on its host (Vercel project, Netlify site, Cloudflare Pages project, etc.)
2. **Archive or delete the old Docusaurus repo** if separate from this one
3. **Remove CI/CD** for the old site (GitHub Actions workflows, deploy hooks)

---

## Phase 6 — Long-term (6–12 months)

- **Keep the redirect permanently** — it's zero-cost in `server.ts` and DNS
- After 6 months, check Google Search Console: old domain's indexed pages should have migrated
- No reason to remove the subdomain; permanent redirects are good internet citizenship

---

## Fallback: If Oxygen won't accept the custom domain

If Shopify/Oxygen restricts custom domains, use a **Cloudflare Redirect Rule** instead:

1. In Cloudflare Dashboard → Rules → Redirect Rules, create a rule:
   - **When**: Hostname equals `docs.lzxindustries.net`
   - **Then**: Dynamic redirect to `concat("https://lzxindustries.net", http.request.uri.path)`, status 301
2. Point `docs` DNS to a dummy A record (`192.0.2.1`) with Cloudflare proxy enabled — the redirect rule fires at the edge before reaching any origin
3. For the Docusaurus-specific path remaps, create additional redirect rules or use a Cloudflare Worker (free tier)

This approach bypasses `server.ts` entirely; Cloudflare handles everything at the edge.

---

## Reference: server.ts redirect code

```typescript
// Redirect legacy docs subdomain to main site
const requestUrl = new URL(request.url);
if (requestUrl.hostname === 'docs.lzxindustries.net') {
  const docusaurusRedirects: Record<string, string> = {
    '/blog/archive': '/blog',
    '/blog/authors': '/blog',
    '/docs/category/program-guides': '/docs',
    '/docs/category/videomancer': '/docs/instruments/videomancer/quick-start',
  };
  const mapped = docusaurusRedirects[requestUrl.pathname];
  if (mapped) {
    requestUrl.pathname = mapped;
  }
  requestUrl.hostname = 'lzxindustries.net';
  return Response.redirect(requestUrl.toString(), 301);
}
```
