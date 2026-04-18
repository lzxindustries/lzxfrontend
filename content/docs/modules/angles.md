---
draft: false
title: 'ANGLES'
image: /img/modules/angles/angles-diagrams/angles_frontpanel.png
description: 'Documentation for ANGLES, a dual horizontal/vertical ramp generator and 24-output fixed ratio mixer for dynamic video compositions.'
---

import { useEffect, useRef, useState } from 'react';

export function ResponsiveYouTube({ videoId }) {
const iframeRef = useRef(null);
const [height, setHeight] = useState(0);

useEffect(() => {
if (iframeRef.current) {
const updateHeight = () => {
const width = iframeRef.current.offsetWidth;
setHeight(width \* 9 / 16); // fallback aspect ratio
};
updateHeight();
window.addEventListener('resize', updateHeight);
return () => window.removeEventListener('resize', updateHeight);
}
}, []);

return (
<iframe
ref={iframeRef}
width="100%"
height={height}
src={`https://www.youtube.com/embed/${videoId}`}
frameBorder="0"
allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
allowFullScreen
title="YouTube video"
style={{ display: 'block' }}
/>
);
}

import angles_frontpanel from '/img/modules/angles/angles-diagrams/angles_frontpanel.png';
import angles_15_135_255_300 from '/img/modules/angles/angles-diagrams/angles_15-135-255-300.png';
import angles_45_degree_tilt from '/img/modules/angles/angles-diagrams/angles_45-degree-tilt.png';
import angles_controls_and_connectors from '/img/modules/angles/angles-diagrams/angles_controls-and-connectors.png';
import angles_dwo3_cv from '/img/modules/angles/angles-diagrams/angles_dwo3-cv.png';
import angles_fixed_ratio_mixer from '/img/modules/angles/angles-diagrams/angles_fixed-ratio-mixer.png';
import angles_fixed_ratio_outputs from '/img/modules/angles/angles-diagrams/angles_fixed-ratio-outputs.png';
import angles_mounting_power_sync from '/img/modules/angles/angles-diagrams/angles_mounting-power-sync.png';
import angles_normalled_connections from '/img/modules/angles/angles-diagrams/angles_normalled-connections.png';
import angles_quadrilateral from '/img/modules/angles/angles-diagrams/angles_quadrilateral.png';
import angles_ramp_generator_outputs from '/img/modules/angles/angles-diagrams/angles_ramp-generator-outputs.png';
import angles_rgb_gradient from '/img/modules/angles/angles-diagrams/angles_rgb-gradient.png';
import angles_triangle from '/img/modules/angles/angles-diagrams/angles_triangle.png';
import angles_line_art_labeled from '/img/modules/angles/angles-diagrams/angles_line_art_labeled_496x1024.png';

# ANGLES

<span class="head2_nolink">Fixed Ratio Mixer & Dual Ramp Generator</span>

<!-- AFR note: these two diagrams freak me out because they show connecting multiple outputs to a single input. I thought that dirty mixing was bad practice. I'm commenting the diagrams out for now. -->

<img src={angles_frontpanel} alt="ANGLES front panel" />

## Overview

ANGLES is a dual horizontal and vertical ramp generator and 24-output fixed ratio mixer. That may not sound very exciting at first, but ANGLES is the key to a full range of dynamic compositions in video synthesis.

Horizontal and vertical waveforms are essential ingredients in most generative patches. But with standard H and V ramps and oscillators, patches can feel constrained within a box. Shapes and patterns are oriented parallel or perpendicular to the video frame. Compositions are visually static even when they're animated, because all geometry is based on right angle relationships. That's fine if you want the feeling of the patch to be solid and constant. However, for lively, dynamic compositions, we need geometries oriented along diagonals.

Synthesizing complex geometries, such as vanishing points or polygons, requires diagonally oriented ramps. ANGLES accomplishes this by mixing H and V ramps in fixed proportions. It lets your patch break out of the box with 24 individual ramps rotated in 15-degree increments. Instead of being limited to 0 and 90 degrees, you can now pick any two angles. 24 options for each of the two paired ramps gives over 500 creative alternatives to the ordinary HV ramp combo.

---

## Key Specifications

|                   |                                                             |
| ----------------- | ----------------------------------------------------------- |
| Mounting Width    | 12 HP                                                       |
| Power Consumption | 12V @ 175 mA                                                |
| Power Connectors  | 10 pin EuroRack ribbon, 2.1mm DC barrel                     |
| Included          | DC barrel power cable, EuroRack power cable, RCA sync cable |
| Video Sync        | Rear RCA in & out                                           |

---

## System Integration Advice

Angles is a great support module to add to a system including one or more of the following: DSG3, DWO3, Stairs, and Keychain. It really shines in systems where its outputs can be distributed throughout the patch to multiple destinations.

---

## Connectors & Indicators

<img src={angles_controls_and_connectors} alt="ANGLES controls and connections" />

&nbsp;<br />
Angles is populated with 32 jacks. The top row of jacks are ramp outputs: horizontal, vertical, inverted horizontal, and inverted vertical.

<img src={angles_ramp_generator_outputs} alt="ANGLES H and V ramp outputs" />

&nbsp;<br />
These ramps are internally normalled into the **A**, **B**, **C**, and **D** input jacks on the second row. If nothing is patched into an input jack, a ramp provides the source to the mixing stages below.

<img src={angles_normalled_connections} alt="ANGLES internal normalling" />

---

## Operation

Each of the 24 outputs is a unique mix of two of the A, B, C, and D inputs. Pairs of sources are mixed at ratios of 1:0, 5:1, 2:1, 1:1, 1:2, and 1:5. This results in mixtures of:

- 100% & 0%
- 83.3% & 16.7%
- 66.7% & 33.3%
- 50% & 50%
- 33.3% & 66.7%
- 16.7% & 83.3%

<img src={angles_fixed_ratio_outputs} alt="ANGLES fixed ratio outputs" />
&nbsp;<br />

When two ramps are mixed, the result is an angled ramp. Different starting orientations and mixing amounts give different angles. ANGLES splits the circle in 24 equal sections, outputting 24 differently angled ramps, in rotational increments of 15 degrees.

<img src={angles_15_135_255_300} alt="ANGLES rotated ramps" />
&nbsp;<br />

But ANGLES is not limited to its internal ramps. Any video or control signal can be mixed with any other signal. This opens up interesting possibilities, such as symmetrical mixes of two sources. For example, one mix of 66.&% A and 33.3% B, and a complementary mix of 33.3% A and 66.7% B.

---

## Video Tutorial

<ResponsiveYouTube videoId="_b633U95ogo" />

[3 Patches for Angles](https://youtu.be/_b633U95ogo)
<br />presented by Johnny Woods

---

## Example Patches

### Waveshape Expander

Patch DWO3 or DSG3 outputs into ANGLES inputs to expand the available waveforms.

---

### Spatial Reference

Patch any two outputs from ANGLES into DSG3 to completely change the orientation of its generated patterns.

<img src={angles_45_degree_tilt} alt="ANGLES patch: DSG3 orientation"/>

---

<!-- ### Oscillator Protractor

Patch outputs from ANGLES into DWO3 inputs to frequency modulate its waveforms at different angles.

<img src={angles_dwo3_cv} alt="ANGLES patch: oscillator frequency modulation" />

--- -->

### Complex Color Field

Use any three outputs from ANGLES as RGB channels to create a complex color gradient. This can be a direct visual element or a source of modulation.

<img src={angles_rgb_gradient} alt="ANGLES patch: complex color gradient" />

---

### Quadrature Expander

Patch a quadrature oscillator into ANGLES' four inputs to create a full spread of 24 different output phases.

---

### Hierarchical Spatial Reference

Patch any four outputs to the inputs of a second ANGLES module for a completely different set of 24 angles or mixer ratios.

---

## Installation

<img src={angles_mounting_power_sync} alt="ANGLES installation" />

### Requirements

- EuroRack enclosure.
- 12V DC or EuroRack power supply.
- 2.1mm DC barrel power cable **or** a EuroRack power cable.
- Four M2.5 x 6mm mounting screws, or screws provided or specified by the enclosure manufacturer.
- #1 Phillips head screwdriver, or hand tool provided or specified by the enclosure manufacturer.

### Procedure

- Power off and disconnect the EuroRack enclosure's power supply and any attached DC adapters.
- Connect either the EuroRack Power Cable **or** the DC Barrel Power Cable to the module. Do not connect both Eurorack and DC Barrel power.
- Ensure that no mounting screws are in any holes in the area where you wish to mount the module.
- Carefully test fit the module with its attached power cable in the open space in the EuroRack enclosure. If it is obstructed by the enclosure or any internal assemblies, abort this procedure.
- Connect the disconnected end of the power cable to the power supply.
- Connect the sync cable to a sync source or the last module in the sync chain.
- Mount the module to the EuroRack rails using all mounting holes.
- Store the unused cable along with the product box in a safe location.
- Power on the EuroRack enclosure and start patching.

---

## Full Specifications

<table>

<tr><th>Front panel</th><th>Connectors</th><th>Connectors</th></tr>
<tr><td>

<img src={angles_line_art_labeled} alt="Angles: labeled front panel controls" />

</td><td>

| Jack | Function                             |
| ---- | ------------------------------------ |
| J1   | H Ramp out                           |
| J2   | V Ramp out                           |
| J3   | Inverted H ramp out                  |
| J4   | Inverted V ramp out                  |
| J5   | A in                                 |
| J6   | B in                                 |
| J7   | C in                                 |
| J8   | D in                                 |
| J9   | 0 degrees out<br />(100% A)          |
| J10  | 90 degrees out<br />(100% B)         |
| J11  | 180 degrees out<br />(100% C)        |
| J12  | 270 degrees out<br />(100% D)        |
| J13  | 15 degrees out<br />(83% A + 17% B)  |
| J14  | 105 degrees out<br />(83% B + 17% C) |
| J15  | 195 degrees out<br />(83% C + 17% D) |
| J16  | 285 degrees out<br />(83% D + 17% A) |

</td><td>

| Jack | Function                             |
| ---- | ------------------------------------ |
| J17  | 30 degrees out<br />(67% A + 33% B)  |
| J18  | 120 degrees out<br />(67% B + 33% C) |
| J19  | 210 degrees out<br />(67% C + 33% D) |
| J20  | 300 degrees out<br />(67% D + 33% A) |
| J21  | 45 degrees out<br />(50% A + 50% B)  |
| J22  | 135 degrees out<br />(50% B + 50% C) |
| J23  | 225 degrees out<br />(50% C + 50% D) |
| J24  | 315 degrees out<br />(50% D + 50% A) |
| J25  | 60 degrees out<br />(33% A + 33% B)  |
| J26  | 150 degrees out<br />(33% B + 33% C) |
| J27  | 240 degrees out<br />(33% C + 33% D) |
| J28  | 330 degrees out<br />(33% D + 33% A) |
| J29  | 75 degrees out<br />(17% A + 83% B)  |
| J30  | 165 degrees out<br />(17% B + 83% C) |
| J31  | 255 degrees out<br />(17% C + 83% D) |
| J32  | 345 degrees out<br />(17% D + 83% A) |

</td></tr></table>

### Technical Data

|                              |                                                             |
| ---------------------------- | ----------------------------------------------------------- |
| Manufacturer Part Number     | 950036                                                      |
| Mounting Width               | 12 HP                                                       |
| Mounting Depth               | TODO mm                                                     |
| Mounting Hole Count          | 4                                                           |
| Power Consumption            | 12V @ 175 mA                                                |
| Power Connectors             | 16 pin EuroRack ribbon, 2.1mm DC barrel                     |
| Input Impedance              | 1M ohms                                                     |
| Output Impedance             | 75 ohms                                                     |
| Input Protection Range       | +/-20V                                                      |
| Input Clipping Range         | +/-2.5V                                                     |
| Output Range                 | +/-2.5V                                                     |
| Included                     | DC barrel power cable, EuroRack power cable, RCA sync cable |
| EuroRack Power Cable Type    | 16-pin                                                      |
| EuroRack Power Cable Length  | 25 cm                                                       |
| DC Barrel Power Cable Length | 25 cm                                                       |
| RoHS Compliance              | Manufactured with lead-free processes.                      |
| Video Sync                   | Rear RCA in & out                                           |

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

Calibration is not required for this module.

---
-->

## Maintenance

Keep your module free of dust and debris by performing periodic cleaning. Spots may be cleaned from the frontpanel with a microfiber cloth and isopropyl alcohol or other electronics cleaner.

<!-- ## Troubleshooting -->

---

## Hardware Revisions

The hardware revision code is printed on the circuit board visible from the rear of the module.
