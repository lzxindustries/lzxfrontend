---
draft: false
title: 'SUM/DIST'
image: /img/modules/sum-dist/sum-dist-diagrams/sum-dist_frontpanel.png
description: 'Documentation for SUM/DIST, a function bank of summing and distribution amplifiers for adding and distributing video signals.'
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

import sumdist_frontpanel from '/img/modules/sum-dist/sum-dist-diagrams/sum-dist_frontpanel.png';

import sumdist_line_art_labeled from '/img/modules/sum-dist/sum-dist-diagrams/sum-dist_line_art_labeled_496x1024.png';

# SUM/DIST

<span class="head2_nolink">Summing & Distribution Amplifiers</span>

<img src={sumdist_frontpanel} alt="Sum/Dist front panel" />

## Overview

Sum/Dist is a function bank for adding and distributing signals. Each of its four summing amplifiers adds the three inputs to a single output. Each of its four distribution amplifiers duplicates a single input to three buffered outputs.

---

## Key Specifications

| Parameter         | Value                                       |
| ----------------- | ------------------------------------------- |
| Mounting Width    | 12 HP                                       |
| Power Consumption | 12V @ 200 mA                                |
| Power Connectors  | 16 pin EuroRack ribbon, 2.1mm DC barrel     |
| Included          | DC barrel power cable, EuroRack power cable |
| Video Sync        | None                                        |

## System Integration Advice

Sum/Dist is a helpful utility module, particularly in larger systems with complex patches involving many modules. Sum/Dist performs the more basic functions, freeing up higher-level modules for what they do best. For example, while we can easily add three signals using SMX3, it would be better to reserve SMX3 for more creative applications of matrix mixing and routing.

As system size grows, the value of utility modules such as Sum/Dist also grows. Large systems can benefit from two or more Sum/Dist modules.

---

## Connectors

The top four rows of jacks are summing amplifiers. Each row is an independent **Sum** function block, with three inputs and one output.

The bottom four rows of jacks are distribution amplifiers. Each row is an independent **Distribution** function block, with one input and three identical buffered outputs.

---

## Operation

As mentioned above, Sum/Dist liberates high-level modules from performing the basic operation of addition. In addition to adding up to three separate signals, each Sum function block of Sum/Dist can act as a 2x or 3x multiplier. Send the same signal into two or three Sum inputs on the same row. Passive mults such as TipTop Audio Stackcables are probably OK. If the cable lengths are short, they won't pick up much noise. But if necessary, use a Distribution function block to create buffered copies of the signal before sending them to a Sum function block.

Adding a negative number is the same as subtracting that number, so the Sum function blocks can also be used to perform subtraction. Any negative voltage patched into a Sum input will be subtracted from the other inputs. While we could use Proc to produce that negative signal, once again, it would probably be better to reserve Proc for more creative applications such as colorization. This is where the value of lower-level modules such as Sum/Dist and the P-series becomes apparent. We can use PGO to subtract one signal from another, but if we want to add two signals and subtract a third one, we can use PGO and Sum/Dist together.

Function block outputs can be sent to other function block inputs to calculate simple algebra. Addition, subtraction, and multiplication can be combined in many ways.

The buffered mults of the Distribution function banks are valuable in fighting noise. By maintaining a constant current level, an active mult keeps the signal high relative to the noise floor. Since voltage is conserved, a passive mult divides the current by the number of signal splits. A three-way passive mult divides the current to one third of its original value, significantly lowering the signal strength relative to the noise floor.

Since the function blocks are buffered, Sum/Dist can also serve as a delay line, shifting the video image slightly to the right.

---

## Video Tutorial

<ResponsiveYouTube videoId="S744YMZBouI" />

[3 Patches for LZX Sum/Dist](https://youtu.be/S744YMZBouI)
<br />presented by Johnny Woods

---

<!--
## Example Patches
TODO

---
-->

## Installation

### Requirements

- EuroRack enclosure
- 12V DC or EuroRack power supply
- 2.1mm DC barrel power cable **or** a EuroRack power cable (both options included)
- Four M2.5 x 6mm mounting screws, or screws provided or specified by the enclosure manufacturer
- #1 Phillips head screwdriver, or hand tool provided or specified by the enclosure manufacturer

### Procedure

- Power off and disconnect the EuroRack enclosure's power supply and any attached DC adapters.
- Connect either the EuroRack Power Cable **or** the DC Barrel Power Cable to the module. Do not connect both Eurorack and DC Barrel power.
- Ensure that no mounting screws are in any holes in the area where you wish to mount the module.
- Carefully test fit the module with its attached power cable in the open space in the EuroRack enclosure. If it is obstructed by the enclosure or any internal assemblies, abort this procedure.
- Connect the disconnected end of the power cable to the power supply.
- Mount the module to the EuroRack rails using all mounting holes.
- Store the unused cable along with the product box in a safe location.
- Power on the EuroRack enclosure and start patching.

---

## Full Specifications

<table>

<tr><th>Front panel</th><th>Connectors</th><th>Connectors</th></tr>
<tr><td>

<img src={sumdist_line_art_labeled} alt="Sum/Dist: labeled front panel controls" />

</td><td>

| Jack | Function  |
| ---- | --------- |
| J1   | Sum A1 in |
| J2   | Sum B1 in |
| J3   | Sum C1 in |
| J4   | Sum 1 out |
| J5   | Sum A2 in |
| J6   | Sum B2 in |
| J7   | Sum C2 in |
| J8   | Sum 2 out |
| J9   | Sum A3 in |
| J10  | Sum B3 in |
| J11  | Sum C3 in |
| J12  | Sum 3 out |
| J13  | Sum A4 in |
| J14  | Sum B4 in |
| J15  | Sum C4 in |
| J16  | Sum 4 out |

</td><td>

| Jack | Function    |
| ---- | ----------- |
| J17  | Dist 1 in   |
| J18  | Dist A1 out |
| J19  | Dist B1 out |
| J20  | Dist C1 out |
| J21  | Dist 2 in   |
| J22  | Dist A2 out |
| J23  | Dist B2 out |
| J24  | Dist C2 out |
| J25  | Dist 3 in   |
| J26  | Dist A3 out |
| J27  | Dist B3 out |
| J28  | Dist C3 out |
| J29  | Dist 4 in   |
| J30  | Dist A4 out |
| J31  | Dist B4 out |
| J32  | Dist C4 out |

</td></tr></table>

### Technical Data

| Parameter                    | Value                                       |
| ---------------------------- | ------------------------------------------- |
| Manufacturer Part Number     | 950053                                      |
| Mounting Width               | 12 HP                                       |
| Mounting Depth               | 32 mm                                       |
| Mounting Hole Count          | 4                                           |
| Power Consumption            | 12V @ 200 ma                                |
| Power Connectors             | 16 pin EuroRack ribbon, 2.1mm DC barrel     |
| Input Impedance              | 1M ohms                                     |
| Output Impedance             | 75 ohms                                     |
| Input Protection Range       | +/-20V                                      |
| Input Clipping Range         | +/-2.5V                                     |
| Output Range                 | +/-2.5V                                     |
| Included                     | DC barrel power cable, EuroRack power cable |
| EuroRack Power Cable Type    | 16-pin                                      |
| EuroRack Power Cable Length  | 25 cm                                       |
| DC Barrel Power Cable Length | 25 cm                                       |
| RoHS Compliance              | Manufactured with lead-free processes.      |
| Video Sync                   | None                                        |

---

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

## Maintenance

Keep the module free of dust and debris by performing periodic cleaning. Spots may be cleaned from the front panel with a microfiber cloth and isopropyl alcohol or other electronics cleaner.

---

## Hardware Revisions

The hardware revision code is printed on the circuit board visible from the rear of the module.
