---
title: 'Videomancer User Manual — Change Log vs. lzxtm Source'
description: 'Internal record of all changes between the lzxtm Docusaurus source and the lzxfrontend version of the Videomancer user manual.'
robots: noindex, nofollow
---
**Source:** `/home/lars/lzxtm/docs/instruments/videomancer/user-manual.md`  
**Destination:** `content/docs/instruments/videomancer/user-manual.md`  
**Diff generated:** 2026-05-21  

This document records every change between the original Docusaurus source in the
`lzxtm` repo and the current version in `lzxfrontend`. Changes are grouped by
type. Items marked ⚠️ are potential rendering bugs introduced during migration.

---

## 1. Frontmatter (no content change)

| Field | lzxtm | lzxfrontend |
| :---- | :---- | :---------- |
| `title` | `"User Manual"` (double quotes) | `'User Manual'` (single quotes) |
| `description` | `"Complete documentation…"` (double quotes) | `'Complete documentation…'` (single quotes) |

Quote style was normalized to single quotes to match Prettier config.

---

## 2. HTML Removed or Replaced with Markdown Equivalents

| Original HTML | Replacement | Notes |
| :------------ | :---------- | :---- |
| `<span class="head2_nolink">User Manual</span>` + blank line | Removed entirely | Docusaurus-specific span; not needed in Remix |
| `<span class="system-ui">◉</span>` | `` `◉` `` | Inline code span |
| `<span class="system-ui">○</span>` | `` `○` `` | Inline code span |
| `<span class="system-ui">&harr;</span>` | `` `↔` `` | Unicode character in code span |
| `<span class="system-ui">&darr;</span>` | `` `↓` `` | Unicode character in code span |
| `<span class="code-like-block-vm">…</span>` | ` ```text … ``` ` | Replaced proprietary styled block with standard fenced code block |
| `&nbsp;` indent in code block | Spaces | Used inside the menu tree fenced code block |
| `|   ` pipe-space indent in code block | `│   ` box-drawing character | Standardized box-drawing; one line changed `|   └─` → `│   └─` |

---

## 3. List Bullet Syntax (no content change)

Throughout the document, `*` bullets were converted to `-` bullets and
sub-item indentation was normalized from 4/8 spaces to 2-space increments, per
Prettier/MDX convention. This affects the following sections:

- Capabilities list (§ What Videomancer Does)
- Connectors & Ports list (§ Connectors & Ports)
- Controls list (§ Controls)
- Status Indicators list (§ Status Indicators)
- Analog I/O setup instructions (§ Analog Inputs, Analog Outputs)
- System menu change procedure (§ System Menu)
- Program selection procedure (§ Loading a Program)
- Modulation assignment procedure (§ Choosing a Modulation Operator)
- STATE Preset procedures (load / save / overwrite)

---

## 4. Inline Formatting Syntax (no content change)

`***bold-italic***` replaced with `**_bold-italic_**` (Prettier output). Affects:

- "embedded system" in the Architecture section
- "can" in the Color Space Conversion section
- "have to" and "HDMI input → analog output" in the Analog Signal Path section
- "focused" in the Parameter Display section
- "middle" in the Video Latency section

---

## 5. Escaped Characters

| Location | lzxtm | lzxfrontend | Reason |
| :------- | :---- | :---------- | :----- |
| "* Slider" references (×3) | `&ast;` | `\*` | MDX-safe escape |
| Ring Mod symbol in Modulation Operators table | `*` | `\*` | Prevents accidental italic parsing |

---

## 6. Internal Link Path Updates (Docusaurus → Remix)

All internal links were updated from Docusaurus paths to the Remix route structure.

| Original path | Updated path |
| :------------ | :----------- |
| `/docs/instruments/videomancer/user-manual#firmware-update` | `/instruments/videomancer/manual/user-manual#firmware-update` |
| `/docs/instruments/videomancer/user-manual#video-route-modes` | `/instruments/videomancer/manual/user-manual#video-route-modes` |
| `/docs/instruments/videomancer/user-manual#midi-synchronization` (×2) | `/instruments/videomancer/manual/user-manual#midi-synchronization` |
| `/docs/instruments/videomancer/user-manual#supported-formats-and-standards` | `/instruments/videomancer/manual/user-manual#supported-formats-and-standards` |
| `/docs/instruments/videomancer/user-manual#developer-mode` | `/instruments/videomancer/manual/user-manual#developer-mode` |
| `/docs/instruments/videomancer/modulation-operators.md` (×4) | `/instruments/videomancer/manual/modulation-operators` |
| `/docs/modules/tbc2` | `/modules/tbc2/manual` |
| `/docs/category/program-guides` | Removed (see §8 below) |

---

## 7. Table Formatting (no content change)

Prettier reformatted all tables to normalized column widths. Tables affected:

- Specifications table (§ Specifications)
- Supported Formats table (§ Supported Formats and Standards)
- Analog Input Modes table
- System Settings table
- MIDI Out Mode table
- Modulation Operators quick-reference table (§ Modulation Operator Quick Reference)

No cell values were changed.

---

## 8. Substantive Content Changes

### 8a. Program documentation cross-reference (§ Programs)

**lzxtm:**
> Each Program is seperately documented on its own Program Guide page. The
> complete list of all available Program Guides is found in the documentation
> navigation menu and on the [Programs](/docs/category/program-guides) page.

**lzxfrontend:**
> Programs are documented in this manual and in firmware release notes.

_Rationale:_ Per-program guide pages are being built out separately. The
Docusaurus category link is gone. Simplified pending full program-guide
cross-link strategy.

---

### 8b. microSD Functionality paragraph (§ microSD Card → Functionality)

**lzxtm:**
> Presently, microSD card storage is limited to Programs and Presets.
> Additional functionality is planned, and intended to be integrated with the
> **LZX Connect** desktop application.

**lzxfrontend:**
> MicroSD card storage supports Programs and Presets. [LZX Connect](/connect)
> can install program libraries directly to the card over USB.

_Rationale:_ "Planned" language removed; LZX Connect program library install is
now implemented.

---

### 8c. Developer Mode :::note (§ microSD Card → Functionality)

**lzxtm:**
> By default, Videomancer ignores third party Programs or those with version
> numbers lower than 1.0.0. To load Programs developed by third parties, or
> currently in alpha or beta development stage, [Developer Mode] must be
> enabled. See below.

**lzxfrontend:**
> By default, Videomancer ignores Programs with version numbers lower than
> 1.0.0 and unsigned third-party Programs. Signed community Programs from the
> [Community Programs Library] load without Developer Mode on firmware 1.x.x.
> [Developer Mode] is only needed for unsigned Programs or those currently in
> development (version below 1.0.0).

_Rationale:_ Firmware 1.x.x introduced signed community program releases that
do not require Developer Mode. Note was updated to reflect this.

---

### 8d. microSD scan paragraph (§ microSD Card → Functionality)

**lzxtm:**
> Currently, Videomancer recursively scans … You can organize Programs in any
> folder structure you like, and Videomancer will find them. However, be aware
> that the number of files and folders affects the time it takes for Videomancer
> to boot up. We recommend keeping the microSD card free of any extraneous data
> to minimize boot times.

**lzxfrontend (initial migration):**
> Videomancer recursively scans … You can organize Programs in any folder
> structure you like, and Videomancer will find them. Be aware that the number
> of files and folders affects boot time — keep the microSD card free of
> extraneous data to minimize boot times.

**lzxfrontend (corrected 2026-05-21):**
> Videomancer scans the `programs/` folder on the microSD card for `.vmprog`
> files. Place programs directly in `programs/` or in a vendor subdirectory.

_Correction:_ The original description of unrestricted recursive scanning was
inaccurate. Programs must be placed in the `programs/` folder (with an optional
vendor subdirectory level). The same correction was applied to
`app/components/TroubleshootingFlow.tsx` (programs-not-showing resolution).

---

### 8e. Firmware Update section intro (§ Firmware Update)

**lzxtm:**
> … The process is very simple and only takes a few minutes. It can be
> performed manually through the computer's file browser, or via the **LZX
> Connect** desktop application.

**lzxfrontend:**
> … Firmware files are available from the [Videomancer Downloads] page.

_Rationale:_ The old single-path procedure was split into two subsections (see
§9b). The generic intro was replaced with a Downloads page link.

---

### 8f. Firmware update procedure source link

**lzxtm:**
> Download the desired firmware `.UF2` file from the Videomancer
> [firmware repository](https://github.com/lzxindustries/videomancer-firmware/releases) on GitHub

**lzxfrontend:**
> Download the firmware `.UF2` file from the [Videomancer Downloads] page.

_Rationale:_ Directs users to the site's Downloads page rather than GitHub
directly, keeping them in the product experience.

---

### 8g. Minor grammar

"Windows, Mac or Linux" → "Windows, Mac, or Linux" (Oxford comma added).

---

## 9. New Content Added

### 9a. Program Libraries subsection (§ microSD Card)

Entirely new subsection added after the scan paragraph:

```
#### Program Libraries

Two program libraries are available for Videomancer:

**Official LZX Program Library** — Programs curated by LZX Industries, bundled
with firmware releases or available as a separate library download from the
[Videomancer Downloads] page.

**Community Programs Library** — Third-party Programs signed for Videomancer
firmware 1.x.x, distributed through the videomancer-community-programs
repository. Signed releases load without Developer Mode.

**Installation method 1 — Manual SD card copy:** …

**Installation method 2 — LZX Connect:** …
```

---

### 9b. Firmware Update section restructured into two subsections

The original single "Manual Update Procedure" (flat bullet list) was replaced
with:

1. **`:::caution Upgrading from firmware 0.1.8?`** — New admonition block
   explaining that LZX Connect cannot perform the initial 0.1.8 → 1.x.x
   upgrade, and that LZX Connect must be closed before entering BOOT mode.

2. **`### Manual Update (required for 0.1.8 → 1.x.x; fallback for any version)`**
   — Same steps as before, converted from a flat bullet list to a numbered
   9-step procedure. Also improved step wording (RP2040 explanation; "USB-A"
   removed since any USB port works with a USB-C cable). Source changed from
   GitHub releases URL to the site Downloads page.

3. **`### Update via LZX Connect (1.x.x → newer 1.x.x)`** — Entirely new
   subsection covering the LZX Connect guided update workflow for users already
   on 1.x.x firmware.

4. **`:::note Pre-release firmware`** — New admonition noting that firmware
   1.x.x is currently pre-release and that "Show pre-releases" must be enabled
   in LZX Connect settings to find available updates.

5. **Link to LZX Connect Guide** — Added at end of the LZX Connect update
   subsection.

---

## 10. Content Removed

| Removed content | Location | Reason |
| :-------------- | :------- | :----- |
| `<span class="head2_nolink">User Manual</span>` | Top of body | Docusaurus-only HTML with no Remix equivalent |
| Link to `/docs/category/program-guides` | § Programs | Docusaurus category page; replaced with simplified text |
| Direct link to `github.com/…/videomancer-firmware/releases` | § Firmware Update | Replaced with internal Downloads page link |
| "The process is very simple and only takes a few minutes" | § Firmware Update intro | Simplified tone; not substantively useful |

---

## 11. ⚠️ ~~Potential Rendering Issues (Migration Artifacts)~~ — Fixed 2026-05-21

Both issues below were identified during changelog review and corrected.

### 11a. ~~Modulation operator categories~~ — Fixed

**lzxtm** — correctly formatted nested list:
```markdown
- External signals
        - Audio
        - Control voltages
        - Envelopes & Followers
        - Clocks and Logic
- Internal generative algorithms
        - Oscillators
        - Sequencing & Rhythm
        - Random & Chaos
        - Physics
        - Spatial
- USB devices
        - Mouse
        - Graphics tablet
        - Game controller
        - Joystick
        - Sensor
```

**lzxfrontend** — sub-items collapsed inline:
```markdown
- External signals - Audio - Control voltages - Envelopes & Followers - Clocks and Logic
- Internal generative algorithms - Oscillators - Sequencing & Rhythm - Random & Chaos - Physics - Spatial
- USB devices - Mouse - Graphics tablet - Game controller - Joystick - Sensor
```

The sub-items render as inline dashes, not as list items. The original
8-space indent was non-standard (MDX requires 2 or 4 spaces for nesting), but
the content should be preserved as a nested list with 2-space indent.

---

### 11b. ~~BPM tap tempo instructions~~ — Fixed

**lzxtm** — three separate instruction blocks, each with sub-steps:
```markdown
To change the **BPM** value numerically:
    - Press the **MOTION** button
    - Turn the Rotary Encoder

To change the **BPM** value rhythmically while playback is stopped:
    - Press the **MOTION** button
    - Press the **TAP** button once to begin sampling the tempo
    - Press the **TAP** button again to finish sampling the tempo

To change the **BPM** value rhythmically during playback:
    - Press the **TAP** button once to begin sampling the tempo
    - Press the **TAP** button again to finish sampling the tempo
```

**lzxfrontend** — each block collapsed to a single line:
```markdown
To change the **BPM** value numerically: - Press the **MOTION** button - Turn the Rotary Encoder

To change the **BPM** value rhythmically while playback is stopped: - Press the **MOTION** button - Press the **TAP** button once to begin sampling the tempo - Press the **TAP** button again to finish sampling the tempo

To change the **BPM** value rhythmically during playback: - Press the **TAP** button once to begin sampling the tempo - Press the **TAP** button again to finish sampling the tempo
```

The "- " sequences are inline text, not list items. Steps are unreadable.

---

*End of changelog.*
