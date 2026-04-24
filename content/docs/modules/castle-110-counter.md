---
draft: false
title: 'Castle 110 Counter'
description: 'Castle 110, CMOS counter for address generation and digital rhythm in a Castle sub-system.'
---

# Castle 110 (Counter)

**Castle 110** is a **counting** stage: **clocks** advance a **state** you use as an **address**, **frame phase**, or **divided** sub-multiple in the **Castle** matrix.

## Role in a patch

Drive 110 from **010** (or a qualified external clock at appropriate levels) to **step** through patterns, **select** **matrix** inputs, and **synchronize** events with other **digital** and **analog** modules.

## Power and build

**Castle** supply and **decoupling** as per the board revision. Sync **reset** and **enable** to your **genlock** or **artistic** timing needs.

## Further reading

- [Module list](./module-list).
- [Community](https://community.lzxindustries.net) for counter-based sequencing ideas.
