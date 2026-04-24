---
draft: false
title: 'Castle 101 Quad Gate'
description: 'Castle 101, four CMOS gates for dense Boolean logic in a Castle video digital chain.'
---

# Castle 101 (Quad Gate)

**Castle 101** packs **four** independent **gates** in one module for **high-density** Boolean work: combining **counters**, **shifts**, and **clocks** into **gating** and **synchronous** **masks** without consuming multiple 4 HP slots with single-gate breakouts.

## Role in a patch

After **000 / 001** conversion and **010 / 011** timing, use **101** to **recombine** and **inhibit** conditions before the **matrix** and **output** path. Use consistent **ground** and **return** to keep **crosstalk** low when **toggling** at video-related rates.

## Power and build

**Castle** **5V** / **-5V** (and per-revision **+12V** where required) only; verify **BOM** match to your **silkscreen** revision.

## Further reading

- [Module list](./module-list).
- [Community](https://community.lzxindustries.net) for quad-gate routing examples.
