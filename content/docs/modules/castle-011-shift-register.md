---
draft: false
title: 'Castle 011 Shift Register'
description: 'Castle 011, CMOS 8-bit shift register for video-rate digital patterns in the Castle series.'
---

# Castle 011 (Shift Register)

**Castle 011** is a classic **8-bit shift** stage: new bits enter, older bits **shift** through taps you can use as parallel digital outputs, address lines, and pattern **kernels** in a Castle sub-system.

## Role in a patch

Feed **010** (or an external **clock** into Castle-level logic) to **clock** the register, source **data** from ADCs, comparators, or other gates, and **tap** bits into **100 / 101** combination logic, **counters**, or the **DAC** path.

## Power and build

**Castle** 5V-dominant power and layout; confirm revision-specific notes in the current **assembly** guide.

## Further reading

- [Module list](./module-list).
- Search “Castle 011” on the [community](https://community.lzxindustries.net) for shift-register animation patch ideas.
