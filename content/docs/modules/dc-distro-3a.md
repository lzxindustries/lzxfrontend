---
draft: false
title: 'DC Distro 3A'
description: '4HP 12V DC power distribution for Gen3 and compatible LZX modules with rear DC barrel power entry, without using a EuroRack ribbon supply.'
---

# DC Distro 3A

DC Distro 3A distributes **12V DC** from a single included **wall adapter** to multiple modules that use **rear 2.1mm DC barrel** power entry—covering the Gen3 EuroRack line and other LZX products that support barrel power, including **Liquid TV**, **Memory Palace**, and **Chromagnon** when used in that power configuration.

## What it does

- **Up to 3A** @ 12V total budget from the included supply, via the distro board.
- **Multiple barrel outputs** for daisy-chaining or short runs to nearby modules.
- **4 HP** — shallow depth requirement (~**2.5 in** / **~64 mm**) so it can sit in tight cases.

**Included:** 12V adapter (100–240V input), the distro module, and **three** DC barrel **jumper** cables in mixed lengths. Shorter and longer **DC power cables** are available separately in the LZX store if you need more reach.

## Integration

Plan current so the sum of your modules’ **+12V** draw (see each manual’s **Key Specifications** table) stays within **3A** and allows headroom. Prefer **star** or **short** distribution patterns over long chains of very thin wire. If you also use **EuroRack ribbon** supplies elsewhere in the case, do not tie conflicting grounds without understanding your **power architecture**; when in doubt, use one clear primary supply strategy per case row.

## Safety

- Use only the supplied **12V, center-positive** adapter unless LZX has documented an approved replacement for your revision.
- Power down before moving barrel connectors if connectors feel loose or warm.

For **EuroRack +12V/-12V** power for the same modules, you still use the **16-pin ribbon** in the usual way; DC Distro is an **alternate** when you are building **barrel-only** or **hybrid** power setups outside a traditional busboard.
