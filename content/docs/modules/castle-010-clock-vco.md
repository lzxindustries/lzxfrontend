---
draft: false
title: 'Castle 010 Clock VCO'
description: 'Castle 010, CMOS clock source and VCO for timing the Castle digital matrix.'
---

# Castle 010 (Clock / VCO)

**Castle 010** supplies **clocks and audio-rate** signals for the **Castle** series: digital timing, sync into shift registers, and **async** or **ramped** control when patched as a VCO. It anchors **series** and **modulo** behavior when you are building a **self-contained digital** sub-patch.

## Role in a patch

Use 010 as the **master or secondary clock** for **Castle 011**, **100**, **101**, and related logic. Patch clock outputs into enable and reset as your composition demands.

## Power and build

**Castle** supply rails and layout rules apply. Follow the **latest** build package for the PCB revision in your hand.

## Further reading

- [Module list](./module-list).
- [Community](https://community.lzxindustries.net) for clock distribution patterns in DIY Castle racks.
