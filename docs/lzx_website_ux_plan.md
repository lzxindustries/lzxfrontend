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
- Some journeys still expose implementation details instead of user intent. Example: GitHub releases are a backend source, not a user-facing concept.
- New users need task-oriented entry points, while current owners need maintenance-oriented entry points. The site currently mixes these too loosely.
- The global pages are useful, but they sometimes compete with product pages instead of reinforcing them.

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
- Remove outdated wording that frames documentation as if it lives on a separate system.
- Replace raw doc-link clusters with curated Learn cards and short descriptions.
- Merge software, firmware, and downloads into one clearer user-facing system.
- Reduce visible GitHub dependence in the user journey.
- Clarify technical messaging, especially around supported workflows and limitations.

### Recommended Videomancer page model
- Overview: what it does and who it is for
- Features: key workflows and creative outcomes
- Learn: quick start, manual, guides, fault codes
- Setup: installation, connections, first-run process
- Software and Downloads: Connect, firmware, release notes, manual update path
- Specs and Compatibility: signal formats, environment expectations, limitations
- Support: troubleshooting and contact

### Messaging improvements needed
- Explain what LZX Connect is in user terms before linking away.
- Explain the difference between software download, firmware update, and manual.
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

## Summary
The website already contains most of the pieces it needs. The next stage is to turn those pieces into a coordinated product experience where product pages become the center of gravity and support resources feel connected, guided, and easier to use.
