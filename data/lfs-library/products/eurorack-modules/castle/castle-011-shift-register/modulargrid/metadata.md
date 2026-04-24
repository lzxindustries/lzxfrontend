# Castle 011 Shift Register

**Manufacturer:** LZX Industries
**Series:** Cadet
**ModularGrid:** [https://www.modulargrid.net/e/lzx-industries-castle-011-shift-register](https://www.modulargrid.net/e/lzx-industries-castle-011-shift-register)
**MG ID:** 15646
**Status:** Available

## Specifications

| Spec         | Value |
| ------------ | ----- |
| Width        | 4 HP  |
| +12V Current | 21 mA |
| -12V Current | 43 mA |
| +5V Current  | 0 mA  |

## Description

**Shift Register**

The Shift Register is a 4 position memory of sorts. A bit is loaded from the DATA input at a logical “high” signal at the CLOCK input and appears at the Q0 output. At the next high Clock signal the bit is shifted from Q0 to Q1 and a new bit is loaded in to Q0 from DATA. When a bit reaches Q3 it is shifted out of the register. This functions as a delay on a 1-Bit datastream, where the CLOCK determines delay. If the outputs are combined with an XOR gate, an outline is achieved.

---

_Source: [ModularGrid](https://www.modulargrid.net/e/lzx-industries-castle-011-shift-register)_
