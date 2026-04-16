---
draft: false
title: "LNK: Passive Links"
image: /img/modules/lnk/lnk-diagrams/lnk_front-panel.png
description: "Documentation for LNK, a passive linking utility module for connecting and distributing signals in a modular video system."
---

import lnk_front_panel from '/img/modules/lnk/lnk-diagrams/lnk_front-panel.png';
import lnk_controls_connectors_indicators from '/img/modules/lnk/lnk-diagrams/lnk_controls-connectors-indicators.png';
import lnk_mounting_power_sync from '/img/modules/lnk/lnk-diagrams/lnk_mounting-power-sync.png';
import lnk_mults from '/img/modules/lnk/lnk-diagrams/lnk_mults.png';
import lnk_understanding_cascading_input_jacks from '/img/modules/lnk/lnk-diagrams/lnk_understanding-cascading-input-jacks.png';

# LNK
<span class="head2_nolink">Passive Links</span>

<img src={lnk_front_panel} alt="lnk_front_panel" />

<!-- ## Overview -->

## Key Specifications

| Parameter         | Value                                                                           |
| ----------------- | ------------------------------------------------------------------------------- |
| Mounting Width    | 4 HP                                                                            |
| Power Consumption | None                                                                            |
| Power Connectors  | None                                                                            |
| Video Sync        | None                                                                            |

---

<!-- 
## System Integration Advice

---
-->

## Connectors

<img src={lnk_controls_connectors_indicators} alt="lnk_controls_connectors_indicators" /> 

---

## Operation

### Understanding Cascading Input Jacks

LNK uses switched, or normalled, connections between its input jacks. With no cable inserted, a signal flows down from one input jack to another. This connection is overridden when a cable is inserted. Normalled inputs are indicated on the front panel with arrows.

<img src={lnk_understanding_cascading_input_jacks} alt="lnk_understanding_cascading_input_jacks" /> 

---

## Example Patches

<img src={lnk_mults} alt="lnk_mults" /> 

---

## Installation

<img src={lnk_mounting_power_sync} alt="lnk_mounting_power_sync" /> 

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

### Technical Data
|                              |                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Mounting Width               | 4 HP                                                                            |
| Mounting Hole Count          | 2                                                                               |
| Module Width                 | 20.32 mm                                                                        |
| Module Height                | 128.5 mm                                                                        |
| Product Box Width            | 4 in / 101.6 mm                                                                 |
| Product Box Height           | 2 in / 50.8 mm                                                                  |
| Product Box Depth            | 6 in / 152.4 mm                                                                 |
| RoHS Compliance              | Manufactured with lead-free processes                                           |
| Video Sync                   | None                                                                            | 

<!-- 
| Manufacturer Part Number     |                                                                                 |
| Pronunciation                |                                                                                 |
| Module Depth                 | TODO                                                                            |
| Mounting Depth               | TODO                                                                            |
| Product Weight               | TODO                                                                            |
| Included                     |                                                                                 |
-->

---


## Maintenance

Keep your module free of dust and debris by performing periodic cleaning. Spots may be cleaned from the frontpanel with a microfiber cloth and isopropyl alcohol or other electronics cleaner.

---

## Hardware Revisions

The hardware revision code is printed on the circuit board visible from the rear of the module.

---

### LNK-RevA

Initial production version, February 2025

LNK-RevA Schematic Diagram
&nbsp;<br />
[Download PDF](/pdf/modules/lnk/LNK-REVA_Schematic_Diagram.pdf)

LNK-RevA Interactive Bill of Materials
&nbsp;<br />
[Download ZIP](/zip/modules/lnk/LNK-REVA_Interactive_Bill_of_Materials.zip)

---

## DIY 

LNK is available as an assembled module, a full DIY kit, or a partial DIY kit.

Downloads for the complete schematic and an interactive HTML Bill of Materials are found in the [Hardware Revisions](/docs/modules/lnk#hardware-revisions) section above.

### Partial DIY Components

The partial DIY kit from LZX includes the printed circuit board and front panel. The following components must be purchased separately from electronics parts vendors.

| Manufacturer                        | Manufacturer Part Number | Description              | Quantity | Reference Designators                             |
| ----------------------------------- | ------------------------ | ------------------------ | -------- | ------------------------------------------------- |
| Wenzhou QingPu Electronics Co., Ltd | WQP-WQP518MA             | 3.5mm Jack Mono Switched | 16       | J1, J2, J3, J4, J5, J6, J7, J8, J9, J10, J11, J12, J13, J14, J15, J16 |

### Assembly Instructions

This assembly job is recommended for intermediate level DIYers who are comfortable soldering thru hole joints in close proximity to surface mounted parts.

1. Mount and solder front-facing jacks.
2. Attach the front panel and secure it with mounting nuts for the jacks.
