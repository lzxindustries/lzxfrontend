# Product Support Content

Per-product support material that populates the `Support` and `Setup`
tabs of a product hub. The `SUPPORT_MANIFEST` in
[`app/data/support-manifest.ts`](../../app/data/support-manifest.ts)
registers every supported slug; the markdown files in this directory
provide the authored copy that the manifest references.

For how this folder fits the wider **product hub** system (tabs, Manual vs
global Docs, canonical URLs), see
[`../docs/PRODUCT_HUB_EDITING.md`](../docs/PRODUCT_HUB_EDITING.md).

Support content is intentionally **optional**. A missing file renders
an empty FAQ section and empty `setupPrerequisites`; the hub still
renders a full Support tab with troubleshooting, forum archive, and
contact information. A file is worth creating only when there are at
least one of:

- One or more frequently asked questions that the manual does not
  already answer head-on.
- Concrete first-run prerequisites (cables, power, displays) that a
  buyer should confirm before power-on.

If you do not have either, do not create a stub file. A stub without
content only clutters the repo and produces no user-visible benefit.

## File contract

Each file is named `<slug>.md` using the **canonical** product slug
from
[`app/data/product-slugs.ts`](../../app/data/product-slugs.ts) (not
the Shopify handle, and not the lzxdb slugified name). The body is
optional; only frontmatter is read.

```md
---
slug: videomancer
setupPrerequisites:
  - 'A display with composite or component video input'
  - 'RCA cables for video connections'
  - 'USB-C cable for firmware updates'
faqItems:
  - question: 'How do I update Videomancer firmware?'
    answer: |
      Use the LZX Connect desktop app to perform guided firmware
      updates. Download it from the [LZX Connect](/connect) page.
---

# Videomancer Support

Per-product support content for the Videomancer instrument. The
frontmatter above is the source of truth for FAQ entries and setup
prerequisites surfaced on the Videomancer support and setup pages.
```

### Fields

- `slug`: canonical product slug. Must match the file name.
- `setupPrerequisites` (optional): array of short strings rendered as
  a "What you'll need" list on the Setup tab. Keep each entry
  concrete and physical: cables, power, displays. No brand marketing
  copy.
- `faqItems` (optional): array of `{question, answer}` pairs.
  - `question`: plain-text; rendered verbatim as the disclosure
    title.
  - `answer`: markdown; rendered to HTML via `getMarkdownToHTML`.
    Inline links are encouraged — point at the manual, LZX Connect,
    or other support pages as needed.

## Voice

Follow the [LZX documentation style guide](../docs/WRITING_STYLE_GUIDE.md).
Support answers are short, direct, and practitioner-facing. They
never apologize for complexity and never advertise.

## When to move content out

FAQ entries that grow beyond two or three paragraphs belong in the
manual, not the support file. Link to the manual heading from a
short FAQ answer instead. The Support tab is a triage surface; the
Manual tab is where detail lives.
