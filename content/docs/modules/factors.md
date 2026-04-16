---
draft: false
title: "FACTORS: Triple Four-Quadrant Multiplier"
image: /img/modules/factors/factors-diagrams/factors_front_panel.png
description: "Documentation for FACTORS, a triple four-quadrant multiplier and modulator for amplitude modulation and contrast control."
---

import factors_front_panel from '/img/modules/factors/factors-diagrams/factors_front_panel.png';
import factors_four_q_multiplier from '/img/modules/factors/factors-diagrams/factors_4q-multiplier.png';
import factors_controls_and_connectors from '/img/modules/factors/factors-diagrams/factors_controls-and-connectors.png';
import factors_inversion_lfo from '/img/modules/factors/factors-diagrams/factors_inversion-lfo.gif';
import factors_inversion_midpoint from '/img/modules/factors/factors-diagrams/factors_inversion-midpoint.gif';
import factors_modulate_modulators from '/img/modules/factors/factors-diagrams/factors_modulate-modulators.gif';
import factors_normalled_connections from '/img/modules/factors/factors-diagrams/factors_normalled-connections.png';
import factors_triangle_to_sine from '/img/modules/factors/factors-diagrams/factors_triangle-to-sine.png';
import factors_mounting_power_sync from '/img/modules/factors/factors-diagrams/factors_mounting-power-sync.png';

<!--
import factors_line_art_labeled from '/img/modules/factors/factors-diagrams/factors_line_art_labeled_496x1024.png';
-->

# FACTORS
<span class="head2_nolink">Triple Four-Quadrant Multiplier</span>

<img src={factors_front_panel} alt="Factors front panel" />

## Overview

Factors is a triple four-quadrant multiplier and modulator. It's specifically designed for the LZX patchable video standard of 0 to +1v. Use it to modulate amplitudes, adjust image contrast, or predictably control the transforms of vector graphics.

For video images and patterns, Factors is an amplitude modulator and symmetrical contrast adjuster. The scaling operation is centered on the mid-gray value of 0.5 volts: a "fade to gray". The ability to simultaneously set the black point and white point with a single voltage controllable parameter opens up interesting visual possibilities.

For XY vector graphics, Factors allows transforms (position, rotation, scale) to be centered on the raster or oscillographic figure. An ordinary one- or two-quadrant multiplier or voltage controlled amplifier would perform transforms around a corner of the figure. An ordinary four-quadrant multiplier would perform transforms around the center of the figure, but would require bipolar voltages throughout the patch. Factors is the solution for centered transforms of unipolar signals such as video ramps.

### Legacy

Factors both simplifies and extends the functionality of the Cadet X Multiplier, and of the Expedition series module Bridge. The "fade to gray" paradigm echoes the behavior of the historic Sandin Image Processor, while avoiding the challenges imposed by the bipolar video signals of the IP.

---

## Key Specifications

| Parameter         | Value                                                                           |
| ----------------- | ------------------------------------------------------------------------------- |
| Mounting Width    | 8 HP                                                                            |
| Power Consumption | 12V @ 100 mA                                                                    |
| Power Connectors  | 16 pin EuroRack ribbon, 2.1mm DC barrel                                         |
| Included          | DC barrel power cable, EuroRack power cable                                     |
| Video Sync        | None                                                                            |

---

<!--
## System Integration Advice

TODO
---
-->


## Controls & Connectors

Factors has three discrete multipliers, labeled **1**, **2**, and **3**. As described below, they are internally normalled in series, so you can produce two or three variations on a single pair of sources.

Each multiplier has two inputs, labeled **CV** and **In**. These inputs are actually identical, and the labeling is merely conventional. It may help the artist to keep track of which signals are which. For example, if you wanted to modulate the amplitude of a high frequency video oscillator with a low frequency control signal, it would make sense to think of the high frequency oscillator as the "signal", and the low frequency oscillator as the "modulator". But technically, it doesn't matter which of the pair of signal factors goes into which CV or In jack.

Each input signal goes through an attenuverter before the multiplication operation. These are the knobs labeled **CV1** through **CV3**, and **Gain1** through **Gain3** for the **CV** and **In** jacks, respectively. This makes it easy to dial down or invert the individual signal factors.

<img src={factors_controls_and_connectors} alt="Factors controls and connectors" />

&nbsp;<br />

The inputs are internally self-normalled to cascade from top to bottom. A signal patched into a top row input flows to the other inputs in that column.

<img src={factors_normalled_connections} alt="Factors normalled connections" />

---

## Operation

A conventional four-quadrant multiplier (4QM) is designed to operate on bipolar signals: values that are signed positive or negative. The center of the multiplication operation is at a value of zero. This doesn't work very well in the context of video signals that are always positive. It's also not optimized for XY vector graphics. A conventional 4QM places the origin or pivot point of vector transforms at a corner of the figure rather than in the center. The figure would scale or rotate around a corner point.

<!--
AFR note: I'm skeptical about the educational value of the 4QM diagram. What would really be helpful would be animations showing the difference between transforms originating from the corner of a figure vs. transforms originating from the center of the figure.
-->

<img src={factors_four_q_multiplier} alt="Factors four-quadrant multiplier" />

&nbsp;<br />

<!--
AFR note: I'm fuzzy on the math happening inside Factors. I want to put a formula in here, just like with DSG3, Proc, etc., but I need help with that. The formula in Ramin's illustration made my puny human brain hurt.
-->

Factors solves this problem by performing multiplication operations centered on a value of 0.5 rather than zero. Incoming signals are internally biased down by 0.5 volts, making them bipolar. Then Factors performs a conventional 4QM operation. Finally, Factors biases the resulting product back up by 0.5 volts. The end result is that the pivot point of XY vector transforms is in the center of the figure instead of at a corner. Additionally, the resulting scaling operation doesn't pass through zero, and doesn't flip the image horizontally and vertically. The image never turns inside out, it scales from zero to its maximum size.

Factors is not just for XY vector graphics, it also applies to conventional video images. It gives the artist another tool for manipulating images. An ordinary one-quadrant multiplier or voltage controlled amplifier adjusts the gain of a signal centered on a value of zero volts: a fade to black. Factors modulates the gain of a signal centered on the midpoint of 0.5 volts: a fade to gray.

For low frequency applications, Factors performs proper amplitude modulation on unipolar signals. Complex modulation effects can be achieved by multiplying two unipolar signals, resulting in a unipolar output. No need to complicate the patch with conversions between unipolar and bipolar signals.

---

## Example Patches

### Inversion Around Middle Gray
<img src={factors_inversion_midpoint} alt="Factors inversion around middle gray" />

---

### Voltage Controlled Inversion

<img src={factors_inversion_lfo} alt="Factors voltage controlled inversion" />

---

<!--
### Modulating a Modulator

<img src={factors_modulate_modulators} alt="Factors modulation control" />

---

-->

### Sine Shaping

<img src={factors_triangle_to_sine} alt="Factors sine shaping" />

---


## Installation

<img src={factors_mounting_power_sync} alt="Factors installation" />

### Requirements

* EuroRack enclosure
* 12V DC or EuroRack power supply
* 2.1mm DC barrel power cable **or** a EuroRack power cable (both options included)
* Four M2.5 x 6mm mounting screws, or screws provided or specified by the enclosure manufacturer
* #1 Phillips head screwdriver, or hand tool provided or specified by the enclosure manufacturer

### Procedure

* Power off and disconnect the EuroRack enclosure's power supply and any attached DC adapters.
* Connect either the EuroRack Power Cable **or** the DC Barrel Power Cable to the module. Do not connect both Eurorack and DC Barrel power.
* Ensure that no mounting screws are in any holes in the area where you wish to mount the module.
* Carefully test fit the module with its attached power cable in the open space in the EuroRack enclosure. If it is obstructed by the enclosure or any internal assemblies, abort this procedure.
* Connect the disconnected end of the power cable to the power supply.
* Mount the module to the EuroRack rails using all mounting holes.
* Store the unused cable along with the product box in a safe location. 
* Power on the EuroRack enclosure and start patching.

---

## Full Specifications

<!--
AFR note: there's no line art or controls/connectors legend for Factors on the main product page
-->

| Parameter                    | Value                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Manufacturer Part Number     | 950042                                                                          |
| Mounting Width               | 8 HP                                                                            |
| Mounting Depth               | 32 mm                                                                           |
| Mounting Hole Count          | 4                                                                               |
| Power Consumption            | 12V @ 100 mA                                                                    |
| Power Connectors             | 16 pin EuroRack ribbon, 2.1mm DC barrel                                         |
| Input Impedance              | 1M ohms                                                                         |
| Output Impedance             | 75 ohms                                                                         |
| Input Protection Range       | +/-20V                                                                          |
| Input Clipping Range         | +/-2.5V                                                                         |
| Output Range                 | +/-2.5V                                                                         |
| Included                     | DC barrel power cable, EuroRack power cable                                     |
| EuroRack Power Cable Type    | 16-pin                                                                          |
| EuroRack Power Cable Length  | 25 cm                                                                           |
| DC Barrel Power Cable Length | 25 cm                                                                           |
| RoHS Compliance              | Manufactured with lead-free processes                                          |
| Video Sync                   | None                                                                            |

<!--
| Pronunciation                |                                                                                 |
| Propagation Delay            | TODO                                                                            |
| Bandwidth @ -3dB             | TODO                                                                            |
| Module Width                 | TODO mm                                                                         |
| Module Height                | TODO mm                                                                         |
| Module Depth                 | TODO mm                                                                         |
| Product Box Width            | TODO in / TODO mm                                                               |
| Product Box Height           | TODO in / TODO mm                                                               |
| Product Box Depth            | TODO in / TODO mm                                                               |
| Product Weight               | TODO                                                                            |
-->

---

<!--
## Calibration

Explanation of trim pots and calibration procedure

---
-->

## Maintenance

Keep your module free of dust and debris by performing periodic cleaning. Spots may be cleaned from the frontpanel with a microfiber cloth and isopropyl alcohol or other electronics cleaner.

<!-- 
## Troubleshooting

---
-->

---

## Hardware Revisions

The hardware revision code is printed on the circuit board visible from the rear of the module.
