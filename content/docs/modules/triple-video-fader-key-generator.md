---
draft: false
title: 'Triple Video Fader & Key Generator'
description: 'Three voltage-controlled wideband crossfaders and three high-speed key generators for Visionary-series LZX systems—luma, chroma, and window keying, plus cascaded fader busses.'
---

# Triple Video Fader & Key Generator

## Role in a patch

The Triple Video Fader &amp; Key Generator (TVFKG) gives you three **independent** voltage-controlled crossfaders, each with its own **key generator** (voltage comparator). You can crossfade, perform analog multiplication–style routings, build luma and chroma keys, window comparisons, and amplitude classification from the same 16 HP without chaining half a row of small utilities.

Cascaded input columns and selectable **crossfader control source** modes (fade from CV, key, or logical AND of all three keys) are what make complex layered patches tractable. Crossfaders 2 and 3 can optionally follow crossfader 1 as a **master** bus—handy for broadcast-style A/B and hold transitions under one shared control.

## Crossfader (per channel)

A voltage-controlled crossfader has two inputs and one output. At **0&nbsp;V** on the control bus, **A** is fully on; at **1&nbsp;V**, **B** is fully on. Between those rails you get a proportional mix. If you feed **B** only, the fader acts like a **VCA** for that channel.

## Key generator (per channel)

Each key is a high-speed **comparator**: when the key input (after conditioning) is above the sum of the CV and bias, the key output is **1&nbsp;V**; otherwise **0&nbsp;V**. Inversion switches let you work with the complement for matte edges and hard wipes.

**CV and bias** inputs include level and inversion; their sum sets the key threshold, and in **fade** mode that same sum can drive the fader position directly. In **key** mode, the key output opens and closes the fader. In **and** mode, a logical **AND** of all three key outputs drives the fader (useful for “all conditions true” gating).

## On the product hub

Open the **Specs** tab for the full connector list, current draw, and LZXdb feature line items. The **Support** tab links troubleshooting and the forum archive. For legacy Visionary build notes, search the [community forum](https://community.lzxindustries.net) for “TVFKG” and “Triple Video Fader”.

## Power and size (summary)

**16 HP** · +12V @ 135 mA (reference from the module database; confirm on **Specs** for your revision).
