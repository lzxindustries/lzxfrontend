---
draft: false
title: "P: Passive Potentiometer"
image: /img/modules/pot/pot-diagrams/pot_front-panel.png
description: "Documentation for P, a passive potentiometer module for manual voltage attenuation in a modular video system."
---

import pot_front_panel from '/img/modules/pot/pot-diagrams/pot_front-panel.png';
import pot_controls_connectors_indicators from '/img/modules/pot/pot-diagrams/pot_controls-connectors-indicators.png';
import pot_crossfade from '/img/modules/pot/pot-diagrams/pot_crossfade.gif';
import pot_fade_to_black from '/img/modules/pot/pot-diagrams/pot_fade-to-black.gif';
import pot_mounting_power_sync from '/img/modules/pot/pot-diagrams/pot_mounting-power-sync.png';

# P
<span class="head2_nolink">Passive Potentiometer</span>

<!--
## Overview
-->

<img src={pot_front_panel} alt="pot_front_panel" />

## Key Specifications

| Parameter         | Value                                                                           |
| ----------------- | ------------------------------------------------------------------------------- |
| Mounting Width    | 2 HP                                                                            |
| Power Consumption | None                                                                            |
| Power Connectors  | None                                                                            |
| Video Sync        | None                                                                            |

---

<!-- 
## System Integration Advice -->


## Controls & Connectors

<img src={pot_controls_connectors_indicators} alt="pot_controls_connectors_indicators" />

## Operation

---

## Installation

<img src={pot_mounting_power_sync} alt="pot_mounting_power_sync" />

### Requirements

* EuroRack enclosure.
* Two M2.5 x 6mm mounting screws, or screws provided or specified by the enclosure manufacturer.
* #1 Phillips head screwdriver, or hand tool provided or specified by the enclosure manufacturer.

### Procedure

* Power off and disconnect the EuroRack enclosure's power supply and any attached DC adapters.
* Ensure that no mounting screws are in any holes in the area where you wish to mount the module.
* Carefully test fit the module in the open space in the EuroRack enclosure. If it is obstructed by the enclosure or any internal assemblies, abort this procedure.
* Mount the module to the EuroRack rails using all mounting holes.
* Power on the EuroRack enclosure and start patching.

---

 
## Full Specifications

|                              |                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Mounting Width               | 4 HP                                                                            |
| Mounting Hole Count          | 2                                                                               |
| Power Consumption            | 12V @ 50 mA                                                                     |
| Power Connectors             | 10 pin EuroRack ribbon, 2.1mm DC barrel                                         |
| Input Impedance              | 1M ohms                                                                         |
| Output Impedance             | 75 ohms                                                                         |
| Input Protection Range       | +/-20V                                                                          |
| Input Clipping Range         | +/-2.5V                                                                         |
| Output Range                 | +/-2.5V                                                                         |
| Module Width                 | 20.32 mm                                                                        |
| Module Height                | 128.5 mm                                                                        |
| Product Box Width            | 4 in / 101.6 mm                                                                 |
| Product Box Height           | 2 in / 50.8 mm                                                                  |
| Product Box Depth            | 6 in / 152.4 mm                                                                 |
| Included                     | DC barrel power cable, EuroRack power cable, four reversible panels: black, red, green and blue |
| EuroRack Power Cable Type    | 10-pin to 16-pin                                                                |
| EuroRack Power Cable Length  | 25 cm                                                                           |
| DC Barrel Power Cable Length | 25 cm                                                                           |
| RoHS Compliance              | Manufactured with lead-free processes.                                          |
| Video Sync                   | None                                                                            | 

<!--
| Manufacturer Part Number     |                                                                                 |
| Pronunciation                |                                                                                 |
| Mounting Depth               | TODO mm                                                                         |
| Propagation Delay            | TODO                                                                            |
| Bandwidth @ -3dB             | TODO                                                                            |
| Module Depth                 | TODO mm                                                                         |
| Product Weight               | TODO                                                                            |
-->

---

## Maintenance

Keep the module free of dust and debris by performing periodic cleaning. Spots may be cleaned from the front panel with a microfiber cloth and isopropyl alcohol or other electronics cleaner.

<!-- ## Troubleshooting -->

---

## Hardware Revisions

The hardware revision code is printed on the circuit board visible from the rear of the module.

### POT-RevA

Initial production version. February 2025.

POT-RevA Schematic Diagram
&nbsp;<br />
[Download PDF](/pdf/modules/pot/POT-REVA_Schematic_Diagram.pdf)

Interactive Bill of Materials (ZIP)
&nbsp;<br />
[Download ZIP](/zip/modules/pot/POT-REVA_Interactive_Bill_of_Materials.zip)

---

## DIY 

P is available as an assembled module, a full DIY kit, or a partial DIY kit.

Downloads for the complete schematic and an interactive HTML Bill of Materials are found in the [Hardware Revisions](/docs/modules/pot#hardware-revisions) section above.

### Partial DIY Components

The partial DIY kit from LZX includes the printed circuit board and front panel. The following components must be purchased separately from electronics parts vendors.

| Manufacturer                        | Manufacturer Part Number | Description                              | Quantity  | Reference Designators     |
| ----------------------------------- | ------------------------ | ---------------------------------------- | --------- | ------------------------- |
| Wenzhou QingPu Electronics Co., Ltd | WQP-WQP518MA             | 3.5mm Jack Mono Switched                 | 3         | J1, J2, J3                |
| Alps Alpine                         | RS45111A6A08             | 45mm Slide Potentiometer                 | 1         | P1                        |

### Assembly Instructions

This assembly job is recommended for intermediate level DIYers who are comfortable soldering thru hole joints in close proximity to surface mounted parts.

1. Mount and solder front facing jacks and slide potentiometer.
2. Attach the frontpanel and secure it with mounting nuts for the jacks.

