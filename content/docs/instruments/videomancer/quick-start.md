---
draft: false
sidebar_position: 0
slug: /instruments/videomancer/quick-start
title: 'Quick Start Guide'
description: 'Get up and running with Videomancer in minutes. Connect HDMI, load a program, and start exploring video synthesis.'
image: /img/instruments/videomancer/videomancer_frontpanel.png
---

import videomancer_frontpanel from '/img/instruments/videomancer/videomancer_frontpanel.png';
import videomancer_rearpanel from '/img/instruments/videomancer/videomancer_rearpanel.png';
import videomancer_connectors_and_controls from '/img/instruments/videomancer/videomancer-connectors-and-controls.png';
import videomancer_LCD_system_status from '/img/instruments/videomancer/videomancer_LCD_system_status.png';
import videomancer_LCD_vid_route_HDMI from '/img/instruments/videomancer/videomancer_LCD_vid_route_HDMI.png';
import videomancer_LCD_parameter from '/img/instruments/videomancer/videomancer_LCD_parameter.png';

# Videomancer

<span class="head2_nolink">Quick Start Guide</span>

:::tip Before You Begin
This guide gets you up and running with Videomancer in minutes. For complete documentation on all features, connections, and capabilities, see the **[User Manual](/docs/instruments/videomancer/user-manual)**.
:::

<img src={videomancer_frontpanel} alt="Videomancer front panel" />

---

## What You Need

- **Videomancer** with included 12V DC power supply
- **HDMI source device** — camera, media player, computer, game console, or any device with HDMI output
- **HDMI display** — monitor, TV, or capture device with HDMI input
- **Two HDMI cables** — standard full-size HDMI on both ends

:::note Analog Connections
This guide covers HDMI connections only. Videomancer also supports composite, S-Video, component YPbPr, RGB with sync on green, and the LZX 1V modular standard. For analog setup procedures, see the [Signal Paths](/docs/instruments/videomancer/user-manual#signal-paths) section of the User Manual.
:::

---

## Step 1: Connect Power

Plug the included 12V DC power supply into the **barrel jack** on the rear panel. Leave the **power switch** in the OFF position for now.

<img src={videomancer_rearpanel} alt="Videomancer rear panel connections" />

---

## Step 2: Connect HDMI

1. Connect your HDMI source device to the **HDMI IN** jack on the rear panel
2. Connect the **HDMI OUT** jack on the rear panel to your display

Both HDMI jacks are full-size connectors. No adapters are required for standard HDMI cables.

---

## Step 3: Power On

Switch the rear panel **power switch** to the ON position. Videomancer boots up. Press the **SYSTEM** button (white, top left of front panel) to display the system status screen on the LCD.

<img src={videomancer_LCD_system_status} alt="Videomancer system status display showing current program and video input" />

The rear panel **HDMI** LED lights illuminate when a valid HDMI connection is detected on each port.

---

## Step 4: Set the Video Route

Tell Videomancer to process your HDMI input. From the system status screen:

1. Turn the **Rotary Encoder** to select **Vid Route Mode**
2. Press the **Rotary Encoder** to edit the setting
3. Turn the **Rotary Encoder** to select **HDMI In**
4. Press the **Rotary Encoder** to confirm

<img src={videomancer_LCD_vid_route_HDMI} alt="Videomancer display showing HDMI Video Route Mode selection" />

Your source video now passes through Videomancer's processor and out to your display.

:::tip
Videomancer remembers this setting. You only need to set the Video Route Mode once.
:::

---

## Step 5: Load a Program

Videomancer's creative power comes from its **Programs** — firmware applications that process or generate video in different ways. Each Program transforms the twelve front panel controls into a unique instrument.

To load a Program:

1. Press the **SYSTEM** button — the currently loaded Program name appears on the top row of the display
2. Press the **Rotary Encoder** — a right-facing bracket ( **>** ) appears, indicating Program selection mode
3. Turn the **Rotary Encoder** to browse the available Programs
4. Press the **Rotary Encoder** to load your selection

**Suggested first Programs:**

- **Passthru** — passes video through with gain, inversion, and color space controls. A great starting point to see how Parameters work.
- **Colorbars** — generates SMPTE-style color bars with no input required. Set **Vid Route Mode** to **Standalone** to use without an HDMI source.
- **Prism** — prismatic color rotation and shifting effects on input video.

:::warning
When Videomancer loads a Program, all outputs are briefly disabled. Your display may show black or "no signal" for a few seconds. This is normal.
:::

:::note
Some Programs default to a black output. If your display is black after loading a Program, try moving the **★ Slider** (Parameter 12) to its full extents. Many Programs use this slider as a fade or luminance key.
:::

---

## Step 6: Play With the Parameters

Videomancer has twelve **Parameters** that control the behavior of the loaded Program. Each Program assigns different functions to these controls:

| Control           | Parameters      | Type                         |
| :---------------- | :-------------- | :--------------------------- |
| **Knobs 1–6**     | Parameters 1–6  | Continuous (turn to adjust)  |
| **Switches 7–11** | Parameters 7–11 | Binary (toggle on/off)       |
| **Slider ★**      | Parameter 12    | Continuous (slide to adjust) |

Press any **Parameter button** (labeled **1** through **★**) to see that Parameter's name and current value on the LCD display.

<img src={videomancer_LCD_parameter} alt="Videomancer LCD showing Parameter name and value" />

Every Program responds differently. Turn knobs, flip switches, and move the slider to discover what each Parameter does. The LCD display shows you the name and value of whatever you're adjusting.

---

## Next Steps

:::tip Keep Exploring
You've connected Videomancer, loaded a Program, and explored its Parameters. Here's where to go next:

**Motion Control** — Press the **START** button to activate the transport and unlock time-based modulation. Your Parameters come alive with oscillators, sequencers, and generative algorithms. See [MOTION](/docs/instruments/videomancer/user-manual#motion) in the User Manual.

**Modulation** — Assign any of 39 Modulation Operators to any Parameter: oscillators, audio reactivity, envelope followers, random generators, physics simulations, USB game controllers, and more. See the [Modulation Guide](/docs/instruments/videomancer/modulation-operators).

**Save States** — Save and recall your favorite settings as Presets. See [STATE Presets](/docs/instruments/videomancer/user-manual#state-presets) in the User Manual.

**Programs** — Videomancer includes many embedded Programs. Program-specific behavior is summarized in firmware release notes and expanded over time in the main documentation.
:::
