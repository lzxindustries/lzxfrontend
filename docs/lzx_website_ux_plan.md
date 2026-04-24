# LZX Website UX Strategy and Integration Plan

## Purpose

This document defines how the LZX website should unify commerce, product education, downloads, onboarding, and support into one coherent experience.

The goal is not to create a larger website. The goal is to make the existing site easier to understand, easier to navigate, and more useful before and after purchase.

## Executive Summary

The current site already contains the main building blocks of a product hub system:

- product overview routes for instruments and modules
- tabbed hub navigation on product pages
- dedicated downloads pages
- a site-level support hub
- a site-level docs index
- a getting-started page
- a separate LZX Connect page

The main UX problem is not missing content. The main UX problem is that these resources still feel like separate destinations rather than parts of one guided product experience.

The revised strategy is:

- make each product page the primary home base for that product
- keep global support, docs, and downloads as secondary directories rather than primary journeys
- reduce terminology friction for new users
- make firmware, manuals, setup, and troubleshooting easier to discover in context
- standardize information architecture across product types without flattening important differences between instruments and modules

## What Exists Today

### Current surfaced structure

The current application already exposes these major UX surfaces:

- product hub layouts for instruments and modules
- product-level tabs such as Overview, Manual, Videos, Downloads, Patches, and Specs
- global Support at `/support`
- global Documentation at `/docs`
- global Downloads at `/downloads`
- global onboarding at `/getting-started`
- dedicated LZX Connect page at `/connect`

### What is working

- The site already thinks in terms of product hubs, especially for module and instrument routes.
- Downloads have both product-specific and global access patterns.
- Support content has a clear top-level destination.
- Documentation already has a site-wide index and search entry point.
- LZX Connect already has a distinct product-adjacent landing page.

### What is not working well enough

- Product education is split between product pages, manuals, downloads, support, and getting-started pages with weak transition logic.
- The labels across the site do not yet form a consistent mental model. Users must infer the difference between docs, manual, downloads, support, and connect.
- Some journeys still expose implementation details instead of user intent. The LZX Connect page exposes a raw GitHub releases URL (`CONNECT_RELEASES_URL` in `($lang).connect.tsx`) as the download destination for all three platforms. Users should not need to navigate GitHub.
- New users need task-oriented entry points, while current owners need maintenance-oriented entry points. The site currently mixes these too loosely.
- The global pages are useful, but they sometimes compete with product pages instead of reinforcing them.
- The Getting Started page is a single monolithic route mixing video-synthesis education, modular patching tutorials, and instrument-specific content. It does not distinguish audience.
- The `SUPPORT_MANIFEST` only has entries for `videomancer` and `double-vision`. All other products lack structured manual-version and related-product data.
- The `LzxModuleAsset` data type has no `description` field. Downloads are displayed with file names only, which forces users to guess what each file does.
- Instrument hub data (`InstrumentHubData`) does not load connectors, controls, or features from lzxdb. A Specs tab for instruments would need a data-loader extension.
- Instruments currently have no Specs, Learn, Setup, or Support sub-routes. All four need to be created as new files.

## UX Problem Statement

LZX has a content orchestration problem, not a content inventory problem.

Users can usually find the information they need if they are persistent. The UX objective is to remove the need for persistence.

## Experience Principles

### 1. Product page first

Every product page should answer the majority of purchase, setup, and ownership questions without forcing a jump to separate site sections.

### 2. Global pages support, not compete

Global Support, Docs, Downloads, and Getting Started pages should help users enter the right product journey quickly. They should not become parallel systems with duplicated decisions.

### 3. Organize by task, not by content type alone

Users think in questions:

- What is this?
- Is it right for me?
- How do I set it up?
- What do I download?
- How do I update it?
- Where do I troubleshoot it?

The site should be structured around those tasks rather than around internal content categories only.

### 4. Reduce terminology burden

Terms like manual, docs, guide, downloads, firmware, support, sync formats, modulation, and program guides should be explained through surrounding context and short descriptions.

### 5. Separate discovery from ownership without splitting them apart

Pre-purchase and post-purchase needs are different, but both should be served from the same product hub.

### 6. Reorganize before creating new content

Most improvements should come from relabeling, regrouping, and connecting existing resources before commissioning new material.

## Target Information Architecture

### Primary model

The website should operate as a layered system:

1. Product Hub: the canonical home for a specific product
2. Support Directory: a site-wide index for help-oriented entry points
3. Documentation Directory: a site-wide index for technical reference and guides
4. Downloads Directory: a site-wide index for files and versioned resources
5. Onboarding Directory: task-based entry points for first-time users

### Product hub definition

Each product hub should combine:

- product story
- feature explanation
- setup guidance
- learn resources
- downloads and software
- specs and compatibility
- troubleshooting and support links

### Site-level directory definition

Site-level pages should exist for cross-product discovery, but they should hand users back into the correct product hub as quickly as possible.

## Recommended Navigation Model

### Global nav intent

Top-level navigation should reinforce five user intents:

- Shop products
- Learn the system
- Get support
- Download tools and files
- Understand the brand and ecosystem

### Support architecture

Support should remain the top-level help destination, but its cards should map to user tasks more explicitly:

- Find my product manual
- Download firmware or software
- Get started with a first system or first patch
- Troubleshoot a known issue
- Learn core terminology
- Contact LZX

### Documentation architecture

Documentation should serve as the technical library, but should present product-first entry points rather than category-first abstractions wherever possible.

### Downloads architecture

Downloads should remain as a central directory for users who know they need a file, but each download entry should clearly connect back to:

- product page
- manual or docs
- software or update flow
- related products where relevant

### Onboarding architecture

Getting Started should split into at least two distinct paths:

- Modular video synthesis onboarding
- Videomancer onboarding

This is one of the highest-leverage information architecture fixes because current entry-level guidance serves multiple audiences with different needs.

## Product Hub System

### Instrument hub template

Instrument pages should be the most complete hub experience because they combine higher complexity, software, firmware, and broader onboarding needs.

Recommended instrument structure:

- Overview
- Features
- Learn
- Setup
- Software and Downloads
- Specs and Compatibility
- Support

#### Overview

Purpose:
Explain what the instrument is, who it is for, and why it matters.

Include:

- clear positioning statement
- visual hero
- primary use cases
- quick confidence-building value points
- links to buy, manual, and quick start

#### Features

Purpose:
Translate capability into understandable outcomes.

Include:

- feature groups with visuals
- plain-language explanations
- reduced jargon
- links into deeper docs only when needed

#### Learn

Purpose:
Provide a curated entry point into documentation instead of a raw list of links.

Include:

- Quick Start
- Full Manual
- Program Guides
- Modulation Guide
- Formats and Connections
- Troubleshooting or Fault Codes

Each link should have a one-sentence explanation of what the user will get from it.

#### Setup

Purpose:
Turn the product page into the first operational guide.

Include:

- required hardware and software
- signal flow or system diagram
- initial setup steps
- common first-use configuration
- links to detailed setup docs

#### Software and Downloads

Purpose:
Unify files, updater workflow, and release understanding.

Include:

- LZX Connect as the preferred update path when applicable
- direct download options by platform
- firmware versions and release notes
- manual update path if needed
- additional downloads and support files

Important rule:
Users should not need to understand GitHub in order to update their product.

#### Specs and Compatibility

Purpose:
Answer technical questions with both plain language and reference detail.

Include:

- short human-readable summary
- technical spec table
- compatibility notes
- important limitations stated clearly

#### Support

Purpose:
Resolve ownership friction quickly.

Include:

- FAQ
- troubleshooting links
- support contact
- community or related learning resources

### Module hub template

Module pages should stay lighter than instrument pages, but they still need to act as practical hubs.

Recommended module structure:

- Overview
- Features or Functions
- Manual
- Patches or Examples
- Downloads
- Specs
- Support

Key difference from instruments:
Modules usually do not need as much software and onboarding depth, but they do need stronger contextual guidance around patching, compatibility, and role within a larger system.

### Simple product template

For accessories or lower-complexity products, use a compressed version:

- Overview
- Specs
- Downloads if applicable
- Support

## Cross-System Rules

### Rule 1: Tabs should reflect user tasks

Tab labels should favor clear user intent over internal taxonomy.

Example direction:

- Prefer Learn over ambiguous docs clusters when the content is educational
- Prefer Software and Downloads over Downloads when software is central to ownership
- Prefer Setup when initial configuration is a major user hurdle

### Rule 2: Manual is not the only learning surface

Manual content is important, but it should be framed as one resource inside a broader learning system.

### Rule 3: Every download surface must explain what the file is for

Do not show users file names alone when a short description can remove ambiguity.

### Rule 4: Global pages should route back to product pages

Every global docs or downloads listing should make the associated product destination obvious.

### Rule 5: Ownership tasks must be visible from the main product page

Firmware, manuals, setup, and troubleshooting should never be buried behind multiple site-level jumps.

## Videomancer Priority Plan

Videomancer should be the pilot for the full product-hub model because it has the strongest mix of commerce, software, documentation, and setup complexity.

### Immediate improvements

- Remove outdated wording that frames documentation as if it lives on a separate system. (Validated: `rewriteLegacyDocsLinks()` already rewrites `docs.lzxindustries.net` URLs in instrument and module overviews, and in `ModuleDetails.tsx`. Check Shopify product `descriptionHtml` and metafields for any remaining legacy URLs that the rewriter does not catch.)
- Replace raw doc-link clusters with curated Learn cards and short descriptions.
- Merge software, firmware, and downloads into one clearer user-facing system.
- Replace the raw GitHub releases URL in `($lang).connect.tsx` (`CONNECT_RELEASES_URL = 'https://github.com/lzxindustries/videomancer-firmware/releases'`) with either direct download links to release assets per platform or a server-side proxy that resolves the latest release. The three platform buttons (Windows, macOS, Linux) should each link directly to the correct asset rather than all pointing at the same GitHub page.
- Clarify technical messaging, especially around supported workflows and limitations.

### Videomancer content inventory

Videomancer already has the richest documentation set on the site. Existing content that should map into the Learn tab:

| Content file                           | Learn card label     | Description                                                  |
| -------------------------------------- | -------------------- | ------------------------------------------------------------ |
| `quick-start.md`                       | Quick Start          | Get Videomancer connected and producing video in minutes     |
| `user-manual.md`                       | User Manual          | Complete reference for all controls, connections, and modes  |
| `programs/index.md` + 20 program files | Program Guides       | Per-program deep dives for all built-in Videomancer programs |
| `modulation-operators.md`              | Modulation Operators | How to use modulation to animate and evolve programs         |
| `fault-codes-reference.md`             | Fault Codes          | Diagnose LED fault codes and error states                    |
| `serial-command-guide.md`              | Serial Commands      | Advanced: control Videomancer via serial interface           |
| `historic-device-references.md`        | Historic Devices     | Background on devices that inspired Videomancer programs     |

Other instruments have minimal docs:

- Chromagnon: single-file doc (`chromagnon.md`)
- Vidiot: single-file doc (`vidiot.md`)
- Double Vision: single-file doc (`double-vision.md`)
- Andor 1: single-file doc (`andor-1-media-player.md`)

This validates the decision to pilot with Videomancer. Other instrument Learn tabs will be minimal until more docs are written.

### Recommended Videomancer page model

- Overview: what it does and who it is for
- Features: key workflows and creative outcomes (source: Shopify `features` metafield, already rendered via Disclosure)
- Learn: curated cards linking to the 7 doc sections listed above, each with a one-sentence description
- Setup: installation, connections, first-run (source: extract from quick-start.md)
- Software and Downloads: Connect inline, firmware by platform, release notes, manual update path
- Specs and Compatibility: signal formats, environment expectations, limitations (source: Shopify `specs` and `compatibility` metafields — currently rendered as Disclosure sections on the overview, should be promoted to a dedicated tab)
- Support: fault codes link, troubleshooting, contact

### Messaging improvements needed

- Explain what LZX Connect is in user terms before linking away. Current copy says "unified desktop updater" which is adequate but should add: supported products (Videomancer now, Chromagnon planned), status (pre-release), and what happens if Connect is not available for a user's OS or product.
- Explain the difference between software download, firmware update, and manual. A simple callout like: "Software = LZX Connect app. Firmware = the code running on your instrument. Manual = the documentation."
- Clarify what users can expect from supported formats and what the product does not do.

## Downloads and Software Strategy

### Role of `/downloads`

The global downloads page should remain a cross-product file directory, but it should not be the first place a new customer learns how to use a product.

Its job is to serve users who already know they need:

- firmware
- manuals
- release files
- related support assets

### Role of `/connect`

LZX Connect should be framed as the recommended updater workflow, not just a repository of release packages.

The page should make these points immediately clear:

- which products are supported now
- which platforms are supported
- whether the app is production-ready or pre-release
- what the user should do if Connect is not appropriate for their case

### Product-page download strategy

Each product page should expose the ownership path inline:

- use Connect if you want the guided update path
- use direct downloads if you need the files manually
- read release notes if you need version detail

This is more useful than sending users to a generic file list without decision support.

## Onboarding Strategy

### Problem

The current Getting Started surface blends system-level LZX education with product-specific onboarding.

### Recommendation

Split onboarding into separate entry points:

- Learn Video Synthesis: for newcomers to the category
- Start with LZX Modular: for system-building and patching foundations
- Start with Videomancer: for instrument-specific setup and first-use flow

### Content allocation from current Getting Started page

The current `($lang).getting-started.tsx` contains a single Markdown block with these sections. Here is how they should be redistributed:

| Current section                                  | Target path                                          | Notes                                                |
| ------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------- |
| What Is A Video Synthesizer?                     | Learn Video Synthesis (new)                          | Category education, not product-specific             |
| Quick Facts About LZX                            | Learn Video Synthesis (new)                          | Brand context for newcomers                          |
| Installing Modules                               | Start with LZX Modular (new)                         | Modular-specific setup                               |
| Your First Patch                                 | Start with LZX Modular (new)                         | Modular-specific tutorial                            |
| Concepts (Generators, Functions)                 | Keep on `/getting-started` or move to `/docs/guides` | Reference material, not onboarding                   |
| Standards (Electrical, Mechanical, Video Timing) | Move to `/docs/guides/standards`                     | Already exists as `content/docs/guides/standards.md` |

The entry-point page at `/getting-started` should become a simple split-path selector:

- Card 1: "New to video synthesis?" → `/getting-started/learn`
- Card 2: "Setting up a modular system?" → `/getting-started/modular`
- Card 3: "Setting up Videomancer?" → `/instruments/videomancer/manual/quick-start`

### Homepage impact

The homepage Getting Started CTA section (in `($lang)._index.tsx`, line ~214) currently links only to `/getting-started`. After the split, it should either:

- Link to the new split-path entry point (preferred), or
- Show two buttons: "Start with Modular" and "Start with Videomancer"

### Content rule

Getting Started should focus on first success, not encyclopedic completeness.

## Content Model Requirements

To support the UX system above, each product should have a minimum structured content set.

### Required product metadata

- positioning summary
- user type or use case tags
- docs links with descriptions
- software availability
- firmware availability
- setup prerequisites
- compatibility notes
- support escalation links

### Required download metadata

- human-readable file label
- short description
- product association
- version if applicable
- platform if applicable
- release date if applicable
- whether Connect is the preferred path

### Data schema changes required

**`LzxModuleAsset` (in `app/data/lzxdb.ts`)** — current fields: `id`, `moduleId`, `assetId`, `name`, `fileName`, `fileType`. Add:

- `description: string` — short human-readable explanation of what the file is for
- `version: string | null` — version label if applicable (e.g. "v1.2.0")
- `platform: string | null` — target platform if applicable (e.g. "Windows", "macOS", "Linux")
- `releaseDate: string | null` — ISO date string

Source data lives in `db/lzxdb.Asset.json`. Current fields: `_id`, `__v`, `name`, `file_name`, `file_type`. New fields need to be added to the JSON records and parsed in `lzxdb.ts`.

**`SUPPORT_MANIFEST` (in `app/data/support-manifest.ts`)** — current entries: `videomancer`, `double-vision`. Needs entries for all active products. Extend the `ProductSupportRecord` type to include:

- `setupPrerequisites: string[]` — list of required hardware/software
- `connectSupported: boolean` — whether LZX Connect is the recommended update path
- `faqItems: Array<{question: string; answer: string}>` — structured FAQ for Support tabs

### Instrument inventory

These are the instruments defined in `INSTRUMENT_NAMES` in `app/data/product-slugs.ts`. Each needs its hub evaluated:

| Instrument             | Slug                     | Status              | Docs depth      | Needs hub expansion |
| ---------------------- | ------------------------ | ------------------- | --------------- | ------------------- |
| Videomancer            | `videomancer`            | Active              | Rich (32 files) | Yes — pilot         |
| Chromagnon             | `chromagnon`             | Hidden/discontinued | Single file     | Minimal — defer     |
| Vidiot                 | `vidiot`                 | Hidden/discontinued | Single file     | Minimal — defer     |
| Double Vision System   | `double-vision`          | Active              | Single file     | Yes — Phase 3       |
| Double Vision 168      | `double-vision-168`      | Active              | None            | Minimal             |
| Double Vision Expander | `double-vision-expander` | Active              | None            | Minimal             |
| Andor 1                | `andor-1-media-player`   | Active              | Single file     | Yes — Phase 3       |

### Required docs metadata

- content type
- audience level
- estimated value or outcome
- associated product
- associated task such as setup, update, patching, troubleshooting

## Search and Findability

### Support search

Support and docs search should prioritize task-oriented matches, not only title matches.

### Cross-linking

Every manual page, troubleshooting page, and downloads page should make it obvious how to return to:

- the product hub
- the relevant support section
- the next recommended action

### Naming consistency

Terminology should be normalized across the site. Decide once and use consistently for:

- Manual vs Docs
- Downloads vs Software and Downloads
- Support vs Help
- Getting Started vs Quick Start

## Implementation Roadmap

### Phase 0: Audit and decision cleanup

Objective:
Create the content and labeling foundation before UI expansion.

Tasks:

- audit current product routes, docs links, and download metadata
- define canonical labels for docs, support, setup, and software
- identify product-specific content gaps versus navigation gaps
- confirm which pages should remain global and which should become product-first

### Phase 1: Information architecture and copy fixes

Objective:
Improve comprehension without major structural engineering.

Tasks:

- improve labels and descriptions on existing product pages
- split Getting Started into clearer audience paths
- revise Support and Docs cards around user tasks
- strengthen links between product pages, downloads, and Connect
- reduce visible references to backend distribution systems

### Phase 2: Product hub expansion

Objective:
Make key product pages operational hubs.

Tasks:

- add Learn and Setup sections where appropriate
- expand product-level download surfaces with descriptions and version context
- add stronger specs summaries and compatibility notes
- add troubleshooting and support entry points to product pages

### Phase 3: Systematize and scale

Objective:
Roll the model across all product types with shared patterns.

Tasks:

- standardize templates for instruments, modules, and simple products
- normalize metadata feeding downloads and docs surfaces
- improve related-product and related-resource recommendations
- strengthen internal search, cross-linking, and ownership flows

### Phase 4: Advanced enhancements

Objective:
Add experience depth only after the core system is coherent.

Possible additions:

- interactive setup diagrams
- embedded quick-start previews
- structured release note views
- guided troubleshooting flows
- patch and program browsers

## Success Metrics

### Primary metrics

- product-page to manual click-through rate
- product-page to download or Connect click-through rate
- reduction in support-driven navigation loops
- improved discovery of troubleshooting and setup content
- higher depth of engagement on product hubs

### Secondary metrics

- support contact volume on avoidable setup questions
- search refinement rate on docs and support pages
- exit rate from downloads pages
- conversion confidence signals on complex products

## Risks and Constraints

### Risk: overbuilding before relabeling

The team should not jump straight to new sections and UI components before fixing wording, grouping, and cross-links.

### Risk: duplicating content across surfaces

The site should not create separate product, support, and docs narratives that drift apart over time.

### Risk: treating all products as equally complex

Instruments, modules, and simpler products need a shared system, not identical page depth.

### Constraint: content supply

Some improvements will require missing metadata or short descriptions more than they require new design or engineering.

## Decisions to Preserve

- Product pages should become the primary hub experience.
- Global Support, Docs, Downloads, and Connect pages should remain, but as supporting systems.
- The site should prioritize reorganization over content expansion.
- Videomancer should be the pilot for the full hub model.

## Recommended Next Actions

1. Use Videomancer as the first full UX hub implementation target.
2. Split Getting Started into Modular and Videomancer paths.
3. Revise product-page download and learning labels before adding new UI complexity.
4. Define a shared metadata model for docs, downloads, setup, and support summaries.
5. Roll the pattern out to modules after the instrument pilot is validated.

## Appendix A: Prioritized Implementation Checklist

Each item is tied to specific routes, components, and data files in the codebase. Items are grouped by phase and ordered by impact within each phase.

### Phase 0 — Audit and Decision Cleanup

- [x] **Audit instrument hub tabs vs. plan** — Compare `HubTab[]` in `app/routes/($lang).instruments.$slug.tsx` (currently: Overview, Manual, Videos, Downloads) against the target instrument template (Overview, Features, Learn, Setup, Software and Downloads, Specs and Compatibility, Support). Document which tabs are missing, which need relabeling, and which need new sub-routes.
- [x] **Audit module hub tabs vs. plan** — Same comparison for `app/routes/($lang).modules.$slug.tsx` (currently: Overview, Manual, Patches, Videos, Downloads, Specs). The module template adds Features or Functions and Support.
- [x] **Audit MegaMenu labeling** — Review `MENU_GROUPS` in `app/components/MegaMenu.tsx`. Decide canonical labels: Support Hub vs Support, Documentation vs Docs, Getting Started vs Quick Start. Record decisions.
- [x] **Audit Support page cards** — Review `SECTIONS` in `app/routes/($lang).support.tsx`. Rewrite card titles and descriptions to be task-oriented instead of content-type-oriented.
- [x] **Audit Docs index cards** — Review `SECTIONS` in `app/routes/($lang).docs._index.tsx`. Decide whether Modules and Instruments sections should link to product hubs or remain here.
- [x] **Audit Downloads page content** — Review `app/routes/($lang).downloads.tsx`. Confirm every `DownloadEntry` has meaningful `name`, `subtitle`, and file descriptions. Flag bare file names.
- [x] **Audit LZX Connect page** — Review `app/routes/($lang).connect.tsx`. Confirm it clearly states product support status, platform availability, and pre-release status. Flag any raw GitHub URLs exposed to users.
- [x] **Audit Getting Started content** — Review `app/routes/($lang).getting-started.tsx`. Identify which content is video-synthesis-general, which is modular-specific, and which is Videomancer-specific.
- [x] **Audit support-manifest coverage** — Review `app/data/support-manifest.ts`. Confirm all active products have entries with `manuals` and `relatedProductSlugs` populated.
- [x] **Decide: canonical terminology map** — Create a mapping document: Manual vs Docs, Downloads vs Software and Downloads, Support vs Help, Getting Started vs Quick Start per context. Apply consistently from Phase 1 onward.

### Phase 1 — Information Architecture and Copy Fixes

- [x] **Revise MegaMenu labels** — Edit `MENU_GROUPS` in `app/components/MegaMenu.tsx` per the canonical terminology decisions.
- [x] **Revise Support page cards** — Edit `SECTIONS` in `app/routes/($lang).support.tsx` to use task-oriented labels and descriptions.
- [x] **Revise Docs index cards** — Edit `SECTIONS` in `app/routes/($lang).docs._index.tsx` to route users to product hubs first.
- [x] **Revise Connect page copy and links** — Edit `app/routes/($lang).connect.tsx`: (1) Replace the single `CONNECT_RELEASES_URL` GitHub link with per-platform direct download URLs or a latest-release resolver. (2) Add pre-release status badge. (3) List supported products explicitly. (4) Add a fallback path for unsupported products/platforms. The three platform buttons currently all point to the same GitHub releases page — each should resolve to the correct `.exe`/`.dmg`/`.AppImage` asset.
- [x] **Split Getting Started** — Create `app/routes/($lang).getting-started.modular.tsx` (receives Installing Modules + Your First Patch content) and `app/routes/($lang).getting-started.learn.tsx` (receives What Is A Video Synthesizer + Quick Facts). Refactor `($lang).getting-started.tsx` into a split-path card selector with three options: Learn Video Synthesis, Start with Modular, and Start with Videomancer (links to `/instruments/videomancer/manual/quick-start`). Move the Standards and Concepts reference content to `/docs/guides/` where `standards.md` already exists.
- [x] **Update homepage Getting Started CTA** — In `app/routes/($lang)._index.tsx` (line ~214), update the CTA section to reflect the new split paths. Either link to the updated split-path entry point or show separate buttons for Modular and Videomancer.
- [x] **Improve download file descriptions** — Add `description` fields to `LzxModuleAsset` records in `db/lzxdb.Asset.json` or to the download entry rendering in `app/routes/($lang).downloads.tsx`.
- [x] **Add product-hub back-links to downloads** — In `app/routes/($lang).modules.$slug.downloads.tsx` and `app/routes/($lang).instruments.$slug.downloads.tsx`, add prominent return links to the product overview.
- [x] **Strengthen downloads-to-Connect callout** — In the global downloads page, make the Connect callout more prominent and explain which products it supports.
- [x] **Audit remaining legacy doc URLs** — The `rewriteLegacyDocsLinks()` function in `instruments.$slug._index.tsx` and `ModuleDetails.tsx` already rewrites `docs.lzxindustries.net` URLs. Verify that Shopify product `descriptionHtml` and metafield values (`specs`, `features`, `compatibility`) no longer contain legacy URLs that the rewriter misses. Check for any hardcoded `docs.lzxindustries.net` references in `content/docs/` markdown files.

### Phase 2 — Product Hub Expansion

- [x] **Add Learn tab to instrument hubs** — Create `app/routes/($lang).instruments.$slug.learn.tsx`. Add a `{label: 'Learn', to: '${basePath}/learn'}` tab to `HubTab[]` in the instrument layout. For Videomancer, populate with the 7 content sections identified in the Videomancer content inventory table. Each card should show: title, one-line description, and link to the doc page. The component should read from `InstrumentHubData.docPages` to determine which Learn sections have content. For other instruments with minimal docs, the tab should show available docs or hide via `hidden` logic.
- [x] **Add Setup tab to instrument hubs** — Create `app/routes/($lang).instruments.$slug.setup.tsx`. Populate with prerequisites, signal-flow diagram placeholder, and first-use steps.
- [x] **Rename instrument Downloads tab** — Rename the existing Downloads tab to Software and Downloads for instruments where LZX Connect or firmware applies. Update label in `app/routes/($lang).instruments.$slug.tsx`.
- [x] **Add Support tab to instrument hubs** — Create `app/routes/($lang).instruments.$slug.support.tsx`. Add FAQ, troubleshooting link, and contact info.
- [x] **Create instrument Specs tab** — Create `app/routes/($lang).instruments.$slug.specs.tsx` (does not exist yet). This route must read Shopify `specs` and `compatibility` metafields from `InstrumentHubData` (already available via outlet context). Also extend `loadInstrumentHubData()` in `app/data/hub-loaders.ts` to load `connectors`, `controls`, and `features` from lzxdb (currently only `ModuleHubData` loads these). Add corresponding tab entry in the instrument layout with `hidden` logic when no spec data is available.
- [x] **Add Support tab to module hubs** — Create `app/routes/($lang).modules.$slug.support.tsx`. Add FAQ, troubleshooting link, and contact.
- [x] **Improve module Specs descriptions** — In `app/routes/($lang).modules.$slug.specs.tsx`, add a plain-language summary of what the specs mean for patching and system context.
- [x] **Add version and release-note context to downloads** — Extend download entries in both module and instrument download sub-routes to show version, date, and a short release note if available.
- [x] **Wire hub-loaders for new tabs** — Extend `InstrumentHubData` in `app/data/hub-loaders.ts` to include:
  - `connectors: LzxModuleConnector[]` — needed for Specs tab (currently only in `ModuleHubData`)
  - `controls: LzxModuleControl[]` — needed for Specs tab
  - `features: LzxModuleFeature[]` — needed for Specs tab
  - `patches: LzxPatch[]` — needed if Patches tab is added to instruments later
    Update `loadInstrumentHubData()` to call `getModuleConnectors()`, `getModuleControls()`, `getModuleFeatures()`, and `getPatchesForModule()` when `moduleId` is available.
    For Learn and Setup tabs, the existing `docPages` and `sidebar` data should be sufficient — no additional loader changes needed.
    For Support tabs, add `faqItems` from the extended `SUPPORT_MANIFEST`.

### Phase 3 — Systematize and Scale

- [x] **Standardize instrument hub template** — All instruments should render the same tab set with consistent empty-state handling. Audit each active instrument slug.
- [x] **Standardize module hub template** — All modules should render the same tab set. Validate that `hidden` logic in `HubTab[]` correctly hides tabs with no content.
- [x] **Normalize support-manifest** — Extend `SUPPORT_MANIFEST` in `app/data/support-manifest.ts` to cover all active products. Currently only `videomancer` and `double-vision` have entries. Products needing entries (at minimum):
  - `double-vision-168`
  - `double-vision-expander`
  - `andor-1-media-player`
  - All active Gen3 modules: `esg3`, `dsg3`, `smx3`, `dwg3`, `fkg3`, `pgm3`, `tbc2`, etc.
    Extend `ProductSupportRecord` type to include `setupPrerequisites`, `connectSupported`, and `faqItems` fields.
- [x] **Add related-product recommendations** — Ensure `getRecommendedProducts()` in `app/data/hub-loaders.ts` surfaces meaningful results on overview and support tabs.
- [x] **Strengthen cross-linking from docs to hubs** — In `app/routes/($lang).docs.$.tsx`, add sidebar or breadcrumb links back to associated product hubs.
- [x] **Strengthen search integration** — In `scripts/build-search-index.mjs`, generate synthetic hub pages and global site pages for Pagefind indexing so search results include product hub pages and task-oriented content.
- [x] **Re-integrate deferred nav items** — Following `docs/draft-nav-review.md`, restore Glossary, Artists, Legacy, Systems, and B-Stock to MegaMenu after content review.
- [x] **Restore All Instruments nav link** — Re-add `All Instruments` (/instruments) to MegaMenu Products group, completing all items from `docs/draft-nav-review.md`.
- [x] **Restore hidden module series on Modules page** — Expand `SERIES_ORDER` in `($lang).modules._index.tsx` from `['gen3', 'castle']` back to all 9 series (gen3, orion, visionary, castle, cadet, expedition, vhs, legacy, other).

### Phase 4 — Advanced Enhancements

- [x] **Interactive setup diagrams** — Add SVG or canvas-based signal-flow diagrams to Setup tabs. Leverage existing `Frontpanel` or `Jack` components from `app/components/`.
- [x] **Embedded quick-start previews** — Render first 2-3 steps of manual inline on the product overview, with a "Read full manual" link.
- [x] **Structured release-note views** — Create a changelog component that reads from `support-manifest` or a new release-notes data source, displayed on Software and Downloads tabs.
- [x] **Guided troubleshooting flows** — Add a simple decision-tree component to product Support tabs, backed by structured FAQ data.
- [x] **Patch and program browsers** — Improve the patches index and module-level patches with filtering, tagging, and preview.

---

## Appendix B: Workstream Breakdown

This section separates the implementation work into three parallel workstreams: UX and Design, Content, and Engineering. Each workstream has its own deliverables and dependencies, but all converge at phase boundaries.

### UX and Design Workstream

#### Phase 0 deliverables

- Canonical terminology map for all user-facing labels
- Wireframes or sketches for revised Support and Docs index cards
- Wireframes for Getting Started split-path entry point
- Review of current HubNavBar sticky-nav behavior and mobile responsiveness

#### Phase 1 deliverables

- Final label and description copy for MegaMenu, Support, and Docs index
- Card designs for task-oriented Support page
- Split-path layout for Getting Started
- Review of Connect page messaging hierarchy

#### Phase 2 deliverables

- Design for Learn, Setup, and Support product-hub tabs
- Design for expanded download entries with version context
- Design for human-readable Specs summary layout
- Review of tab ordering and mobile overflow behavior on HubNavBar

#### Phase 3 deliverables

- Template audit across all product types
- Cross-linking and related-product recommendation patterns
- Search result presentation review

#### Phase 4 deliverables

- Interactive diagram component design
- Troubleshooting flow interaction model
- Patch browser filtering and preview design

### Content Workstream

#### Phase 0 deliverables

- Content audit spreadsheet for every product: what exists, what is missing, what needs rewriting
- Terminology decisions documented
- Audience-path analysis for Getting Started content

#### Phase 1 deliverables

- Revised copy for MegaMenu items, Support cards, Docs index cards, and Connect page
- Draft content split for Getting Started: modular path vs. Videomancer path
- Short descriptions for every download file currently shown without context
- Removal or replacement of outdated documentation-site wording

#### Phase 2 deliverables

- Learn tab content for each instrument: curated link list with one-line descriptions
- Setup tab content for each instrument: prerequisites, steps, diagrams
- Support tab content: FAQ, troubleshooting, escalation for instruments and modules
- Human-readable Specs summaries for all active products

#### Phase 3 deliverables

- Full support-manifest population for all active products
- Related-product descriptions
- Cross-link audit: every manual, doc, and download page must have a clear back-link

#### Phase 4 deliverables

- Structured FAQ data for guided troubleshooting flows
- Patch and program metadata for browser views
- Release-note copy for structured changelog views

### Engineering Workstream

#### Phase 0 deliverables

- Route and data audit results documented (hub-loaders, product-slugs, support-manifest, lzxdb)
- Confirmation of data-model gaps (missing fields in `LzxModuleAsset`, `SUPPORT_MANIFEST`, etc.)
- HubNavBar mobile and sticky-nav behavior verified

#### Phase 1 deliverables

- MegaMenu label edits in `app/components/MegaMenu.tsx`
- Support page card edits in `app/routes/($lang).support.tsx`
- Docs index card edits in `app/routes/($lang).docs._index.tsx`
- Connect page rewrite: replace `CONNECT_RELEASES_URL` GitHub link with per-platform direct download URLs in `app/routes/($lang).connect.tsx`
- Getting Started route split: new sub-routes (`getting-started.learn.tsx`, `getting-started.modular.tsx`) and entry-point refactor
- Homepage CTA update in `app/routes/($lang)._index.tsx`
- Download description rendering improvements
- Back-link additions to product-level download pages
- Add `description`, `version`, `platform`, `releaseDate` fields to `LzxModuleAsset` parser in `app/data/lzxdb.ts` and populate in `db/lzxdb.Asset.json`

#### Phase 2 deliverables

- New sub-routes: `instruments.$slug.learn.tsx`, `instruments.$slug.setup.tsx`, `instruments.$slug.support.tsx`, `instruments.$slug.specs.tsx`
- New sub-routes: `modules.$slug.support.tsx`
- Hub layout tab additions in `app/routes/($lang).instruments.$slug.tsx` (add Learn, Setup, Specs, Support to `HubTab[]`) and `app/routes/($lang).modules.$slug.tsx` (add Support)
- Hub-loader extension: add `connectors`, `controls`, `features`, `patches` to `InstrumentHubData` in `app/data/hub-loaders.ts`
- Download entry rendering with version and release-note fields
- Specs summary component for both module and instrument specs pages

#### Phase 3 deliverables

- Template standardization across all instrument and module hubs
- Support-manifest schema and population tooling
- DocsSearch improvements for task-oriented results
- MegaMenu restoration of deferred nav items per `docs/draft-nav-review.md`

#### Phase 4 deliverables

- Interactive diagram component (Setup tabs)
- Quick-start preview component (Overview tabs)
- Changelog component (Software and Downloads tabs)
- Troubleshooting decision-tree component (Support tabs)
- Patch browser with filtering and preview

### Cross-Workstream Dependencies

| Dependency                        | Blocking                                      | Blocked By      |
| --------------------------------- | --------------------------------------------- | --------------- |
| Terminology map                   | Engineering Phase 1, Content Phase 1          | UX Phase 0      |
| Content audit spreadsheet         | Engineering Phase 2                           | Content Phase 0 |
| Revised copy for cards and labels | Engineering Phase 1                           | Content Phase 1 |
| Learn and Setup tab content       | Engineering Phase 2 sub-routes                | Content Phase 2 |
| Support-manifest population       | Engineering Phase 3 template standardization  | Content Phase 3 |
| FAQ structured data               | Engineering Phase 4 troubleshooting component | Content Phase 4 |
| HubNavBar mobile review           | Engineering Phase 2 tab additions             | UX Phase 2      |

---

## Appendix C: Route and Component Reference

Quick reference for all files involved in this plan.

### Product hub layouts

- `app/routes/($lang).instruments.$slug.tsx` — instrument hub layout, defines `HubTab[]`
- `app/routes/($lang).modules.$slug.tsx` — module hub layout, defines `HubTab[]`

### Product hub sub-routes (instruments)

- `app/routes/($lang).instruments.$slug._index.tsx` — overview
- `app/routes/($lang).instruments.$slug.manual.tsx` — manual layout
- `app/routes/($lang).instruments.$slug.manual._index.tsx` — manual index
- `app/routes/($lang).instruments.$slug.manual.$.tsx` — manual catch-all
- `app/routes/($lang).instruments.$slug.videos.tsx` — videos
- `app/routes/($lang).instruments.$slug.downloads.tsx` — downloads

### Product hub sub-routes (modules)

- `app/routes/($lang).modules.$slug._index.tsx` — overview
- `app/routes/($lang).modules.$slug.manual.tsx` — manual layout
- `app/routes/($lang).modules.$slug.manual._index.tsx` — manual index
- `app/routes/($lang).modules.$slug.patches.tsx` — patches
- `app/routes/($lang).modules.$slug.videos.tsx` — videos
- `app/routes/($lang).modules.$slug.downloads.tsx` — downloads
- `app/routes/($lang).modules.$slug.specs.tsx` — specs

### Global site-level pages

- `app/routes/($lang).support.tsx` — support hub
- `app/routes/($lang).docs._index.tsx` — documentation index
- `app/routes/($lang).docs.$.tsx` — documentation catch-all
- `app/routes/($lang).downloads.tsx` — global downloads directory
- `app/routes/($lang).connect.tsx` — LZX Connect page
- `app/routes/($lang).getting-started.tsx` — getting started
- `app/routes/($lang).glossary._index.tsx` — glossary
- `app/routes/($lang).legacy.tsx` — legacy modules
- `app/routes/($lang).systems.tsx` — starter systems
- `app/routes/($lang).artists.tsx` — artists
- `app/routes/($lang).b-stock.tsx` — B-stock redirect

### Key components

- `app/components/HubNavBar.tsx` — sticky product-hub tab bar
- `app/components/MegaMenu.tsx` — global navigation with `MENU_GROUPS`
- `app/components/Breadcrumbs.tsx` — breadcrumb navigation
- `app/components/DocsSearch.tsx` — documentation search

### Data layer

- `app/data/hub-loaders.ts` — `loadModuleHubData()`, `loadInstrumentHubData()`, `getRecommendedProducts()`
- `app/data/product-slugs.ts` — `getSlugEntry()`, `getCanonicalSlug()`, `getAllModuleSlugs()`, `getAllInstrumentEntries()`
- `app/data/support-manifest.ts` — `SUPPORT_MANIFEST` with manual versions and related products
- `app/data/lzxdb.ts` — lzxdb accessors: `getModuleById()`, `getModuleAssets()`, `getModuleConnectors()`, etc.
- `app/data/fragments.ts` — GraphQL fragments for Shopify queries
- `app/data/cache.ts` — `CACHE_SHORT`, `CACHE_LONG`, `CACHE_NONE`

---

## Summary

The website already contains most of the pieces it needs. The next stage is to turn those pieces into a coordinated product experience where product pages become the center of gravity and support resources feel connected, guided, and easier to use.

---

## Appendix D: Pre-Implementation Validation Checklist

Before starting implementation on any phase, confirm these prerequisites:

### Phase 0 prerequisites

- [ ] All route files listed in Appendix C exist and are loadable
- [ ] `yarn run typecheck` passes
- [ ] `yarn run dev` starts without errors
- [ ] Videomancer product page loads at `/instruments/videomancer` with all tabs functional
- [ ] Global Support, Docs, Downloads, Connect, and Getting Started pages all render correctly

### Phase 1 prerequisites

- [ ] Canonical terminology map has been decided and documented
- [ ] Content for revised Support cards, Docs index cards, and MegaMenu labels has been written and approved
- [ ] Getting Started content split has been reviewed (which content goes where)
- [ ] `db/lzxdb.Asset.json` has been updated with `description` fields for all assets currently displayed on the Downloads page
- [ ] Direct download URLs for LZX Connect platform binaries have been confirmed (to replace the GitHub releases page link)

### Phase 2 prerequisites

- [ ] Learn tab content for Videomancer has been written (7 card descriptions from the content inventory table)
- [ ] Setup tab content for Videomancer has been extracted or drafted from `quick-start.md`
- [ ] FAQ items for Videomancer Support tab have been drafted
- [ ] `SUPPORT_MANIFEST` has been extended with `setupPrerequisites`, `connectSupported`, and `faqItems` schema
- [ ] `InstrumentHubData` hub-loader extension has been designed (adding connectors, controls, features, patches)

### Phase 3 prerequisites

- [ ] Videomancer pilot hub has been deployed and validated
- [ ] Feedback from Videomancer pilot has been collected
- [ ] `SUPPORT_MANIFEST` entries have been drafted for all active modules and instruments
- [ ] Template standardization rules have been reviewed across all product types
