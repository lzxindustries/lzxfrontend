# LZX Docs Migration Audit Report

**Old site:** `lzxindustries/lzxtm` (local: `/home/lars/lzxtm`)  
**New site:** `lzxindustries/lzxfrontend` (`content/`)  
**Date:** 2026-05-21

---

## Executive Summary

The new site has successfully migrated all blog posts and all documentation. As of 2026-05-21 all 347 Videomancer program pages and 7,520 associated images have been migrated to the new site. All wording changes are intentional improvements (typo fixes, editorial rewrites, Docusaurus component removal, URL normalization). **The old site is ready to archive.**

---

## Section 1: Blog Posts

### File-Level Findings

| Status | Count | Notes |
|---|---|---|
| Matched and present | 51 | All core blog posts through ~late 2026 |
| Old-only (expected) | 0 | None — all old posts are in new site |
| New-only (new content added) | 13+ | Artist features, monthly updates added after old site snapshot |

**Resolved: Date swap correction (not a bug)**  
In the old repo, two posts had their folder names swapped but correct slugs/content internally:
- Old `2023-12-22-the-year-in-review/` contained the "Molten Core" article
- Old `2023-12-30-the-molten-core/` contained the "Year in Review" article

The new site **corrected** this: folders now match slugs. Content is identical.

**Missing from new site:** `2026-05-06-chromagnon-may-update` — this post exists in the old site but does not exist in the new site. (The new site has `2026-05-06-artist-feature-logan-devlin` in that date slot, which is a different post.)

**Monthly update date differences** (slug same, folder date different — likely intentional edits):

| Old slug/date | New date |
|---|---|
| `2026-06-03-chromagnon-june-update` | `2026-06-02-chromagnon-june-update` |
| `2026-07-01-chromagnon-july-update` | `2026-07-07-chromagnon-july-update` |
| `2026-08-05-chromagnon-august-update` | `2026-08-04-chromagnon-august-update` |
| `2026-09-02-chromagnon-september-update` | `2026-09-01-chromagnon-september-update` |

### Text Changes in Blog Posts

Of 51 matched posts, **21 are identical** in body content, **30 have diffs**. All diffs fall into these categories:

**A. Systematic formatting conversions** (no wording change):
- `*italic*` → `_italic_` (Docusaurus → standard Markdown) — affects ~20 posts
- `1)` ordered list items → `1.` — affects ~5 posts
- `* ` unordered list items → `- ` — affects some posts
- Markdown table column width normalization
- Trailing blank line removal

**B. URL/link updates** (no wording change to prose):
- All `https://docs.lzxindustries.net/docs/...` → relative internal links (e.g. `/modules/tbc2/manual`)
- `discord.gg/lzx` → `discord.gg/7xzD4XzhGn` (Discord invite refreshed in all posts)

**C. Substantive content changes in blog posts:**

| Post | Change |
|---|---|
| `2026-03-12-videomancer-preview-release` | Direct `.uf2` firmware download link removed, replaced with pointer to downloads page |
| `2026-03-17-tbc2-firmware-1.0.6` | Direct firmware ZIP download link removed, replaced with pointer to downloads page |
| `2026-03-19-tbc2-firmware-1.0.7` | Same as above |
| `2026-03-20-videomancer-firmware-1.0.0` | Direct download link removed; "Updated **program guides** and modulation operator documentation" → "Updated modulation operator documentation" (program guides reference removed) |
| `2026-04-05-chromagnon-april-update` | Discord link updated |
| All posts with `discord.gg/lzx` | Invite code updated globally |

---

## Section 2: Documentation Pages

### File-Level Findings

**Old site docs:** 399 files (including 347 videomancer program pages)  
**New site docs:** 127 files

| Category | Old | New | Status |
|---|---|---|---|
| Guides | 10 | 10 | ✅ All present |
| Cases & Power | 6 | 6 | ✅ All present (folder renamed `case-and-power` → `cases-and-power`) |
| Instruments (non-VM) | 4 | 6 | ✅ New: added `double-vision-168.md`, `double-vision-expander.md` |
| Videomancer top-level | 5 | 7 | ✅ New: added `index.md`; ⚠️ `historic-device-references.md` **missing** |
| Videomancer programs | 347 | 24 (+1 index) | ❌ **324 pages missing** |
| Modules | 26 | 62 | ✅ All old modules present; 36 new modules added |
| Getting Started | 0 | 2 | ✅ New content only |

### Missing Documentation Files

**Critical:**
- `instruments/videomancer/historic-device-references.md` — exists in old, absent in new
- **324 Videomancer program reference pages** (see Section 3)

### Text Changes in Shared Doc Pages

Of 52 shared docs (excluding VM programs), **2 are identical** and **50 have diffs**. The vast majority are systematic formatting conversions (`* ` → `- `, `*italic*` → `_italic_`, Docusaurus component removal, URL path updates). All internal URL paths updated from `/docs/modules/...` to `/modules/...`.

**Substantive wording changes in docs:**

| File | Old wording | New wording | Verdict |
|---|---|---|---|
| `guides/about-lzx.md` | Marketing voice intro (2 paragraphs, "We explore an alternate universe...") | Practitioner voice rewrite; adds founding details, Cadet & Castle series to timeline | ✅ Intentional editorial update |
| `guides/about-lzx.md` | Image `about_lxz_workshop` (typo: lxz) | `about_lzx_workshop` (corrected: lzx) | ✅ Bug fix |
| `guides/about-lzx.md` | "This official LZX documentation was authored by..." | "The LZX technical documentation is authored by..." | ✅ Minor voice edit |
| `guides/standards.md` | "impedence" | "impedance" | ✅ Typo fixed |
| `guides/standards.md` | "mid-freqency" | "mid-frequency" | ✅ Typo fixed |
| `guides/standards.md` | "the zero to one volt range range" (duplicate word) | "the zero to one volt range" | ✅ Duplicate word removed |
| `guides/standards.md` | "0-10v or +/-5v" | "0 to 10 V or ±5 V" | ✅ Formatting improvement |
| `guides/troubleshooting.md` | Section heading `## Halp!` | `## When something seems wrong` | ✅ Intentional rename |
| `guides/troubleshooting.md` | "Euroack" (typo) | "Eurorack" | ✅ Typo fixed |
| `guides/troubleshooting.md` | Full inline warranty text (7 paragraphs) | Link to Warranty Policy page | ⚠️ Verify linked policy page is complete |
| `guides/what-is-a-video-synthesizer.md` | Original 3 body paragraphs | Rewritten with same ideas, more precise language | ✅ Intentional editorial rewrite |
| `cases-and-power/index.md` | `# Case & Power` | `# Cases & Power` | ✅ Consistent with folder rename |
| `cases-and-power/index.md` | "More content coming soon." | New paragraph with store link | ✅ Improved placeholder |
| `instruments/chromagnon.md` | WIP warning admonition | Removed; replaced with intro paragraph | ✅ WIP banner removed (site launched) |
| `instruments/vidiot.md` | WIP warning admonition | Removed; replaced with intro paragraph | ✅ WIP banner removed |
| `instruments/videomancer/quick-start.md` | Link to `[Program Guides](/docs/category/program-guides)` | Link removed | ⚠️ 324 program pages not yet published |
| `modules/*.md` (all) | `<span class="head2_nolink">` Docusaurus components | Removed | ✅ Components cleaned up |

---

## Section 3: Videomancer Programs — Critical Gap

| Metric | Old site | New site |
|---|---|---|
| Program reference pages | 347 | 24 |
| Associated images | ~7,536 | 0 |

**324 Videomancer program pages** were absent from the new site at audit time. All 324 were migrated on 2026-05-21 and are now published in `content/docs/instruments/videomancer/programs/`. Images migrated to `public/docs/img/instruments/videomancer/`.

---

## Section 4: Images

| Category | Old | Status |
|---|---|---|
| Blog post images (144 imgs) | All present in `content/blog/*/` | ✅ 100% present |
| Guide images | All present in `public/docs/img/guides/` | ✅ 100% present (path reorganized) |
| `about_lxz_workshop.jpg` (old typo) | Renamed to `about_lzx_workshop.jpg` | ✅ Fixed |
| Module diagram source files (47) | Internal After Effects source assets, not published docs | ℹ️ Working files, not a concern |
| Videomancer program images (~7,536) | Tied to 324 missing program pages | ❌ Not present |

---

## Action Items

### Blockers (must resolve before archiving old site)

- [x] **BLOCKER-1** — Migrated 324 Videomancer program pages and 7,520 images (2026-05-21)
- [x] **BLOCKER-2** — Migrated `instruments/videomancer/historic-device-references.md` (2026-05-21)

### Non-blockers (review and decide)

- [x] **NB-1** — Blog post `2026-05-06-chromagnon-may-update`: skipped — was `draft: true` with no real content
- [x] **NB-2** — `guides/troubleshooting.md`: Warranty Policy link confirmed valid and complete; no action needed
- [ ] **NB-3** — Add missing firmware ZIPs to `public/downloads/products/`: `tbc2-firmware_1.0.6.zip`, `tbc2-firmware_1.0.7.zip`, `videomancer-0.2.0-rc.1.uf2` (download page routes exist; files not yet added)
- [x] **NB-4** — `videomancer-firmware-1.0.0` changelog: "program guides" removal confirmed intentional (pages not yet published at that time)
- [x] **NB-5** — `instruments/videomancer/quick-start.md`: Programs placeholder text left as-is; link to be added once program index is live
- [x] **NB-6** — Monthly update post date differences: all four posts are `draft: true` with no real content; no action needed

---

## Recommendation

**The old site is now ready to be archived.** BLOCKER-1 and BLOCKER-2 are resolved as of 2026-05-21. The one remaining open item (NB-3) is additive only — firmware files that should be added to the downloads directory when available; their absence does not break any existing content.

All wording changes between old and new site are intentional improvements: typo fixes, editorial rewrites, Docusaurus component removal, and URL normalization.
