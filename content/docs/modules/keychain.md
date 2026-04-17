---
draft: false
title: "KEYCHAIN"
image: /img/modules/keychain/keychain-diagrams/keychain_frontpanel.png
description: "Documentation for KEYCHAIN, a triple hard key generator using ultra-fast voltage comparators for SD and HD video synthesis."
---
import { useEffect, useRef, useState } from 'react';

export function ResponsiveYouTube({ videoId }) {
  const iframeRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (iframeRef.current) {
      const updateHeight = () => {
        const width = iframeRef.current.offsetWidth;
        setHeight(width * 9 / 16); // fallback aspect ratio
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

import keychain_frontpanel from '/img/modules/keychain/keychain-diagrams/keychain_frontpanel.png';
import keychain_block_diagram from '/img/modules/keychain/keychain-diagrams/keychain_block-diagram.png';
import keychain_controls_and_connectors from '/img/modules/keychain/keychain-diagrams/keychain_controls-and-connectors.png';
import keychain_cv_mult from '/img/modules/keychain/keychain-diagrams/keychain_cv-mult.png';
import keychain_input_mult from '/img/modules/keychain/keychain-diagrams/keychain_input-mult.png';
import keychain_lfo_threshold from '/img/modules/keychain/keychain-diagrams/keychain_lfo-threshold.gif';
import keychain_linear_wipe from '/img/modules/keychain/keychain-diagrams/keychain_linear-wipe.gif';
import keychain_mounting_power_sync from '/img/modules/keychain/keychain-diagrams/keychain_mounting-power-sync.png';
import keychain_normalled_connections from '/img/modules/keychain/keychain-diagrams/keychain_normalled-connections.png';
import keychain_threshold_concept from '/img/modules/keychain/keychain-diagrams/keychain_threshold-concept.png';
import dsg3_dsg3_keychain from '/img/modules/dsg3/dsg3-diagrams/dsg3_dsg3-keychain.gif';
import keychain_line_art_labeled from '/img/modules/keychain/keychain-diagrams/keychain_line_art_labeled_336x1024.png';

# KEYCHAIN
<span class="head2_nolink">Triple Hard Key Generator</span>

<img src={keychain_frontpanel} alt="Keychain front panel" />

## Overview

Keychain extracts sharp-edged stencil shapes from video images or patterns. It generates hard keys in standard or high definition using voltage comparators with a response time of only seven nanoseconds!

One of Keychain's killer apps is generating animated wipe patterns from grayscale gradients. The simplest example is a ramp, or a mutated ramp from a pattern source such as DSG3. But any grayscale image is fair game, so go wild and crazy with novel, unique, and unexpected wipe shapes!

Keychain is also useful for processing low frequency signals such as LFOs and noise sources, converting any waveform into a square wave or variable width pulse. This is useful for animating hard cuts of varying durations with modules such as Switcher.

:::note
Keychain is not a compositor. By itself, it can't combine a foreground and background. For a soft key, or an all-in-one solution, the best option is FKG3.
:::

---

## Key Specifications

|                   |                                                                                 |
| ----------------- | ------------------------------------------------------------------------------- |
| Mounting Width    | 8 HP                                                                            |
| Power Consumption | 12V @ 110 mA                                                                    |
| Power Connectors  | 16 pin EuroRack ribbon, 2.1mm DC barrel                                         |
| Video Sync        | None                                                                            |
| Included          | DC barrel power cable, EuroRack power cable                                     |

---

## System Integration Advice

Keychain's outputs can be used directly. For example, Keychain's outputs can provide RGB channels to ESG3. In combination with ESG3's proc amp controls, this simple patch is a three-level posterizer. 

The full power of Keychain is unleashed in systems that include other core modules, such as DSG3, SMX3, DWO3, and Proc. Keychain is an essential building block of more complex patches involving layered imagery and/or instantaneous transitions such as hard cut edits.

---

## Controls & Connectors

<img src={keychain_controls_and_connectors} alt="Keychain controls and connectors" />

Keychain consists of three independent channels, **1**, **2**, and **3**. 

Each channel outputs a one-bit signal with values of zero or one volts.

Each channel has two inputs, one labeled **CV** and one with a **Key** icon. The threshold of the key is set by the combination of the inputs and the **Thresh** potentiometer knob. 

The gain of each CV input is adjusted with its attenuverter potentiometer knob, labeled **CV**. At the twelve o'clock position, the CV signal is multiplied by zero, nullifying it. Turning the CV knob clockwise, to the right of 12 o'clock, increases the CV gain up to its full intensity. Turning the CV knob counter-clockwise, to the left of 12 o'clock, inverts the incoming CV signal.

Both sets of inputs are internally self-normalled, allowing a signal patched into a channel 1 input to flow to the corresponding inputs of the other channels.

<img src={keychain_normalled_connections} alt="Keychain normalled inputs" />

---

## Operation

Internally, each Keychain channel consists of a mixer and a comparator. The mixer architecture is similar to Proc. A signal patched into a **Key** input is passed to the mixer without adjustment. A signal patched into a **CV** input is multiplied by its attenuverter potentiometer before being passed to the mixer. These two inputs are summed along with a third signal: a static voltage controlled by the **Thresh** potentiometer knob. Unlike the Bias control on Proc, the Threshold control is unipolar, ranging from zero to +1 volts.

$$
jKey + (jCV \cdot pCV) + pThresh
$$

<img src={keychain_block_diagram} alt="Keychain function blocks" />

&nbsp;<br />

The output of the mixer goes into a lightning-fast comparator that slices the signal into two states, on or off. For video signals, this means different areas of the frame are rendered as matte values of zero or one volt. For low frequency signals, it means sudden transitions between black and white.

<img src={keychain_threshold_concept} alt="Keychain threshold" />

&nbsp;<br />

:::note

Keychain does not have a video sync input. Low frequency transitions can happen in the middle of a frame, causing visible frame tearing. To cause transitions to happen in the vertical interval between frames or fields, you'll need an audio *sample and hold* module and a trigger signal that goes high at the start of each frame.

:::

---

## Video Tutorial

<ResponsiveYouTube videoId="q0O5YDxWHac" />

[3 Patches for Keychain](https://youtu.be/q0O5YDxWHac)
<br />presented by Johnny Woods

---

## Example Patches

For a hard key composite of two sources, send a Keychain output to the CV input of a crossfade module, such as Bridge or VH.S Crossfade.

Sending a Keychain output to PGO gives perfectly phase-aligned positive and negative alpha channels. This unlocks new achievements with mixers such as Proc and SMX3, turning them into hard keyers! 

Since Keychain's inputs are internally normalled, it can generate three keys of different thresholds from the same source. One application, a three-level posterizer, uses the ABS outputs of DSG3 to create discrete, non-overlapping bands of values. Each band goes to a top row input of SMX3, giving independent control of RGB or YIQ colors.

---

### Linear wipe

<img src={keychain_linear_wipe} alt="Keychain linear wipe" />

---

### Hard-edged figures

<img src={dsg3_dsg3_keychain} alt="DSG3 example patch: Keychain" />

---

### Multiple thresholds

<img src={keychain_input_mult} alt="Keychain input mult" />

---

### Shape variations

<!-- AFR note: The illustration 'keychain_cv_mult' has an error. The signal going into the CV input should be a horizontal ramp. In the current illustration, it's black. -->

<img src={keychain_cv_mult} alt="Keychain CV mult" />

---

### Animated figure / wipe

<img src={keychain_lfo_threshold} alt="Keychain LFO threshold" />

---

## Installation

<img src={keychain_mounting_power_sync} alt="Keychain installation" />

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

<table>

<tr><th>&nbsp;</th><th>Connectors</th><th>Controls</th></tr>
<tr><td>

<img src={keychain_line_art_labeled} alt="Keychain: labeled front panel controls" />

</td><td>

| Jack | Function       |
|------|----------------|
| J1   | CV 1 in        |
| J2   | Key 1 in       |
| J3   | Channel 1 out  |
| J4   | CV 2 in        |
| J5   | Key 2 in       |
| J6   | Channel 2 out  |
| J7   | CV 3 in        |
| J8   | Key 3 in       |
| J9   | Channel 3 out  |

</td><td>

| Potentiometer | Function               |
|---------------|------------------------|
| P1            | CV 1 attenuvert (gain) |
| P2            | Threshold 1 (bias)     |
| P3            | CV 2 attenuvert (gain) |
| P4            | Threshold 2 (bias)     |
| P5            | CV 3 attenuvert (gain) |
| P6            | Threshold 3 (bias)     |

</td></tr></table>

### Technical Data

|                              |                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Manufacturer Part Number     | 950056                                                                          |
| Mounting Width               | 8 HP                                                                            |
| Mounting Depth               | 32 mm                                                                           |
| Mounting Hole Count          | 4                                                                               |
| Power Consumption            | 12V @ 110 mA                                                                    |
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
| RoHS Compliance              | Manufactured with lead-free processes.                                          |
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

## Maintenance

Keep your module free of dust and debris by performing periodic cleaning. Spots may be cleaned from the frontpanel with a microfiber cloth and isopropyl alcohol or other electronics cleaner.

<!-- ## Troubleshooting -->

## Hardware Revisions

The hardware revision code is printed on the circuit board visible from the rear of the module.
