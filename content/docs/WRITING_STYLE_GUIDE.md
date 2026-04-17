---
draft: true
---

# LZX Technical Manual — Writing Style Guide

> **Purpose**: This document is a comprehensive model of the writing voice, tone, and style used in the LZX Technical Manual module documentation. It is designed so that AI systems can absorb its full context and generate new documentation that is nearly indistinguishable from the existing body of work.

---

## 1. Voice & Persona

### Identity

The writer is a deeply knowledgeable expert in analog video synthesis who is also an articulate educator. The voice belongs to someone who has designed and built these modules, understands their circuitry at the component level, and genuinely wants users to unlock the creative potential of the hardware. There is no corporate polish or marketing gloss — this is an engineer-artist speaking directly to fellow practitioners.

### Authority Level

- Speaks with quiet, earned authority. Never condescending, never uncertain.
- Uses definitive statements: "Proc is a fundamental component of any LZX-compatible modular system." Not "Proc could be considered a useful addition."
- Comfortable making bold claims when warranted: "No other commercial tool, analog or digital, can do what Stairs does."
- Acknowledges limitations and trade-offs honestly: "This level of flexibility comes at the expense of greater system size and more complex patches."

### Relationship to the Reader

- Addresses the reader as a peer, a fellow synthesist or artist. Uses "we" and "you" interchangeably when discussing patch operations.
- "We" is collaborative: "we need geometries oriented along diagonals," "we can subtract one video signal from another."
- "You" is direct and instructional: "You decide exactly how color is mutated," "feel free to go crazy and patch whatever weirdness you want."
- Never uses "I" — the voice is the product/brand, not a personal narrator.

---

## 2. Tone

### Primary Tone: Confident, Enthusiastic, Direct

The writing radiates competence and enthusiasm without being breathless or hyperbolic. It conveys genuine excitement about the creative possibilities of the hardware.

**Characteristic phrases and patterns:**

- "Far from trivial, Matte greatly expands the potential of the video synth..."
- "That may not sound very exciting at first, but ANGLES is the key to..."
- "But that is just the beginning."
- "The creative potential of FKG3 goes far beyond a standard video mixer."

### Secondary Tone: Practical and Grounded

Immediately after building excitement, the writing grounds itself in practical reality. There is always a "here's how it actually works" follow-through.

**Pattern**: Aspirational statement → concrete technical explanation → practical application.

Example:

> "Swatch makes it possible to manipulate color in many unique and spectacular ways. Suddenly, all existing single-channel processing modules effectively work in color." → (then explains the YIQ color space mechanics) → (then provides example patches)

### Warmth and Humor

- Occasional dry wit and personality: "there's only one key to rule them all" (FKG3), "Season to taste" (Stairs), "but it's a bug, it's a feature" (Stairs).
- Pop culture or domain references are rare but natural when they appear.
- Uses exclamation marks sparingly — roughly 1-3 per entire module document, typically for creative encouragement: "go wild and crazy with novel, unique, and unexpected wipe shapes!"
- Occasional use of informal/colloquial phrasing: "go crazy," "freaky sort of layering," "weird and wonderful ways."

### What the Voice NEVER Does

- Never apologizes for complexity.
- Never uses filler phrases like "It's worth noting that" or "It should be mentioned."
- Never hedges unnecessarily with "might," "perhaps," or "possibly" when describing technical facts.
- Never uses buzzwords, jargon soup, or marketing language like "revolutionary," "game-changing," or "best-in-class."
- Never talks down to the reader.
- Never uses first person singular ("I").

---

## 3. Diction & Word Choice

### Technical Vocabulary

The writer employs precise domain-specific vocabulary without apology and without over-explaining common terms:

- **Freely used without definition**: ramp, oscillator, attenuverter, normalled, comparator, wavefolder, rectification, luminance, chrominance, unipolar, bipolar, genlock.
- **Defined on first use when introducing less common concepts**: "macron" (the bar over letters), "quadrilateral" (re-defined in context of Stacker), "gamut" (defined in Swatch).
- **Video production terms used naturally**: key, matte, compositor, wipe, crossfader, proc amp, pedestal, IRE, color bars.

### Preferred Terms and Constructions

| Prefer                     | Avoid                                                      |
| -------------------------- | ---------------------------------------------------------- |
| "patched" / "patch"        | "connected" / "connect" (for signal routing)               |
| "signal" or "source"       | "input signal" (redundant)                                 |
| "knob" or "pot"            | "dial" or "rotary control"                                 |
| "jack"                     | "port" or "socket"                                         |
| "module"                   | "unit" or "device" (for EuroRack modules)                  |
| "the synth" / "the system" | "your synthesizer setup"                                   |
| "output" / "result"        | "yields" (except occasionally)                             |
| "operates" / "works"       | "functions" (as verb, except in specific technical senses) |
| "values"                   | "levels" (for voltage amounts)                             |
| "adjust" / "set"           | "configure" or "modify"                                    |
| "turn the knob"            | "rotate the control"                                       |
| "patch a signal into"      | "route a signal to"                                        |
| Bold **term** on first use | Italicized _term_ on first use                             |

### Signal Description Language

When describing what a signal does or how it transforms:

- Uses concrete visual language: "highlights are blasted out, blacks are crushed"
- Describes voltage behavior in terms of visual results: "the darker, lower values" not "low-amplitude signal components"
- Freely mixes electrical engineering and visual art language: "bias the color components up or down," "cropping the lower source values"

### Analogies and Cross-References

- Regularly draws analogies to familiar tools: "roughly correspond to the Photoshop blend modes of Add, Minimum, Maximum, and Difference"
- References broadcast video terminology when relevant: "waveform monitor," "vectorscope," "proc amp"
- Audio synthesis comparisons when illuminating: "Just as an audio wavefolder produces rich timbres from simple waveforms..."
- Uses aphorism-style statements for memorable rules of thumb: "In modular video, you can never have enough Procs."

---

## 4. Sentence Structure & Rhythm

### Sentence Length

Varies significantly to create natural rhythm. The writing avoids monotonous same-length sentences.

**Short declarative sentences** anchor key points:

- "Stairs is unprecedented."
- "Keychain is not a compositor."
- "SMX3 doesn't generate any voltages, so it can't bias a signal."
- "But that's hardly scratching the surface."

**Medium-length sentences** carry the majority of explanations:

- "Each channel sums the A and B inputs, plus an internally generated static voltage C."
- "The output can be expressed as the sum of jack A, plus the product of jack B and potentiometer B, plus potentiometer C."

**Longer sentences** appear in technical explanations where precise qualification is needed:

- "Sending a video signal into Steps CV takes us into very interesting territory: frequency modulating an image with another image!"
- "RGB inputs are weighted and summed according to the luminance formula fully explained in the TBC2 documentation."

### Sentence Patterns

**Leading with the subject (module or feature):**

- "DSG3 is a versatile multi-function generator optimized for creating 2D shapes."
- "Proc is a triple voltage processor and summing amplifier."
- "FKG3 serves a wide range of creative image compositing functions."

**Present tense, active voice** is dominant:

- "Ribbons digitally samples any video source."
- "Contour removes the lower frequency components."
- "Each output provides a different blending operation."

**Imperative mood** for instructions and encouragement:

- "Patch a signal into the Red input."
- "Set the Softness to maximum."
- "Feel free to experiment."
- "Season to taste."

**Conditional constructions** for practical advice (sparingly):

- "If the system is intended to genlock to an external source..."
- "If you're not able to isolate the value range you want, then bias the signal up or down."

### Paragraph Structure

- **Opening sentence** delivers the key idea or function.
- **Body sentences** elaborate with specifics — how it works, what to expect.
- **Closing sentence** (when present) often pivots to creative implication or a practical tip.

Typical paragraph length: 2-5 sentences. Single-sentence paragraphs are used for impact or to transition between ideas.

---

## 5. Section-Level Structure

### Overview Section

- **Opening sentence**: A confident one-liner stating what the module IS and what it does. Uses the module code as subject.
  - Pattern: "[MODULE] is a [descriptor] for [primary function]. Its [feature] can [creative application]."
  - Example: "DSG3 is a versatile multi-function generator optimized for creating 2D shapes."
- **Second/third sentence**: Expands on creative possibilities with enthusiasm.
  - "It can create complex effects, adding great visual interest to patterns and images."
- **Feature list** (optional): Bulleted list of core functions, formatted with bold terms and brief plain-language descriptions.
- **Legacy subsection** (optional): Traces the module's lineage through previous LZX product generations. Uses past tense for predecessors, present tense for the current module. Always positions the current module as an evolution or improvement, never a replacement.

### Key Specifications Section

- Always a simple two-column table with pipe formatting.
- Standard rows: Mounting Width, Power Consumption, Power Connectors, Included, Video Sync.
- Values are terse and factual. No prose.

### System Integration Advice Section

- Explains the module's role within a larger modular system.
- Discusses pairings with other modules by name.
- Uses language like "pairs well with," "essential for," "particularly valuable for."
- Often includes practical rules of thumb: "a reasonable rule of thumb is that a system will need one Proc per approximately 100 HP."
- May define terminology when concepts are important for understanding the module's role.

### Controls & Connectors Section

- Systematic walkthrough of the front panel, usually top-to-bottom or input-to-output.
- Bold formatting for control names: **Threshold**, **Softness**, **Gain**, **Bias**.
- Describes internal normalling behavior explicitly.
- Uses admonitions (:::note, :::tip, :::warning) for voltage range limits, gotchas, and pro tips.

### Operation Section

- The longest prose section. This is where the writer's voice is most distinctive.
- Subsections are organized by function or concept, not by physical panel layout.
- Freely employs KaTeX math notation for formulas.
- Alternates between technical explanation and creative encouragement.
- Frequently cross-references other modules: "Patching into Green yields a signal strength of approximately 0.7" — the writing trusts the reader to act on concrete numbers.
- Closes subsections with creative invitations: "This opens up many creative possibilities..."

### Example Patches Section

- Brief title (### heading) describing the patch concept.
- 1-3 sentence description of what the patch achieves and why it's useful.
- Followed by an image (diagram/animation).
- Descriptions are practical and concrete, not aspirational.

### Installation Section

- Nearly identical across all modules (boilerplate with minor variations).
- Uses bulleted lists for both Requirements and Procedure.
- Safety-first ordering: power off → connect cables → test fit → mount → power on.
- Always ends with: "Power on the EuroRack enclosure and start patching."

### Full Specifications Section

- Three-column table layout: front panel diagram | Connectors table | Controls table.
- Technical Data table below with exhaustive specs.
- Uses consistent parameter naming.

### Maintenance Section

- Single paragraph, nearly identical boilerplate:
  - "Keep [your module / the module] free of dust and debris by performing periodic cleaning. Spots may be cleaned from the [frontpanel / front panel] with a microfiber cloth and isopropyl alcohol or other electronics cleaner."

### Hardware Revisions Section

- Single standard line: "The hardware revision code is printed on the circuit board visible from the rear of the module."

---

## 6. Grammar & Mechanics

### Tense

- **Present tense** for describing module behavior: "DSG3 outputs two independent quadrilateral figures."
- **Past tense** only for Legacy sections describing predecessors: "It was preceded by the Expedition series module Staircase."
- **Imperative** for installation and patching instructions: "Connect the sync cable."

### Person

- Second person "you" for direct instruction.
- First person plural "we" for collaborative exploration: "we can subtract one video signal from another."
- Third person for the module as subject: "Contour removes the lower frequency components."

### Articles and Determiners

- Modules are referred to without articles when used as proper nouns: "Proc is a fundamental component," "Patch a signal into Contour."
- Uses "the" when referring to a specific instance: "the ESG3 sync output," "the B input."
- Uses "a/an" for generic references: "a sync distribution amplifier," "an encoder."

### Punctuation

- **Em dashes** are used for interjections and asides: "as always, that's just a suggestion" — but formatted with spaces on both sides (`—`) or as parenthetical clauses.
- **Semicolons** are rare; compound sentences typically use commas with conjunctions.
- **Colons** introduce lists or explanations: "Core functions of SMX3 include:"
- **Parentheses** for inline clarification of technical terms: "(amplitude/gain)", "(bias/offset)".
- **Oxford comma**: used consistently in lists: "attenuation, inversion, and bias."

### Capitalization

- Module names are UPPERCASE when used as product names: DSG3, ESG3, ANGLES, Proc, Keychain.
  - Exception: some modules use mixed case as proper nouns: Proc, Keychain, Stairs, Contour, Ribbons, Matte, Swatch, Switcher, Stacker, Angles, Factors, Scrolls.
- Control names are **Bold** on first significant use: **Threshold**, **Softness**, **Gain**.
- Section headings use Title Case for H2 (##) and Sentence case or Title Case for H3 (###).
- Signal types are lowercase: "horizontal ramp," "vertical ramp," "sine wave."
- Color components are lowercase when generic ("red channel"), uppercase when referencing specific module labels ("Red input").

### Numbers and Units

- Spelled out for single digits in prose: "three channels," "two inputs."
- Numerals for specifications and measurements: "12 HP," "8 HP," "42 mm."
- Voltage values always use numerals with units: "0 to +1 volts," "+/-2.5V," "0.5 volts."
- Current: "12V @ 350 mA" (with @ symbol, space before mA).
- Frequency: described in context rather than raw Hz values, except when necessary: "seven nanoseconds."
- HP (Horizontal Pitch) is always abbreviated after first use.

---

## 7. Formatting Conventions

### Bold

- Module control/feature names on first prominent use: **Threshold**, **Size**, **Ratio**, **Steps**, **Phase**.
- Emphasis on key concepts or modes: **Edge** outline mode, **Luminance Key** mode.
- Items in enumerated operations: "both H **and** V keyers."

### Italics

- Introducing defined terms: _layering_, _blending_, _compositing_, _matte_, _key_, _macron_.
- Foreign or unusual technical terms on first use: _patch-programmable_.
- Emphasis in prose (rare): "really only looks at the _differences_."

### Code/Monospace

- Not used for module names, control names, or general terminology.
- Reserved only for actual code, file paths, or firmware commands when applicable.

### Admonitions

Three types used regularly:

**:::note** — For clarifications, limitations, and "be aware" information:

> "ESG3 only accepts signals in the unipolar range of 0 to 1 volts."

**:::tip** — For creative suggestions and pro techniques:

> "To extend the low frequency range, supply a positive static voltage to the Freq CV input."

**:::warning** — For critical operational cautions (rare):

> "ESG3 is not a format converter! The DIP switches must match the format of any incoming external sync."

### Math Notation

- KaTeX blocks ($$) for formulas, equations, and signal flow diagrams.
- Inline math ($) for variable names within prose when they appear in formulas.
- Formulas are presented without lengthy derivation — just the results.
- Multiple equivalent representations of the same formula are sometimes listed vertically to aid understanding.

### Tables

- Pipe-delimited Markdown tables with header row.
- Left column is parameter/label, right column is value/description.
- Cells are concise — no full sentences in table cells.

### Lists

- Bulleted lists for features, functions, and non-sequential items.
- Bulleted lists for installation procedures (each step begins with an action verb).
- Numbered lists for calibration procedures and sequential operations.

---

## 8. Content Philosophy

### Explain the "Why," Not Just the "What"

The documentation consistently explains the creative motivation behind technical features, not just their existence:

- Not: "Stacker has a Ratio control."
- Instead: "The Ratio knob adjusts the shape of the window. It sets thresholds for the two inputs in inverse proportion. As the H window size increases, the V window size decreases."

### Bridge Technical and Creative

Every technical explanation eventually connects back to a creative application. The writing never leaves the reader in purely abstract territory:

- "Precision full-wave rectification" → "Convert ramps/sawtooths to triangle waves. Double or quadruple the frequency of oscillators. Apply solarization and color cycling effects to images."

### Acknowledge the Modular Ecosystem

Modules are never described in isolation. Every document references other specific modules by name, explaining how they work together:

- "SMX3 doesn't generate any voltages, so it can't bias a signal. It pairs well with modules that provide static voltages, such as Proc, PGO, and Matte."

### Trust the Reader

The documentation trusts the reader to:

- Understand basic modular synthesis concepts.
- Be comfortable with voltage as a creative medium.
- Apply general principles to novel situations.
- Explore beyond what's explicitly described.

### Encourage Experimentation

The writing repeatedly invites creative risk-taking:

- "Feel free to experiment."
- "As always, feel free to go crazy and patch whatever weirdness you want."
- "go wild and crazy with novel, unique, and unexpected wipe shapes!"
- "Season to taste."

---

## 9. Common Patterns & Sentence Templates

### Opening a Module Overview

```
[MODULE] is a [functional description] for [primary creative purpose]. Its [key feature] can [creative outcome], [adding/creating/enabling] [visual result].
```

### Introducing a Concept

```
[Term] is [definition]. [What it does in practical terms]. [Why it matters creatively].
```

### Describing a Control

```
The **[Control Name]** [knob/switch/input] [sets/adjusts/defines] [parameter]. [Turning/Setting] [direction] [does what]. [At extreme/center position, behavior].
```

### Cross-referencing Another Module

```
[Module X] pairs well with [Module Y] for [purpose]. [Module Y] provides [function that Module X lacks], enabling [creative outcome].
```

### Legacy Comparison

```
[MODULE] is the [nth]-generation [module type] from LZX. It was preceded by the [Series] series [Module Name]. [MODULE] [improves/adds/consolidates] [specific differences]. [It also adds/Unlike predecessor, it] [new capability].
```

### Describing Internal Normalling

```
The inputs are internally self-normalled, allowing a signal patched into [a/an/the] [input] to flow [downward/to] the [other] inputs [below/after] it.
```

### Installation Closing Line

```
Power on the EuroRack enclosure and start patching.
```

---

## 10. Vocabulary Reference — Characteristic Phrases

These phrases recur across multiple documents and define the tonal signature:

- "But that is just the beginning."
- "The full power of [module] is unlocked..."
- "...far beyond what a [conventional/plain/standard] [tool] can do."
- "The number of possible applications is too many to list here."
- "As always, [a general principle holds]."
- "This is merely a suggestion."
- "But as always, feel free to [creative encouragement]."
- "The creative potential of [module] goes far beyond..."
- "This opens up many creative possibilities."
- "...some of which are unique to [module]."
- "...resulting in [a/an] [interesting/fascinating/unique] [visual/creative effect]."
- "Season to taste."
- "...and start patching."

---

## 11. Anti-Patterns — What to Avoid

- **Marketing fluff**: "revolutionary," "next-generation," "industry-leading," "cutting-edge."
- **Hedging when facts are known**: "This might possibly affect the output."
- **Passive voice for actions**: "The signal is processed by the module" → "The module processes the signal."
- **Over-formal language**: "In order to" → "To"; "utilize" → "use"; "prior to" → "before."
- **Unnecessary qualifiers**: "very unique," "extremely simple," "quite easy."
- **Numbered steps for non-sequential operations** (use bullets instead).
- **Inline code formatting for module names or controls** (use bold or plain text).
- **Explaining basic synthesis concepts** that the audience already knows (ramps, oscillators, patch cables).
- **Repeating the module name excessively** within a single paragraph.
- **Feature lists without creative context** — never just list what a module does without explaining why it matters.

---

## 12. Module Category Adaptations

### Gen3 Complex Modules (DSG3, FKG3, DWO3, ESG3, Stairs, Ribbons, Swatch, Switcher)

- Full prose treatment across all sections.
- Detailed Operation section with multiple subsections.
- Legacy subsection comparing to predecessor modules.
- System Integration Advice discusses module pairings and ecosystem role.
- More KaTeX math for signal processing formulas.
- Longer, more narrative voice in Operation sections.

### Gen3 Utility Modules (Proc, SMX3, Contour, Keychain, Stacker, Matte, Angles)

- Still full prose, but somewhat more concise.
- Operation section focuses on practical techniques.
- Example Patches section is often more prominent.
- System Integration emphasizes how the module supports other modules.

### P-Series Modules (PGO, PRM, LNK, P, PAB, MLT)

- Significantly shorter overall.
- May omit Overview prose or keep it to 2-3 sentences.
- Emphasis on Example Patches with diagrams showing patch-programmable configurations.
- System Integration uses bullet-style advice: "**Utility module** for...", "**Expander** to...", "**Building block** for..."
- DIY section included with parts tables and assembly instructions.
- Connectors section uses diagram images rather than prose descriptions.

---

## 13. Usage Instructions for AI Content Generation

When generating new module documentation:

1. **Read existing documentation** for similar module types before writing.
2. **Open with confidence** — the first sentence must establish what the module IS and DOES.
3. **Build excitement naturally** — state the creative potential early, then deliver the technical substance.
4. **Use "we" for exploration, "you" for instruction.**
5. **Bold control names** on first significant use in each major section.
6. **Include KaTeX math** wherever signal processing formulas apply.
7. **Cross-reference other modules** by name throughout — this documentation is an ecosystem.
8. **End installation with**: "Power on the EuroRack enclosure and start patching."
9. **Keep admonitions focused** — one idea per note/tip/warning.
10. **Vary sentence length** — mix short declaratives with longer technical explanations.
11. **Always connect technical features to creative applications.**
12. **Trust the reader** — don't over-explain modular synthesis basics.
13. **Maintain the present tense** for current module behavior.
14. **Use the Legacy pattern** when the module has predecessors.
15. **Match the section structure** to the module category (Gen3 complex vs. utility vs. P-Series).
