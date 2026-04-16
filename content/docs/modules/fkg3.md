---
draft: false
title: "FKG3: Fader & Key Generating Compositor"
image: /img/modules/fkg3/fkg3-diagrams/fkg3_frontpanel.png
description: "Documentation for FKG3, a fader and key generating compositor for layering two RGB sources with internal or external keying."
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

import fkg3_frontpanel from '/img/modules/fkg3/fkg3-diagrams/fkg3_frontpanel.png';

import fkg3_panel_labeled from '/img/modules/fkg3/fkg3-diagrams/fkg3_panel_labeled_496x1024.png';

# FKG3
<span class="head2_nolink">Fader & Key Generating Compositor</span>

<img src={fkg3_frontpanel} alt="FKG3 front panel" />

## Overview

FKG3 serves a wide range of creative image compositing functions. It's a key generator and RGB fader in one, allowing two RGB triplets to be layered with an internal or external key. Keys can be cut based upon luminance, or any one of the RGB color components. The edge of the key can range from hard to soft. The key softness can be increased so much that FKG3 becomes a crossfader with no key edge at all. Threshold and Softness can be voltage controlled with video rate signals. RGB and monochrome sources can be freely composited thanks to internally self-normalled input jacks.

Keying is based on analog logic. This is what allows FKG3 to perform a variety of fades, hard keys, and soft keys. It's also the "key" to controlling how chroma keys are cut. The individual RGB inputs open up creative possibilites that aren't possible with the conventional key bus of an ordinary video mixer. 

The analog logic of FKG3 can be applied to any signal, not just a video image. Low frequency control voltages can also be processed.

FKG3 has a bonus feature: **Edge** outline mode. Edge mode cuts a narrow window key, knocking out values above and below the key threshold. All of these features take FKG3 far beyond what a plain vanilla mixer can do.

### Legacy

FKG3 is a third-generation compositing module that consolidates and streamlines functions from previous designs such as the Visionary **Triple Video Fader & Key Generator**. It also shares DNA with the Expedition series **Doorway**, **Polar Fringe** and **Marble Index**.

FKG3 is more familiar from the perspective of traditional keying in a video mixer. Compared to previous LZX compositing modules, FKG3 is more intuitive, allowing the artist to quickly and effortlessly achieve frequently needed compositing effects. But that is just the beginning. The creative potential of FKG3 goes far beyond a standard video mixer.

---

## Key Specifications

|                   |                                                                                 |
| ----------------- | ------------------------------------------------------------------------------- |
| Mounting Width    | 12 HP                                                                           |
| Power Consumption | 12V @ 200 mA                                                                    |
| Power Connectors  | 16 pin EuroRack ribbon, 2.1mm DC barrel                                         |
| Included          | DC barrel power cable, EuroRack power cable, RCA sync cable                     |
| Video Sync        | Rear RCA in & out                                                               |

---

## System Integration Advice

FKG3 is a core module in almost any modular video synth. Compositing is a primary function in many patches that combine multiple signals. To understand the significance and value of FKG3 compared to other modules, we need to define some terms.

### Terminology

The terms *layering*, *blending* and *compositing* are often used interchangeably, but they are technically different. *Layering* refers to any combination of two or more images. *Blending* is a type of layering in which two images are combined using a math operation such as sum or difference. *Compositing* is a type of layering in which two or more images appear to be stacked over one another, or in front of one another. Compositing requires a mask or stencil, often called a *matte* in film compositing.

In video terms, the mask is known as a *key*. The key can come from one of the stacked images, or from some other source such as a gradient. In the case of a gradient as the key source, sweeping the key threshold across a value range creates the effect of a *wipe*.

Keys can have hard or soft edges. They can be derived or "cut" from the brightness value of an image, or from a particular color.

### Module options

Other analog logic based modules, such as DSG3, can blend two sources, but they can't perform compositing operations. Comparator modules such as Keychain, Stacker, or Ribbons can generate hard keys, but they can't actually combine two images. They're *keyers*, not compositors. Another module with multiple inputs, such as Switcher, would be required to do the actual compositing based on an external key provided by the keyer module.

FKG3 is the all-in-one solution for compositing two layers. It generates a key internally and applies it as a mask to cut out the opacity of one layer. This gives the effect of stacking the layers. FKG3 is also a requirement for a soft key, in which the stencil edge is not a sharp transition, but a gradient. And FKG3's **Edge** keying mode creates a visually interesting effect that would be complicated to patch using other modules.

### Expansion

Modules such as Proc, Matte, and Factors provide support to FKG3, extending its capabilities. These auxiliary modules perform important functions such as extending the range of the key **Threshold**, or adjusting the contrast of external key sources. Together, FKG3 and its support modules form a flexible compositing subsystem.

Multiple FKG3 modules allow compositing of more than two sources. The number of possible compositing layers is equal to the number of FKG3 modules, plus one.

---

## Controls, Connectors & Indicators

### Inputs and outputs

FKG3 has three sets of RGB inputs and one set of RGB outputs. Like all Gen3 modules, the inputs are internally self-normalled, so that a signal patched into an input jack cascades downward to the inputs below it.

The RGB input triplets, from left to right, are **Background**, **Foreground**, and **Key**. Background is indicated by a black rectangle, Foreground is a white rectangle, and the Key input is signified by a skeleton key icon.

Background and Foreground are merely convenient labels for the inputs. The priority of layering is not fixed. Either the Background and Foreground can be assigned as the visually "top" or "front" layer, depending on the settings of the **Key Source** and **Key Invert** switches, described below.

The Key input triplet allows an external source to define the key. Any image, gradient, or low frequency signal can provide the basis for the mask. The behavior of the Key inputs is different depending on the **Key Mode** setting, as explained in the [Operation](/docs/modules/fkg3#operation) section below.

Key Threshold and Softness can be modulated by video-rate control voltages supplied to the **Threshold CV** and **Softness CV** inputs.

:::note
All RGB inputs and outputs of FKG3 are constrained to the unipolar range of 0 to 1 volt. FKG3 cannot pass a negative voltage; any input below zero is clipped to a value of zero.

Threshold and Softness CV inputs can accept negative voltages.
:::

### Potentiometer knobs

FKG3 has two sets of pots controlling the key **Threshold** and **Softness**, and their respective **CV Depth** amounts. Threshold is the value at which the key is cut, Softness is the width of the gradient at the key threshold. With a very low Softness, that gradient width is reduced to near zero, for a hard key.

:::note
For an extremely sharp-edged hard key, a comparator module such as Keychain, Stacker, or Ribbons may give better results. Cut the key using the comparator module, and send its output to the external Key input of FKG3.
:::

The Threshold and Softness pots range from 0 to 1. However, these are not the full extents of the parameters. We can "push" the Threshold or Softness beyond the range of the pots by supplying a voltage to the CV input. In this way, we can, for example, key the Foreground or Background completely out, making it fully transparent.

The CV Depth pots are attenuverters, ranging from -1 to +1. An incoming control voltage is multiplied by the value of the attenuverter before being added to the Threshold or Softness.

### Switches

Two rotary switches and one toggle switch define the settings for the key polarity, edge mode, key source, and key color mode.

The most important control is the **Key Source** rotary switch. This chooses which set of inputs is sent to the key generator to cut the stencil. It's labeled with three icons: a black rectangle for the Background inputs, a white rectangle for the Foreground inputs, and a skeleton key for the external Key inputs.

The other rotary switch chooses the **Key Mode**, determining which color channel(s) are used to cut the key. The white rectangle chooses **Luminance Key** mode. In this mode, the RGB channels of the Key Source are summed according to the luminance formula described in the [Operation](/docs/modules/fkg3#operation) section below. The summed luminance value is sent to the key generator.

The Red, Green, and Blue settings of the Key Mode switch choose the color channel for **Chroma Key** mode. A key is cut based on the values of the RGB primaries. A detailed explanation follows in the [Operation](/docs/modules/fkg3#operation) section. The short version is that the chosen color primary is knocked out. The key generator sets the key to a low value wherever that primary is pure. The compositor then makes that area transparent.

The toggle switch at the upper left has three positions. In the center, default position, the key is not inverted. The key is cut based on the brightest values of the Key Source. When the switch is set to its upper position, the polarity is inverted, and the key is cut based on the darker values of the Key Source. By adjusting both the Key Source and the polarity, we can achieve the visual effect of placing the Foreground input "on top" or "in front" of the Background input, or vice versa.

In the lower position, the toggle switch enables **Edge** mode. This is not an edge detector like the Contour module. It's a type of window key, where the key has two thresholds instead of one. Values slightly above and slightly below the Threshold are knocked out. The "top" or "front" input becomes an "edge" with variable Softness, superimposed over the "bottom" or "back" input.

---

## Operation

### Compositing applications

FKG3 can be patched to achieve various compositing functions, such as a crossfade or a voltage controlled amplifier. The most common application is as a keying compositor, in which two images are layered with a mask or key.

To use FKG3 as a crossfader, it doesn't need a key input. Simply patch signals into Foreground and Background, set the Softness to maximum, and adjust the fade amount with the Threshold. If you're not able to exclusively fade to one signal, patch a static voltage source such as Proc or Matte into the Threshold CV input. Set the Threshold to 0.5. Fade from one input to the other using the Threshold CV Depth, or using the module that supplies the static voltage.

To use FKG3 as a VCA, set it up the same way as for a crossfade, but make one of the Foreground or Background inputs black. It's best to patch a static voltage source into the top, Red input of one of the inputs, in order to control the bias or pedestal.

To use FKG3 as a keying compositor, patch signals into Foreground and Background. Choose which input is the Key Source, optionally Invert the key or activate Edge mode, and set Softness and Threshold to achieve the desired visual result.

### Key logic

Threshold CV is a multiplier for the Key Source. And since all LZX CV inputs are video rate, we can use an image or pattern to mask the Key Source. For example, we can use Threshold CV as a "garbage matte" to block some area of the Key Source, rendering that area of the "top" or "front" layer transparent. Or we can create complex keys from the product of the Key Source and the Threshold CV, pre-compositing the key before it composites the Foreground and Background.

In Luminance key mode, the brightness of the Key Source is used to cut the stencil. Luminance is calculated from RGB inputs with the luma weighting formula:

$$
Y = 0.299R + 0.587G + 0.114B
$$

Chroma keys are based on RGB exclusive analog logic. The transparency amount is determined by the purity of the selected color component. 

Chroma keys use the following logic. The key value is the transparency, so a high value for K results in that area being keyed out.

$$
K_R = min \lbrace R, 1-G, 1-B \rbrace
\newline K_G = min \lbrace G, 1-R, 1-B \rbrace
\newline K_B = min \lbrace B, 1-R, 1-G \rbrace
$$

To cut a key based upon a color component, that component value must be high, and the other component values must be low. For example, to key out the red areas of an image, the red value must be high, and both green and blue values must be low. Only a red image area will cut the key. A white image area includes red at full intensity, but will not cut a key because green and blue are also at full intensity. The minimum of the three values would be zero, resulting in no transparency.

If cutting an internal self-key in chroma key modes, where either the Foreground or Background inputs supply the key source, FKG3 operates the same as a traditional keyer on a video mixer. However, FKG3 does not have a hue control. Precisely dialing in a conventional chroma key such as a green screen may require color correcting  RGB components before sending them to the external Key input.

### External keying

The full power of FKG3 is unlocked with the external Key inputs. The mere fact that we can patch whatever we like into the RGB inputs gives us a level of creative freedom that's simply not possible with a conventional mixer. Feel free to experiment, but keep in mind that chroma key modes must follow the analog logic described above.

If cutting an external chroma key from arbitrary sources, the exclusion logic must be taken into account. Due to the internal self-normalling of the RGB inputs, any jack will normally receive a signal from a signal patched in above it. This can cause unexpected results in external chroma key patches. If we patch different sources into the three RGB key inputs, then we can't isolate the key channels by simply choosing different chroma key modes. Any positive value in any input will raise the key threshold, increasing transparency. And that threshold will be different for each chroma key mode.

:::tip
As always, we can break the internal normal with a dummy plug wired to connect tip to sleeve, or with a zero voltage source. For example, to use only the Green key input as a chroma key, insert a dummy plug into the Blue jack.
:::

### Multichannel operation

Since the RGB inputs are internally self-normalled, we can easily mix and match color and grayscale images. Simply patch a monochrome signal into a Red input, and it flows to the Green and Blue inputs below.

That much is pretty standard procedure. Things get more interesting when we consider each row of Red, Green, and Blue jacks as a semi-independent signal chain. Each of the RGB components is composited separately, so we could patch arbitrary monochrome signals into all of the Foreground and Background inputs, and get three different monochrome composite outputs. 

But remember that there's only one key to rule them all. No matter how we generate the key — internally, externally, luma or chroma — it's always a single monochrome stencil. All three of the independent channels are composited with the same key. Nevertheless, this is a useful technique for video and low frequency applications. For example, we can apply a VCA or crossfade effect to two sets of three different control signals such as LFOs or random value generators.

---

## Video Tutorial

<ResponsiveYouTube videoId="h32UDIphXuI" />

[3 Patches for FKG3](https://youtu.be/h32UDIphXuI)
<br />presented by Johnny Woods

<!--
---

## Example Patches

TODO

-->
---

## Installation

<!--
<img src={fkg3_mounting_power_sync} alt="FKG33 installation" />
-->

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
* Connect the sync cable to a sync source or the last module in the sync chain.
* Mount the module to the EuroRack rails using all mounting holes.
* Store the unused cable along with the product box in a safe location. 
* Power on the EuroRack enclosure and start patching.

---

## Full Specifications

<table>

<tr><th>&nbsp;</th><th>Connectors</th><th>Controls</th></tr>
<tr><td>

<img src={fkg3_panel_labeled} alt="FKG3: labeled front panel controls" />

</td><td>

| Jack | Function                               |
|------|----------------------------------------|
| J1   | Threshold CV in                        |
| J2   | Softness CV in                         |
| J3   | Red Background in                      |
| J4   | Red Foreground in                      |
| J5   | Red Key in                             |
| J6   | Red out                                |
| J7   | Green Background in                    |
| J8   | Green Foreground in                    |
| J9   | Green Key in                           |
| J10  | Green out                              |
| J11  | Blue Background in                     |
| J12  | Blue Foreground in                     |
| J13  | Blue Key in                            |
| J14  | Blue out                               |

</td><td>

| Switch | Function                             |
|--------|--------------------------------------|
| S1     | Edge / Invert                        |
| S2     | Key Source                           |
| S3     | Key color mode                       |

| Pot    | Function                             |
|--------|--------------------------------------|
| P1     | Threshold                            |
| P2     | Softness                             |
| P3     | Threshold CV Depth                   |
| P4     | Softness CV Depth                    |

</td></tr></table>

### Technical Data

|                              |                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Manufacturer Part Number     | 950043                                                                          |
| Mounting Width               | 12 HP                                                                           |
| Mounting Depth               | 42 mm                                                                           |
| Mounting Hole Count          | 4                                                                               |
| Power Consumption            | 12V @ 200 mA                                                                    |
| Power Connectors             | 16 pin EuroRack ribbon, 2.1mm DC barrel                                         |
| Input Impedance              | 1M ohms                                                                         |
| Output Impedance             | 75 ohms                                                                         |
| Input Protection Range       | +/-20V                                                                          |
| Input Clipping Range         | +/-2.5V                                                                         |
| Output Range                 | +/-2.5V                                                                         |
| Included                     | DC barrel power cable, EuroRack power cable, RCA sync cable                     |
| EuroRack Power Cable Type    | 16-pin                                                                          |
| EuroRack Power Cable Length  | 25 cm                                                                           |
| DC Barrel Power Cable Length | 25 cm                                                                           |
| RoHS Compliance              | Manufactured with lead-free processes.                                          |
| Video Sync                   | Rear RCA                                                                        |

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

<!-- ## Troubleshooting -->

---

## Hardware Revisions

The hardware revision code is printed on the circuit board visible from the rear of the module.
