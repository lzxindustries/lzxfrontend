---
draft: false
title: 'Castle 001 DAC'
description: 'Castle 001, CMOS dual 8-bit digital to analog (DAC) for the Castle digital video sub-system.'
---

# Castle 001 (DAC)

**Castle 001** is a dual **8-bit digital-to-analog** stage in the **Castle** CMOS line. It turns **digital** patterns (counters, shift registers, matrix logic) back into **control voltages** and small-signal video-rate sources for **Cadet** analog processing and **Gen3** inputs.

## Role in a patch

Place the DAC **after** digital processing when you need smooth or stepped voltages for **modulation**, **keying**, or **coloration** without leaving the Castle + analog chain.

## Power and build

Designed for **Castle** power conventions (+5V / -5V / +12V per revision). Build from the **current** published BOM and panel art; verify revision before assembly.

## Further reading

- [Module list](./module-list) for series context.
- Community threads for patch ideas: [community.lzxindustries.net](https://community.lzxindustries.net).
