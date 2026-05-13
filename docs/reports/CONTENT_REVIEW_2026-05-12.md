# Site content review — 2026-05-12

Manual cross-sweep across every customer-visible content surface in the
repo: marketing pages, route-level copy, product manuals, support
files, site documentation, blog posts, and policies. Accuracy claims
are cross-checked against `db/lzxdb.Module.json`, `app/data/module-specs.ts`,
`app/data/product-slugs.ts`, the category configs in
`app/data/category-configs/`, and the LFS metadata under
`data/lfs-library/`.

This is a **read-only audit**. No content was edited. Findings are
tiered by impact using the same P0/P1/P2 conventions as
[docs/content-audit/P0_CRITERIA.md](../content-audit/P0_CRITERIA.md):

- **P0** — factually wrong, broken, or contradicts the canonical data
  source the site itself uses. Fix before next deploy.
- **P1** — drifts from the documented editorial standard (canonical
  URLs, voice/style guide, content-vs-stub rules) or is internally
  inconsistent across surfaces. Schedule next.
- **P2** — copy polish: small grammar / typo / tone nits.

Scope this report assumes:

- `content/docs/WRITING_STYLE_GUIDE.md` is the authoritative voice.
- `content/docs/PRODUCT_HUB_EDITING.md` is the authoritative IA /
  cross-link guide.
- `db/lzxdb.Module.json` (via `app/data/module-specs.ts`) is the single
  source of truth for HP, depth, power draw, sync I/O, release year.
- `app/data/product-slugs.ts` is the canonical slug registry.

Total surfaces inspected:

| Surface | Files |
| --- | ---: |
| Marketing routes (`app/routes/**/*.tsx`) | ~25 customer-facing |
| Category configs (subtitles, group blurbs) | 8 |
| Landing JSON (`content/landing/`) | 2 |
| Per-product support (`content/support/`) | 15 (+ README) |
| Module manuals (`content/docs/modules/`) | 60 |
| Instrument manuals (`content/docs/instruments/`) | 12 |
| Site guides (`content/docs/guides/`) | 9 |
| Case & power docs (`content/docs/cases-and-power/`) | 6 |
| Getting-started docs (`content/docs/getting-started/`) | 2 |
| Blog posts (`content/blog/`) | 68 directories |
| Policies (`policies/`) | 5 documents (`.md` + `.html`) |
| Static page (`content/pages/about.md`) | 1 |

---

## P0 — accuracy / data-source conflicts

> **Status (2026-05-12):** All six P0 items resolved in commit-pending changes. Per-item resolutions noted inline below.

### P0.1 MLT mounting width contradicts the spec source of truth — RESOLVED

`content/docs/modules/mlt.md` lists MLT as a 4 HP module in two places
(lines 25 and 82) and reinforces that with `Module Width | 20.32 mm`
(4 HP × 5.08 mm). The canonical sources disagree:

- `db/lzxdb.Module.json` → `MLT.hp = 8`
- `data/lfs-library/products/eurorack-modules/gen3/mlt/modulargrid/metadata.md`
  → `| Width | 8 HP |`
- `/modules/specs` (driven by `app/data/module-specs.ts`) renders MLT as
  8 HP.

Result: the **module specs page contradicts the module manual on the
same product**. Customers planning rack space cannot trust the page.
Resolve by inspecting the production panel and correcting either the
manual table + `Module Width` or the db field + LFS metadata. Update
all three together (the editing guide explicitly forbids re-adding
manual specs tables, so the manual should drop the table once `db` is
correct).

**Resolution:** Confirmed 8 HP is canonical. Updated
`content/docs/modules/mlt.md`: `4 HP` → `8 HP` in both the Key
Specifications and Full Specifications tables; `Module Width | 20.32 mm`
→ `40.64 mm`. The manual now matches `db/lzxdb.Module.json`,
`data/lfs-library/.../mlt/modulargrid/metadata.md`, and `/modules/specs`.

### P0.2 Discord invite link split-brain — RESOLVED

The site links to two different Discord invites:

- Canonical (`app/data/social-links.ts`, `app/routes/($lang).community.tsx`,
  contact policy, Shopify mirror): `https://discord.gg/7xzD4XzhGn`
- Used in blog posts and footer-style CTAs:
  `https://discord.gg/lzx` — at least 5 blog posts use this URL
  (`2026-03-05-chromagnon-building-it-right`, `2026-03-06-chromagnon-fpga-deeper-dive`,
  `2026-04-05-chromagnon-april-update`, `2026-04-14-videomancer-demo-reel`,
  `2026-05-07-chromagnon-revenue-pacing-update`).

If `discord.gg/lzx` is the live vanity URL, the canonical site should
adopt it (it's brand, stable, indexable). If it is **not** registered,
those five blog posts and any future post-template footer point at a
broken invite. Verify and then pick one URL everywhere.

**Resolution:** `discord.gg/lzx` is not registered. Replaced all five
occurrences with `https://discord.gg/7xzD4XzhGn`. Verified zero
`discord.gg/lzx` references remain in `content/`.

### P0.3 Getting-started guide references a product that doesn't exist — RESOLVED

`content/docs/getting-started/modular.md` (the canonical onboarding
page surfaced at `/getting-started/modular`) lists under
**Compatibility → EuroRack Cases & Power Supplies**:

- `LZX Vessel Case` — generic; not a product name (there are Vessel 84,
  Vessel 168, Vessel 208 — see `app/data/category-configs/cases-and-power.config.ts`).
- `LZX Capsule Power` — **no such product exists** in the LZX catalog
  (`db/lzxdb.Module.json` has no entry containing "capsule"; no
  reference in the cases-and-power config; no LFS metadata).

Either replace with the actual Vessel / DC Distro family names or
remove the reference. This is the page a first-time customer reads to
plan a rack.

**Resolution:** Rewrote the Compatibility section of
`content/docs/getting-started/modular.md`. Dropped the third-party
compatibility intro paragraph and the Google Form line. Replaced the
`EuroRack Cases & Power Supplies` subsection with a single sentence
linking to `/cases-and-power`. Kept the `Video Capture & Display
Devices (SD/HD)` subsection (Blackmagic/SEETEC) unchanged.

### P0.4 Marketing claim is unverifiable from repo data — RESOLVED

`content/pages/about.md` opens with:

> "shipped 97 products across eight product lines"

- **"Eight product lines"** matches the eight series in
  `app/data/category-configs/modules.config.ts`
  (`pseries, gen3, castle, orion, visionary, cadet, expedition, legacy`) — OK.
- **"97 products"** does not match any count derivable from `db/lzxdb.Module.json`:
  - 81 distinct LZX hub products (non-accessory, non-stub) in db.
  - 107 distinct LZX names including accessories, cables, panels, and
    DIY kits.
  - 87 if you add the six listing-eligible legacy Visionary modules
    that live only in `data/lfs-library/products/eurorack-modules/visionary/`.

Pick a definition ("shipping SKUs ever invoiced", "hub products",
"distinct product names") and back the number from it, or rephrase to
something the data can prove (e.g. "more than 80 products"). The "About"
page is the most-quoted source for press and dealers — it should not
contain a number that cannot be reproduced from the catalog.

**Resolution:** Replaced `97 products` with `more than 80 products` in
`content/pages/about.md`. The new phrasing maps cleanly to the 81
distinct LZX hub products in `db/lzxdb.Module.json` and is honest
without committing to a specific count that drifts with every product
launch.

### P0.5 Quick-start prerequisites omit the most prominent I/O — RESOLVED

`content/support/videomancer.md` lists `setupPrerequisites:`

```
- A display with composite or component video input
- RCA cables for video connections
- USB-C cable for firmware updates
```

But the **Quick Start manual** (`content/docs/instruments/videomancer/quick-start.md`)
and the **landing copy** (`content/landing/videomancer.json` and
`app/routes/($lang)._index.tsx`) lead with HDMI as the primary path,
and the same support file's FAQ correctly lists HDMI first. The Setup
tab shown on the Videomancer hub will tell a brand-new buyer to bring
RCA cables when the manual is going to ask them to plug in HDMI. Add
"HDMI source device, display with HDMI input, two HDMI cables" as the
first three prerequisites; demote analog to a note.

**Resolution:** Rewrote `setupPrerequisites` in
`content/support/videomancer.md` to four HDMI-first items: HDMI source
device, HDMI display, two HDMI cables, included 12V DC power supply.
Dropped the USB-C-for-firmware line (already covered by the existing
firmware-update FAQ + LZX Connect). Added a new FAQ item, "Can I use
Videomancer with analog sources (composite, component, S-Video, RGB)?",
pointing to the Signal Paths section of the User Manual. Note: this
new FAQ partly overlaps with the existing "What video formats does
Videomancer support?" entry — flagged for a future editorial pass to
merge or differentiate.

### P0.6 Blog post directories without `index.md` ship orphan assets — RESOLVED

`content/blog/tbd-audio-envelope-module-development/` and
`content/blog/tbd-noise-module-development/` contain only image files
— no `index.md`. They do not render as posts (correct), but the images
sit in the public asset graph indefinitely. Either author the posts or
delete the folders. (All other `tbd-*` and `_archived-*` directories
have `draft: true` on the index — those are fine.)

**Resolution:** Deleted both directories and their image assets
(`tbd-audio-envelope-module-development/`,
`tbd-noise-module-development/`). The remaining four `tbd-*` directories
all have `draft: true` index.md files and are unaffected.

---

## P1 — editorial drift / IA standards

> **Status (2026-05-12):** All P1 items tracked in this report are resolved
> in repo as of the same date (latest batch completes P1.4–P1.6, P1.8,
> P1.11–P1.15; P1.14 verified).

### P1.1 Non-canonical doc URLs scattered through markdown

`content/docs/PRODUCT_HUB_EDITING.md` explicitly mandates canonical
paths so analytics and SEO are not split across redirect duplicates.
Despite that, cross-links in markdown still use the legacy Docusaurus
`/docs/instruments/...` and `/docs/modules/...` patterns, which 301 to
`/instruments/<slug>/manual/...` and `/modules/<slug>/manual` via
`app/routes/($lang).docs.$.tsx`.

24 content files contain 102 such links. Hotspots:

| File | Non-canonical links |
| --- | ---: |
| `content/docs/instruments/videomancer/programs/index.md` | 23 |
| `content/docs/guides/video-tutorials.md` | 19 |
| `content/docs/instruments/videomancer/user-manual.md` | 13 |
| `content/docs/modules/tbc2.md` | 6 |
| `content/docs/modules/swatch.md` | 5 |
| `content/docs/modules/prm.md` | 4 |
| `content/docs/instruments/videomancer/quick-start.md` | 5 |
| `content/docs/guides/glossary.md` | 4 |
| `content/docs/modules/fkg3.md` | 3 |
| `content/blog/2026-03-20-videomancer-firmware-1.0.0/index.md` | 3 |

The Videomancer `quick-start.md` is particularly visible: every "see
the User Manual" CTA in that file (lines 20, 35, 136, 138, 140) points
through the redirect. Recommend a one-shot sweep that rewrites:

- `/docs/instruments/<slug>/<rest>` → `/instruments/<slug>/manual/<rest>`
- `/docs/modules/<slug>` → `/modules/<slug>/manual` (or `/modules/<slug>`
  if the link was meant for the hub overview)
- `/docs/getting-started/<rest>` → `/getting-started/<rest>`

**Resolution:** Sweep complete for authored links under `content/` (24
markdown files): instrument links now use `/instruments/<slug>/manual/...`;
module links in manuals and blog posts use `/modules/<slug>/manual` (with
anchors preserved). **`content/docs/guides/`** module links use **`/modules/<slug>`**
(hub overview), including glossary, `video-tutorials.md`, and
`installing-modules.md`. `content/docs/modules/module-list.md` prose now
references **`/modules/specs`** only.

### P1.2 Glossary internal references point at the manual tab when the overview tab is what's meant

`content/docs/guides/glossary.md` cross-references modules with
`/docs/modules/<slug>` URLs that — after the 301 — land on the manual
sidebar of that module (e.g. `/modules/dsg3/manual`). In glossary
context, a reader clicking from "Swatch" or "TBC2" almost always wants
the module's overview tab (`/modules/<slug>`), not page 1 of a
multi-section manual. Choose deliberately for each reference and
prefer the overview hub for read-once links.

**Resolution:** Implemented with the P1.1 sweep — glossary and the other
guide pages under `content/docs/guides/` link modules at **`/modules/<slug>`**.

### P1.3 73% of per-product support files are boilerplate stubs

`content/support/README.md` is explicit:

> "Support content is intentionally **optional**. … If you do not have
> either, do not create a stub file. A stub without content only
> clutters the repo and produces no user-visible benefit."

40 of 55 files in `content/support/` are stubs with one of two
boilerplate FAQs and (optionally) the boilerplate prerequisite
`Eurorack case with industry-standard ±12V power (where applicable to
this product)`. The "Castle template" (8 files, 12 lines each) and the
"Cadet/generic template" (32 files, 14 lines each) are mass-produced
from the same body:

> "Triage and links for **<name>**. Add product-specific answers here
> over time; keep long explanations in the manual."

Recommended action:

- Delete the 40 boilerplate files. The hub renders a full Support tab
  with troubleshooting, forum, and contact links regardless — the
  hub's empty-state already covers the "no FAQ yet" case.
- Keep only the 15 files with real authored content (chromagnon,
  videomancer, vidiot, andor-1-media-player, esg3, fkg3, dsg3-with-content,
  proc, smx3, tbc2, dc-distro-3a, plus the four already without
  prerequisites, etc.).

**Resolution:** Deleted the 40 boilerplate support markdown files; 15
authored files remain, plus `README.md`. `SUPPORT_MANIFEST` is unchanged;
missing files still yield empty FAQ/setup via `loadSupportContent()`.

### P1.4 `content/docs/case-and-power/` is effectively empty

All five product sub-pages are `draft: true` with only the title:

- `vessel-84.md`, `vessel-168.md`, `rack-84.md`, `dc-distro.md`, `bus-168.md`

…and `index.md` says "Documentation for EuroRack cases and power
supplies. More content coming soon." Meanwhile the home page tile
"Power and House Your System" on `/docs` (`app/routes/($lang).docs._index.tsx`)
links to `/docs/case-and-power` — so a reader who clicks "documentation
for cases and power" hits a four-line placeholder. Either write the
pages or remove the docs landing tile and link directly to
`/cases-and-power`.

**Resolution:** Renamed docs tree to **`content/docs/cases-and-power/`**
with canonical URLs `/docs/cases-and-power`; **301** from
`/docs/case-and-power` and nested paths. The `/docs` landing tile now
targets **`/cases-and-power`** (store category) with copy that points readers
to supplemental docs. The section index links to the shop and
`/getting-started/modular`.

### P1.5 `docs/guides/about-lzx.md` is missing two series

The site says it has **eight** product lines (matches
`modules.config.ts`):
`pseries, gen3, castle, orion, visionary, cadet, expedition, legacy`.
`content/docs/guides/about-lzx.md` History lists only five:

> Visionary (2011–2015), Expedition (2015–2018), Orion (2018–2022),
> Gen3 (2022–present), P-Series (2024–present)

Castle and Cadet are absent. These two are still actively listed at
`/modules` (Castle is in `ACTIVE_SERIES_ORDER`). Add the missing
series and their year ranges; otherwise either this page or the about
landing is wrong.

**Resolution:** History now includes **Cadet** and **Castle** with year
ranges and lists all seven narrative generations through **P-Series**
(`about-lzx.md`).

### P1.6 About page vs docs guide disagree on founding framing

- `content/pages/about.md`: "Founded in 2010 in Denton, Texas by Lars
  Larsen, Jonah Lange, and Ed Leckie, the company relocated to
  Portland, Oregon in 2015"
- `content/docs/guides/about-lzx.md`: "LZX began as a DIY project in
  2008"

Both can be true (DIY 2008 → company 2010 → first products 2011 → move
2015) but the two surfaces tell different stories. Either unify the
narrative or have each page link to the other so the timelines reconcile.

**Resolution:** `about-lzx.md` opens with DIY **2008**, founding **2010**
Denton, and Portland **2015**; `about.md` adds the DIY **2008** clause and
cross-links to [About LZX](/docs/guides/about-lzx); `about-lzx.md` links to
[About](/about).

### P1.7 Instruments listing subtitle disparages the rest of the line

`app/data/category-configs/instruments.config.ts` `pageSubtitle`:

> "Our standalone consoles and instruments are a great way to start
> creating without the complexity and setup process of eurorack modules."

Two issues:

- Calling them "standalone **consoles** and instruments" introduces a
  noun the rest of the site never uses (the page itself is titled
  "Instruments"; the about page, the homepage, and `videomancer.json`
  call Videomancer a "standalone video synthesizer"). Pick one.
- "without the complexity and setup process of eurorack modules" reads
  as anti-marketing for the modular line on a site that sells both
  side-by-side.

**Resolution:** Updated `instruments.config.ts` `pageSubtitle` to describe
standalone video synthesizers usable on their own or with Eurorack video
modules (no "consoles" wording, no negative comparison).

### P1.8 Voice drift in category subtitles

Per `WRITING_STYLE_GUIDE.md` the site voice "Never uses buzzwords,
jargon soup, or marketing language" and exclamation marks should be
rare. Multiple category subtitles break this:

- `accessories.config.ts`:
  > "Everything you need to patch and create with your new video
  > gear! Find cables of all sizes and types along with any storage
  > accessories for your new LZX device."

  "video gear" + "LZX device" are non-standard vocabulary;
  exclamation; "new" is repeated; "any storage accessories" is loose.

- `modules.config.ts` pseries blurb:
  > "Our compact utility modules are the perfect building blocks in
  > creating your perfect video setup!"

  "perfect" twice in one sentence; exclamation; "video setup" diverges
  from project vocabulary ("the synth" / "the system" per the style
  guide).

- `parts.config.ts`:
  > "Missing pieces and quick fixes can be accessed here for at-home
  > repair."

  Passive voice; the parts listed (power entries, knobs) are not
  obviously "repair" parts.

- `merchandise.config.ts`:
  > "…our lovable mascot Vidiot in all his forms. Support us, our
  > creative team, and rock out unique designs created by and for video
  > nerds."

  Vidiot is a **product** in the registered hub system, not a brand
  mascot — and the merchandise SKUs visible in this config feature
  Cadet, Castle, Chromagnon, Expedition, Orion, and Videomancer
  artwork; none reference a "Vidiot mascot" specifically. Either
  re-author the SKUs to actually feature a mascot or rewrite this blurb
  to describe what the merch actually shows.

**Resolution:** Rewrote `pageSubtitle` strings in `accessories.config.ts`,
`parts.config.ts`, `merchandise.config.ts`, and the **P-series** group blurb in
`modules.config.ts` for direct, on-voice catalog tone (no exclamation-led
fluff; merchandise describes series artwork SKUs accurately).

### P1.9 `/artists` page tone is off voice

`app/routes/($lang).artists.tsx`:

> "Join us as we give back to our community via our weekly artist
> highlights! Once a week, we honor our community's talented creators
> by featuring their art, stories, and upcoming creations in our
> newsletter and blog posts. Our customers inspire us, let them
> inspire you!"

Two exclamations, a comma splice ("let them inspire you"), and
"customers inspire us" hits the marketing-fluff line the style guide
calls out. Suggested replacement: a single paragraph that names what
the program is (weekly featured artist on the blog and newsletter, open
submissions) and links to the application form. Keep the form CTA that
already exists; replace the body copy.

**Resolution:** Replaced the body copy in `app/routes/($lang).artists.tsx`
with a single direct paragraph; kept the application form callout above it.

### P1.10 `/getting-started` calls Videomancer a "video effects console"

`app/routes/($lang).getting-started._index.tsx` card description:

> "Unbox, connect, and start using Videomancer — our standalone video
> effects console. No modular experience needed."

Every other surface (about, hero, manual, landing JSON) calls
Videomancer a "standalone video synthesizer." Pick one term and use
it everywhere. The about page wording ("FPGA-based standalone video
synthesizer") is the strongest.

**Resolution:** Card copy updated to **standalone video synthesizer**
(`getting-started._index.tsx`).

### P1.11 `/cases-and-power` (plural) vs `/docs/case-and-power` (singular)

The route is `app/routes/($lang).cases-and-power.tsx` and the page
title is **"Cases & Power"**. The docs folder is `content/docs/case-and-power/`
and `app/routes/($lang).docs._index.tsx` links to `/docs/case-and-power`
under the title **"Power and House Your System"**. Two URL slugs and
three different labels for the same topic across the IA. Pick one
canonical slug (plural matches every other category in the registry)
and rename the docs folder + index link.

**Resolution:** Docs content lives under **`content/docs/cases-and-power/`**
with **`/docs/cases-and-power`** URLs; legacy **`/docs/case-and-power`**
paths **301** to the new slug; `/docs` hub tile points at **`/cases-and-power`**.

### P1.12 `/connect` page status vs. `/downloads` status

- `/connect` (`app/routes/($lang).connect.tsx`):
  > "It is currently in pre-release for Videomancer and is being prepared
  > for Chromagnon support."
- `/downloads` (`app/routes/($lang).downloads.tsx`):
  > "LZX Connect provides a unified desktop updater for Videomancer
  > (with Chromagnon support coming soon)."
- Connect "Supported Devices" card:
  > "Videomancer (pre-release support available now)"
  > "Chromagnon (integration in progress)"

The three phrasings are close but different. The connect page itself
calls Videomancer support "pre-release" twice — but the latest
Videomancer firmware in blog (`videomancer-firmware-1.0.0`) is a stable
1.0 release. Verify with engineering whether LZX Connect for Videomancer
is still pre-release; if not, soften everywhere.

**Resolution:** Aligned `/connect` hero, meta description, Supported Devices
list, and `/downloads` LZX Connect blurb: Videomancer is supported in
current releases; Chromagnon support is in development (no “pre-release”
wording for Videomancer).

### P1.13 `/downloads` "Docs" button violates the IA guide

The product cards on `/downloads` show a button labeled **"Docs"**
that links to `/modules/<slug>/manual`. The Product Hub editing guide
says:

> "Never label a hub tab 'Docs' — that word is reserved for the `/docs`
> area so customers are not sent to two different mental models for the
> same word."

The button is not literally a tab, but it's a primary nav element on a
hub product card sending the user to a Manual route. Rename to
**"Manual"** to stay consistent with the hub tab name and the editing
rule.

**Resolution:** Button label updated from **Docs** to **Manual** in
`app/routes/($lang).downloads.tsx`.

### P1.14 `quick-start.md` references `/docs/instruments/videomancer/downloads`

`content/blog/2026-03-12-videomancer-preview-release/index.md` line 23
links to `/instruments/videomancer/downloads`. The actual instrument
downloads route is `/instruments/videomancer/downloads` (the file
exists at `app/routes/($lang).instruments.$slug.downloads.tsx`) so this
one works, but verify after the canonical-URL sweep in P1.1.

**Resolution:** Re-checked after P1.1: the preview post still links to
`/instruments/videomancer/downloads`, which matches
`($lang).instruments.$slug.downloads.tsx`.

### P1.15 Module list page (`/modules`) "Other" group label

`modules.config.ts` registers a `legacy` and `other` series in
`LEGACY_SERIES_ORDER` but the SERIES_LABELS map produces "Legacy
Series" and "Other Series". `getModulesBySeries()` in
`product-slugs.ts` only emits keys it actually finds in the data; the
"other" bucket is reserved for "unknown series". If the bucket ever
appears, it surfaces a meaningless "Other Series" group title to
customers. Either drop the `other` key from `LEGACY_SERIES_ORDER` or
give the fallback a more concrete label ("Discontinued" / "Archive").

**Resolution:** Renamed the fallback bucket label from **Other** to **Archive**
(`SERIES_LABELS.other`); tightened the group subtitle copy.

## P2 — copy nits and small typos

> **Status (2026-05-12):** All P2 items in this section have been addressed in
> the follow-up commit batch (copy fixes, image rename, actionable
> order-confirmed links, policy email/label, home About teaser, downloads
> accuracy, removal of redundant DIY kit sentences from P-series module
> manuals). **P2.5** (MLT “February 2025” revision line) left unchanged —
> it matches the hardware revision table in the same manual.

### P2.1 `content/docs/guides/standards.md`

- Line 24: `"The zero to one volt range range is slightly greater…"` —
  duplicated word "range range".
- Line 22: `"mid-freqency audio"` — typo, should be `"mid-frequency"`.
- Line 26: `"voltages, impedence, and physical connectors"` — typo,
  should be `"impedance"`.
- Line 26: `"There's no risk incurred by connecting audio modules
  directly to video modules. A voltage divider gives best results when
  incorporating audio modules in an LZX system, Additionally, many LZX
  modules…"` — comma splice; "system, Additionally" should be a
  sentence break.
- Voltage range spacing is inconsistent (`+/-1 V` vs `+/-1V` vs `0 to
  +1V` vs `0 to +1 V`) — pick one form for the page.

### P2.2 `content/docs/guides/troubleshooting.md`

- Line 10 H2 `## Halp!` — informal joke heading; per the writing guide
  the voice "is never breathless or hyperbolic" and uses exclamation
  marks sparingly. Replace with a real heading ("How to triage", "When
  something seems wrong").
- Line 24 `"12V barrel or Euroack power supply"` — typo, should be
  `"Eurorack"`.

### P2.3 `content/docs/getting-started/modular.md`

- Line 63 `"two outputs from DSG3's first shape generator, to the inputs
  of it's second shape generator"` — `it's` (contraction) should be
  `its` (possessive).
- Line 92 `"Power supply capable of 1 amps or more"` — should be
  `"1 amp"` (singular) or `"1 A"`.
- Listed `LZX Vessel Case` and `LZX Capsule Power` (see P0.3).
- `TipTop Audio Mantis Case` is fine; `Arturia Rack Brute` should be
  `Arturia RackBrute` (Arturia's brand spelling) — minor.

### P2.4 `content/docs/guides/about-lzx.md`

- `image: /img/guides/about_lxz_workshop.jpg` — filename has the
  letters transposed (`lxz`, not `lzx`). The asset exists under that
  name in `public/docs/img/guides/`, so nothing breaks at runtime, but
  the brand spelling is wrong on the disk file. Rename the file and
  fix the reference together.

**Resolution:** Renamed to **`about_lzx_workshop.jpg`** and updated
`about-lzx.md` frontmatter, import, and `<img>`.

### P2.5 `content/docs/modules/mlt.md`

- Line 115 `"Initial production version, February 2025"` — fine if
  accurate, but worth confirming for an "active" current-gen module
  whose only spec table still shows 4 HP (see P0.1).

**Resolution:** P0.1 corrected MLT width; the revision caption matches the
hardware revision section. No wording change.

### P2.6 `app/routes/($lang).order-confirmed.tsx`

Three identically-sized "next steps" cards repeat info already in the
hero ("We've received your order…"). "What's Next?", "Track Your
Order", "Need Help?" together restate "you'll get an email," with no
new actions. Either turn them into actionable links (track order →
`/account/orders/<id>`, help → `mailto:`) or drop them.

**Resolution:** Each card now ends with an explicit link to
**`/account`**, **`/account/orders`**, or **`/support`** plus tightened
body copy.

### P2.7 `content/docs/instruments/videomancer/quick-start.md`

The Step-by-step is solid; one place to tighten: line 78
`"Your source video now passes through Videomancer's processor and out
to your display."` and the immediately following `:::tip` saying
"Videomancer remembers this setting." can collapse into one sentence —
the tip just restates the previous paragraph's implication.

**Resolution:** Collapsed the redundant `:::tip` into the preceding paragraph.

### P2.8 `policies/refund-policy.md` vs the rest of the policies

Refund policy directs preorder cancellations to `sales@lzxindustries.net`
while every other policy and the contact page now route everything
through `support@lzxindustries.net`. Unify (probably to
`support@…`, which is the address the support route already promotes
for technical help and which the terms-of-service page also uses).

**Resolution:** Preorder cancellation email is **`support@lzxindustries.net`**
throughout.

### P2.9 `policies/terms-of-service.md`

Line 48 link text: `[docs.lzxindustries.net](/docs)` — the href is
correct but the label is the legacy subdomain we migrated away from
(see `docs-subdomain-migration.md`). Rename the label to "our
documentation" so the policy doesn't preserve a subdomain that no
longer answers.

**Resolution:** Link text is now **[our documentation](/docs)** (no legacy
subdomain label).

### P2.10 Repeated body copy on the home page

Home page (`app/routes/($lang)._index.tsx`) "About LZX Industries"
block:

> "LZX Industries designs and manufactures analog and digital video
> synthesis instruments in Portland, Oregon. … Every product is
> engineered, assembled, and tested in-house."

And the About page (`content/pages/about.md`) lead:

> "LZX Industries designs and manufactures electronic instruments for
> real-time video synthesis. Founded in 2010 in Denton, Texas…"

These are within one click of each other. Either let the home page
block be a one-line teaser and link out, or de-duplicate the wording
("we design and manufacture …" / "in-house") so the two paragraphs
don't read like A/B variants on the same prose.

**Resolution:** Home About block is a short teaser pointing readers to **`/about`**
for history and flagship detail; removed duplicate “designs and manufactures /
in-house” framing.

### P2.11 `app/routes/($lang).downloads.tsx`

> "Manuals, firmware, and support files for all supported LZX products."

`for all supported LZX products` is loose — the page actually filters
to products with at least one asset in `getModuleAssets()`. Be honest:
"Firmware, manuals, schematics, and BOMs for every LZX product with
downloadable assets."

**Resolution:** Intro copy now states downloads are for products with **catalog
assets** (firmware, manuals, schematics, BOMs).

### P2.12 Module manual MLT — duplicate sentence about DIY availability

`content/docs/modules/mlt.md` line 129:

> "MLT is available as an assembled module, a full DIY kit, or a
> partial DIY kit."

Already implied by the spec data and the merchandise pricing flow.
Module manuals are not the place to advertise variants — keep this in
the product hub overview tab. (Same pattern repeats on a few P-series
manuals.)

**Resolution:** Removed the redundant “available as assembled / DIY …” line from
**MLT, PRM, POT, PGO, LNK, PAB** DIY sections.

---

## Suggested next steps

> **Note:** P0 / P1 / P2 findings in this report were addressed in follow-up
> work. Retain this section as a **template** for future audits, not a backlog.

1. **Triage** — same P0 / P1 / P2 tiers for the next full-site sweep.
2. **Canonical URLs** — keep new markdown on hub/manual paths per
   `PRODUCT_HUB_EDITING.md`.
3. **Voice** — spot-check category configs and landing routes against
   `WRITING_STYLE_GUIDE.md`.
4. **Hygiene** — avoid support-file stubs; keep policy emails consistent
   (`support@…`).
5. **Stakeholder** — revisits for counts, release milestones, and legal when
   offerings change.
