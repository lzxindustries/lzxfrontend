---
draft: false
sidebar_position: 1
slug: /instruments/videomancer/user-manual
title: "User Manual"
image: /img/instruments/videomancer/videomancer_frontpanel.png
description: "Complete documentation for Videomancer, a standalone video synthesis instrument with an open source hybrid digital/analog architecture. Covers connectors, controls, signal paths, operation, modulation, MIDI, presets, firmware, and developer resources."
---

import videomancer_connectors_and_controls from '/img/instruments/videomancer/videomancer-connectors-and-controls.png';

import videomancer_frontpanel from '/img/instruments/videomancer/videomancer_frontpanel.png';

import videomancer_rearpanel from '/img/instruments/videomancer/videomancer_rearpanel.png';

import videomancer_LCD_vid_route_HDMI from '/img/instruments/videomancer/videomancer_LCD_vid_route_HDMI.png';

import videomancer_LCD_system_status from '/img/instruments/videomancer/videomancer_LCD_system_status.png';

import videomancer_LCD_parameter from '/img/instruments/videomancer/videomancer_LCD_parameter.png';

import videomancer_LCD_modulation_selection from '/img/instruments/videomancer/videomancer_LCD_modulation_selection.png';

import videomancer_LCD_slope_wave_sine from '/img/instruments/videomancer/videomancer_LCD_slope_wave_sine.png';

import videomancer_LCD_timecode_bpm from '/img/instruments/videomancer/videomancer_LCD_timecode_bpm.png';

import videomancer_LCD_presets_F1_basic from '/img/instruments/videomancer/videomancer_LCD_presets_F1_basic.png';

import videomancer_LCD_motion_overview from '/img/instruments/videomancer/videomancer_LCD_motion_overview.png';

import videomancer_routing_diagram_dual_in from '/img/instruments/videomancer/videomancer_routing_diagram_dual_in.png';

# Videomancer

<span class="head2_nolink">User Manual</span>

<img src={videomancer_frontpanel} alt="Videomancer front panel"/>

<img src={videomancer_rearpanel} alt="Videomancer rear connections"/>

## Overview

Videomancer is a standalone instrument and development platform for video synthesis. Its open source hybrid digital/analog architecture leverages the best of both domains. With a full complement of inputs and outputs for every signal type, it integrates seamlessly with any studio or performance rig. Videomancer supports a wide range of standard and high definition video formats.

Due to its extraordinary versatility, Videomancer can perform many functions, such as:

* Process HDMI or analog video
* Generate video with internal pattern algorithms
* Convert between video signal types:
    - HDMI YCbCr
    - DVI RGB (output only)
    - Component YPbPr
    - Component RGsB (sync on green)
    - Composite
    - S-Video (Y/C)
    - LZX 1V modular RGB
* Modulate video with dozens of different **Modulation Operators**:
    - Direct modulation with external audio and control voltage
    - External signal shapers such as envelope follower, slew, quantizer
    - Internal algorithms such as oscillators and pattern generators
    - USB devices such as mouse, game controller, joystick
    - MIDI Continuous Controllers and Note messages
* Control global modulation timing:
    - Synchronize modulation with MIDI Clock or MIDI Timecode
    - Set tempo with **TAP** button or numeric Beats Per Minute
* Control external devices with MIDI

Each of Videomancer's twelve **Parameters** can be driven by any Modulation Operator. Modulation is unique per Parameter, so you can mix and match them. For example, drive Parameters 1 and 2 with independent oscillators, Parameter 3 with audio, Parameter 4 with MIDI, etc.

:::note
Videomancer does not convert between resolution formats or frame rates. It cannot upscale or downscale a video signal, or change the number of frames per second.
:::

### Architecture

Under the hood, Videomancer is an ***embedded system***, a special-purpose computer driven by a Field-Programmable Gate Array (FPGA). This is a type of processor that can be configured &ldquo;in the field&rdquo; to implement different circuits via firmware. That means Videomancer can perform many different functions with a level of efficiency that would otherwise require custom-designed hardware for each function. Instead of a different physical circuit, the FPGA simply loads a different firmware program. This approach diverges radically from conventional digital graphics that rely on parallel processing on a GPU. Videomancer's architecture imparts extraordinary versatility and power, while remaining affordable, portable, and energy-efficient.

**Speed**

Another benefit of Videomancer's FPGA architecture is ultra-low latency, in the range of 0.0001 to 0.0007 millisecond. Conventional digital video devices insert at least one frame of delay, which is 33 milliseconds at 30 frames per second. Videomancer is orders of magnitude faster. Latency is absolutely imperceptible, giving immediate feedback in applications such as audio reactivity.

**Precision**

All your bits are belong to us. Videomancer operates with 10-bit precision throughout. That includes each channel of video, and each continuous Parameter value. A dynamic range of 1024 possible values per Parameter. 30 bits for video. More than we need for faithful reproduction, total image deconstruction, or devastating annihilation.

**Development**

Videomancer's firmware is part of a code base shared with other instruments in development, such as **Chromagnon**, and planned for the future, such as **Memory Palace Mk II**. The open source [Software Developer's Kit ](https://github.com/lzxindustries/videomancer-sdk)opens the door for third party community developers to contribute programs to Videomancer, enriching the creative possibilities for all artists who use the instrument.

**Economics**

LZX is committed to making video synthesis affordable to working artists, not just big studios. To keep costs down, Videomancer's design requires very little volatile memory. It can only hold a few lines of video in memory at a time. That's enough for certain effects that are impossible in the analog domain, such as vertical blurring. But it's not enough to store an entire frame, so Videomancer isn't a frame store. It can't convert resolutions or frame rates, or sync one video signal to another. For those capabilites, we offer the [TBC2 Dual Video Input](/docs/modules/tbc2) Eurorack module.

### Legacy

Videomancer is the second standalone instrument released by LZX, the first being the popular **Vidiot**. Videomancer shares very little DNA with Vidiot beyond support for the LZX 1V modular standard. Vidiot was envisioned as an entry-level semi-modular instrument with fixed functionality. In contrast, Videomancer is a development platform whose capabilities will continue to expand over time. 15 years of continuous design and manufacturing expertise have culminated in an instrument highly optimized for creativity, portability, expandability, and efficiency.

---

## Key Specifications

| Parameter         | Value                                                                           |
|:----------------- |:------------------------------------------------------------------------------- |
| Dimensions (mm)   | 234.2 width / 178.1 depth / 75.44 height                                        |
| Dimensions (inch) | 9.22 width / 7.01 depth / 2.97 height                                           |
| Power Consumption | 12V @ 500 mA                                                                   |
| Power Connectors  | 2.1mm DC barrel                                                                 |
| Included          | International power supply                                                      |
| Video Sync        | Rear RCA Sync out, rear RCA Multi-format Analog in                              |

---

## Connectors, Controls, and Indicators

<img src={videomancer_connectors_and_controls} alt="Videomancer connectors and controls" />

---

### Connectors

* **HDMI** digital video/audio in and out
    - Full-size HDMI jacks
    - Supporting a wide range of digital video [formats](/docs/instruments/videomancer/user-manual#supported-formats-and-standards)
    - Output configurable as HDMI YCbCr or DVI RGB
* **Multi-format Analog** video in and out
    - Triple RCA jacks configurable as:
        - CVBS composite
        - S-Video (Y/C) component
        - YPbPr component
        - RGB component with sync on green (RGsB / SoG)
* **Video Sync** out
    - RCA jack
    - Genlock a modular system or other devices to Videomancer
* **1v RGB** video in and out
    - Triple TS mini-jacks
    - DC-coupled [LZX modular standard](/docs/guides/standards)
* **Audio/CV** inputs
    - Four signal inputs on two TRS stereo mini-jacks
    - Configurable as control voltages or line level audio signals
* **MIDI** in and out
    - TRS 3.5 mm (1/8&rdquo;) mini-jacks
    - MIDI standard Type A
* **USB** ports
    - Two USB-C jacks
    - **Device** port
        - Connect to MIDI host such as a PC
        - Firmware updates
    - **Host** port
        - Connect to class-compliant USB MIDI devices such as musical keyboard or fader box
        - Connect to Human Interface Devices such as mouse or game controller
* **microSD** card slot for additional non-volatile storage
    - Additional **Programs** from LZX and the [community](https://github.com/lzxindustries/videomancer-community-programs)
    - **Presets** for Programs stored on microSD card
    - Planned: library management with **LZX Connect** desktop application
* **DC Power**
    - Barrel jack
        - 2.1 mm diameter center conductor
    - Power supply requirements:
        - 12 Volts, center positive
        - 500 mA

---

### Controls

**Front Panel Controls**

* **Rotary Encoder**
    - Incremental digital data entry
    - Turn to choose an option from the menu
    - Push to execute
    - Define global **SYSTEM** settings
    - Choose **Modulation Operator** per Parameter
    - Load and save **STATE** presets
* **Navigation** buttons
    - Press to access a function on the LCD display
    - White buttons: **SYSTEM**, **MOTION**, and **STATE**
    - Black buttons labeled **1** through **&ast;** : 
        - Press to switch ***focus*** to **Parameter 1** through **Parameter 12**
        - Press repeatedly to cycle through the display of:
            - Modulation Operator menu
            - Current Manual value of Parameter Knobs, Switches, and Fader
            - Values of the Modulation properties controlled by the **Time**, **Space**, and **Slope** knobs
* **Modulation** control knobs
    - Adjust modulation for the currently focused Parameter
* **Parameter** control knobs
    - Manually adjust continuous Parameters 1 through 6
* **Toggle** control switches
    - Manually enable / disable binary Parameters 7 though 11
* **Slider** Parameter control
    - Manually adjust continuous Parameter 12
* **Transport** buttons
    - **Start** and **Stop** modulation
    - **Tap** to set tempo in beats per minute

**Rear Chassis Controls**

* **Power** switch
* **Boot** button
    - For [firmware update](/docs/instruments/videomancer/user-manual#firmware-update)

---

### Indicators

**Front Panel Indicators**

* LCD screen
    - User feedback for SYSTEM settings and functions, STATE Presets, Modulation modes, Parameter values, and MOTION Timecode / BPM
* Front panel LED lights
    - Parameter knob, switch, and fader LEDs indicate the currently focused Parameter: 1 through 12
    - Modulation knob LEDs indicate the focused Modulation control: Time, Space, Slope
    - **Start** and **Stop** LEDs indicate transport playback status
    - **Tap** LED flashes during transport playback to indicate tempo

**Rear Chassis Indicators**

* **Power** LED light
* **HDMI** input and output LED lights
    - Illuminate when HDMI status is active and locked

---

## Signal Paths

### Supported Formats and Standards

Videomancer genlocks to incoming video, assuming the timing, resolution, and frame rate of the source. It can't convert raster formats, so there's no function to choose resolutions or frame rates.

| Resolution and frame rate standards |
|:------------------------------------|
| NTSC 486i59                         |
| PAL 576i50                          |
| 480p29                              |
| 576p25                              |
| 720p50                              |
| 720p59                              |
| 720p60                              |
| 1080i50                             |
| 1080i59                             |
| 1080i60                             |
| 1080p23                             |
| 1080p24                             |
| 1080p25                             |
| 1080p29                             |
| 1080p30                             |

<!--
| 240p29                                        |
| 288p25                                        |
-->

---

Videomancer can't convert resolutions or frame rates, but it ***can*** convert between color spaces and color encoding formats. Choose the input and output options via the System menu, as described in [Video Route Modes](/docs/instruments/videomancer/user-manual#video-route-modes) below.

| Color formats                         |
|:--------------------------------------|
| HDMI YCbCr (YUV)                      |
| DVI (RGB)                             |
| Component YPbBr (YUV)                 |
| Component RGsB / SoG (Sync on Green)  |
| Composite (CVBS)                      |
| S-Video (Y/C)                         |

---

### Video Inputs and Outputs

Videomancer provides many options for video inputs and outputs, making it exceptionally flexible. It's compatible with nearly any video device with HDMI or analog connections.

<img src={videomancer_LCD_vid_route_HDMI} alt="Videomancer Vid Route Mode display" />
*Video Routing*

#### General procedure

To choose from the available video inputs and outputs:

- Press the **SYSTEM** button
- Turn the rotary encoder to select the desired SYSTEM submenu:
    - **Vid Route Mode**
    - **Analog In Mode**
    - **Analog Out Mode**
    - **HDMI Out Mode**
- Press the Rotary Encoder to edit the selected setting
- Turn the Rotary Encoder to select an option
- Press the Rotary Encoder to confirm the option

:::note
All of Videomancer's outputs are always active.
:::

#### Video Route Modes

The most fundamental SYSTEM property is how video is routed through Videomancer. The **Vid Route Mode** menu chooses which inputs are active, if any, and how they are routed to the processor.

| Vid Route Mode | Signal Path(s)                                                                    |
|:---------------|:----------------------------------------------------------------------------------|
| HDMI In        | Send HDMI digital video to Videomancer processor                                  |
| Dual In        | Send HDMI to analog outputs and send analog inputs to processor                   |
| Standalone     | Disable all inputs. Video format is set with **SYSTEM &#8594; Preferred Timing**. |
| Analog In      | Send analog video to processor                                                    |

:::note
In every Vid Route Mode except Dual In, the same signal is sent to the HDMI and analog outputs.
:::

**Dual In Route Mode**

Integrate Videomancer with analog devices such as a modular synthesizer with **Dual In** Mode. Videomancer routes incoming HDMI video to the active analog output. Process video with an external device, or chain of devices. Video connected to Videomancer's active analog input is routed to the processor.

<img src={videomancer_routing_diagram_dual_in} alt="Videomancer Dual In routing diagram showing connections to a modular synth" />
*Dual In routing diagram showing connections to a modular synth*

**Dual In setup procedure:**

1. Connect Videomancer's analog output to the input of another device. 
2. Choose the output signal type from **SYSTEM &#8594; Analog Out Mode**. 
3. Connect the analog output of another device to Videomancer's analog input.
4. Choose the input signal type from the **SYSTEM &#8594; Analog In Mode** menu.

:::tip
There's no law that says Videomancer's analog inputs and outputs have to form a single circuit with some other system. A signal can loop through something as an &ldquo;effects send&rdquo; and back to Videomancer, but it doesn't ***have to***. You can connect whatever you want to the analog inputs. That signal can be completely independent of the ***HDMI input &#8594; analog output*** chain, giving you a high quality digital to analog converter for free.
:::

**Standalone Route Mode**

Some Programs operate without a video input. Videomancer casts an algorithmic illusion to generate imagery. Eliminate the need for any external source device by invoking **Standalone Mode**.

Videomancer genlocks to incoming video, automatically switching to the resolution and frame rate of the source. If there is no source, then the video format standard is chosen from **System &#8594; Pref. Timing**.

#### Analog In Modes

If Vid Route Mode is set to Dual In or Analog, choose the active physical input and signal type from the **Analog In Modes** menu.

| Mode         | Color space / format  | Connector(s)                                    |
|:-------------|:----------------------|:------------------------------------------------|
| YPbPr        | Component YPbPr (YUV) | Triple RCA jacks labeled Y/G/CVBS, PB/B, and PR/R        |
| RGB SOG      | Component RGsB (sync on green)  | Triple RCA jacks labeled Y/G/CVBS, PB/B, and PR/R        |
| RGB 1V       | [LZX modular standard](/docs/guides/standards) | Triple 3.5mm (1/8&rdquo;) jacks labeled 1V R, 1v G, and 1V G |
| CVBS/S-Video | Composite NTSC or PAL (CVBS) | RCA jack labeled Y/G/CVBS               |
| CVBS/S-Video | Y/C NTSC or PAL (S-Video)    | RCA jacks labeled PB/B (luminance) and PR/R (chrominance)

#### Analog Out Modes

Choose the color space of the analog outputs from the **Analog Out Modes** menu. The options are **YPbPr** and **RGB**.

#### HDMI Out Modes

Choose the color space of the HDMI output from the **HDMI Out Modes** menu. The options are **YPbPr** and **RGB**.

---

### Input Configurations

#### HDMI in

* Connect a source to the **HDMI** input
* Set **Video Route Mode** to **HDMI**

#### Composite (CVBS) video in

* Connect a composite video signal to the **Analog Y/CVBS** input
* Set **Vid Route Mode** to **Analog**
* Set **Analog In Mode** to **CVBS**

#### S-Video in

* Using a Mini DIN-4 to dual RCA adapter, connect the **Y** (luminance) component to the **Analog Pb/B** input and the **C** (chroma) component to the **Analog Pr/R** input
* Connect an S-Video source to the adapter with an S-Video cable
* Set **Vid Route Mode** to **Analog**
* Set **Analog In Mode** to **S-Video**

#### YPbPr component in

* Connect a YPbPr Component source to the **Multi-format Analog** inputs
* Set **Vid Route Mode** to **Analog**
* Set **Analog In Mode** to **YPbPr**

#### RGB Sync on Green (SoG) component in

* Connect an RGB SoG component source to the **Multi-format Analog** inputs
* Set **Vid Route Mode** to **Analog**
* Set **Analog In Mode** to **RGB SoG**

#### 1V RGB + Sync in

* Connect 1V RGB signals to the **1V RGB** inputs
* Connect a sync signal to the **Analog Y** input
    - Take a sync output from the front or rear of any module
    - Or take any video output that includes embedded sync, and is in sync with the modular system. For example, the following RCA jacks of ESG3 all include sync:
        - **CVBS**
        - The **Y** output in **YPbPr** mode
        - The **Green** output in **RGB / SoG** mode
* Set **Vid Route Mode** to **Analog**
* Set **Analog In Mode** to **RGB 1V**

:::note
In any Video Route Mode other than Standalone, Videomancer needs to receive a sync reference. That can come from sync embedded in the HDMI or conventional analog video source. 1V modular RGB does not carry sync, so sync must be supplied separately. Sync can come directly from the modular system, or from some other video device that is in sync with the modular system.
:::

---

### Output Configurations

#### HDMI out

- Connect the **HDMI** output to a monitor or capture device

#### Composite video out

* Connect the **Y/G/CVBS** output to a monitor or capture device
* Set **Analog Out Mode** to **CVBS/S-Video**

#### S-Video out

* Using a Mini DIN-4 to dual RCA adapter, connect the **Y** component to the **Analog Pb/B** output and the **C** component to the **Analog Pr/R** output
* Connect the adapter to a monitor or capture device using an S-Video cable
* Set **Analog Out Mode** to **CVBS/S-Video**

#### YPbPr component out

* Connect the **YPbPr** outputs to a monitor or capture device
* Set **Analog Out Mode** to **YUV**

#### RGB Sync on Green (SoG) component out

* Connect the **RGB** outputs to a monitor or capture device
* Set **Analog Out Mode** to **RGB**

#### 1V RGB + Sync out

* Connect the **1V RGB** outputs to the modular system
* Connect the **SYNC** output to the sync input of the modular system
* Set **Analog Out Mode** to **RGB**

:::note
Videomancer automatically syncs to any conventional video signal patched to the HDMI or RCA inputs. However, it is not a frame store like TBC2. To use Videomancer as a decoder to convert to 1v modular video, patch the Videomancer Sync output to the sync input of the modular system.
:::

:::warning
Videomancer is an ultra-low latency digital signal processing device, but it can never be as fast as a dedicated analog circuit.
:::

#### Horizontal Phase Delay

Any video going through Videomancer is delayed slightly. If Videomancer is patched into the ***middle*** of a modular system, between the modular decoder and the modular encoder, Videomancer's output will be shifted to the right relative to the rest of the modular system. The amount of horizontal shift depends on video resolution, frame rate, and the particular program loaded into Videomancer.

Therefore, inserting Videomancer between a modular decoder and encoder is not a recommended configuration. Using Videomancer as an &ldquo;effects send&rdquo; may be possible in exotic scenarios where the modular decoder, encoder, and/or sync generator are not sharing the same sync reference, but that would be a non-standard, advanced, experimental configuration.

On the other hand, there's no issue at all when integrating a modular system using Dual Mode. As long as the modular is receiving sync from Videomancer, the only phase delay will be from the analog patch.

---

## Operation

### Menu Structure

The following outline illustrates the overall structure of the Videomancer menus. Specific options per menu are listed or described in the corresponding sections of this User Guide, or in supplemental documents such as the [Modulation Guide](/docs/instruments/videomancer/modulation-operators.md).

- **SYSTEM**, **MOTION**, and **STATE** menus are chosen by pressing the labeled white Button, indicated by a circled bullet character: &nbsp;<span class="system-ui">◉</span>
- **Parameter** menus are chosen by repeatedly pressing a black Parameter Button, labeled **1** through **&#42;** (12), indicated by a hollow bullet character: &nbsp;<span class="system-ui">○</span>
- Most menus are chosen by turning the Rotary Encoder, indicated by a left-right horizontal arrow: &nbsp;<span class="system-ui">&harr;</span>
- Any menu accessed by pressing the Rotary Encoder is indicated by a down arrow: &nbsp;<span class="system-ui">&darr;</span>

<span class="code-like-block-vm">
Videomancer
│
├── SYSTEM ◉
│   ├─ Current Program, Video In, and format <span class="system-ui">&harr;</span>
|   |   └─ Program Selection ↓
│   ├─ Video Route Mode <span class="system-ui">&harr;</span>
│   ├─ Analog In Mode <span class="system-ui">&harr;</span>
│   ├─ Analog Out Mode <span class="system-ui">&harr;</span>
│   ├─ HDMI Out Mode <span class="system-ui">&harr;</span>
│   ├─ MIDI Channel <span class="system-ui">&harr;</span>
│   ├─ MIDI Out Mode <span class="system-ui">&harr;</span>
│   ├─ Developer Mode <span class="system-ui">&harr;</span>
│   ├─ Soft Pickup <span class="system-ui">&harr;</span>
│   ├─ Language <span class="system-ui">&harr;</span>
│   ├─ Preferred Timing <span class="system-ui">&harr;</span>
|   └─ Escape to Parameter menu ◉
│
├── MOTION ◉
│   ├─ Timecode & Beats Per Minute
│   ├─ Motion Overview ◉
|   └─ Escape to Parameter menu ◉
│
├── STATE ◉
│   ├─ Presets <span class="system-ui">&harr;</span>
|   └─ Escape to Parameter menu ◉
│
└── Parameter ○
&nbsp;   ├─ Manual ○
&nbsp;   ├─ Time ○
&nbsp;   ├─ Space ○
&nbsp;   ├─ Slope ○
&nbsp;   └─ Modulation Selection ○ <span class="system-ui">&harr;</span>
</span>

---

### SYSTEM

Press the **SYSTEM** button to access the System menus. By default, the current **Program**, video input, and format standard are displayed. 

<img src={videomancer_LCD_system_status} alt="Videomancer System Status display" />
*System Status*

Turn the Rotary Encoder to cycle through the System menus:

| Menu                      | Display Text    | Options                                     |
|:--------------------------|:----------------|:--------------------------------------------|
| **Video Route Mode**      | Vid Route Mode  | HDMI In, Dual In, Standalone, Analog In     |
| **Analog Input Mode**     | Analog In Mode  | YPbPr, RGB SOG, RGB 1V, CVBS/S-Video        |
| **Analog Output Mode**    | Analog Out Mode | CVBS/S-Vid, YPbPr, RGB                      |
| **HDMI Output Mode**      | HDMI Out Mode   | HDMI, DVI                                   |
| **MIDI Channel**          | MIDI Channel    | Disabled, Omni, CH 1 – CH 16                |
| **MIDI Output Mode**      | MIDI Out Mode   | Disabled, Manual+Mod, Manual Only, Mod Only |
| **Developer Mode**        | Developer Mode  | Disabled, Enabled                           |
| **Soft Pickup**           | Soft Pickup     | Disabled, Enabled                           |
| **Language**              | Language        | English, Deustch, Francais, Espanol, Dansk, Svenska, Suomi, Italiano, Portugues, Indonesia, Nederlands, Norsk, Turkce, Catala, Polski, Hrvatski, Romana, Cestina |
| **Preferred Timing**      | Pref. Timing    | [Video Formats and Standards](/docs/instruments/videomancer/user-manual#supported-formats-and-standards) |

**System settings procedure:**

* Press the SYSTEM button
* Turn the Rotary Encoder to choose a System submenu
* Press the Rotary Encoder to move the cursor to the bottom row
* Turn the Rotary Encoder to change the setting
* Press the Rotary Encoder to confirm the setting

---

### Programs

Videomancer includes numerous **Programs**, which are firmware applications that can be loaded on the fly. 

Programs are documented in this manual and in firmware release notes.

**Program loading procedure:**

* Press the **SYSTEM** button. The currently active Program name is displayed on the top row of the display.
* Press the Rotary Encoder to enter Program selection mode. A right-facing angle bracket ( **&gt;** ) is displayed on the far left of the display.
* Turn the Rotary Encoder to scroll through the available Programs
* Press the Rotary Encoder to load the Program

:::warning
When Videomancer loads a Program, all outputs are disabled for a few seconds. During Program load, no video or sync signal is present at the outputs. Any downstream video device does not receive a signal, so it may display black, a blue screen, or an error message such as "no signal detected". If this is an issue, such as during a live performance, send Videomancer through a device such as a mixer that always outputs a valid video signal.
:::

:::note
Some Programs may default to a black output. Typically, the **&ast; Slider** for Parameter 12 performs the function of fading to black, or luminance keying to black. After loading a Program, it may be necessary to move the Slider to its furthest extents in order to see an image.
:::

---

### Parameters

Any **Parameter** 1 through 12 can be adjusted manually at any time via the Parameter Knobs, Switches, or Fader. If Videomancer is in Parameter display mode, then the Parameter number, name, and values of the ***focused*** Parameter are shown onscreen.

<img src={videomancer_LCD_parameter} alt="Videomancer Parameter Mode display" />
*Parameter mode*

To enter Parameter display mode, press any of the Parameter buttons labeled **1** through **&ast;** (Parameters 1 through 12). The selected Parameter is given focus and its properties are displayed. The top row of the display lists the Parameter number and name.

The bottom row displays additional information:

- Manual value of the physical control
- Name and value of the Time Modulation Knob
- Name and value of the Space Modulation Knob
- Name and value of the Slope Modulation Knob
- Modulation Operator assigned to the Parameter

Press the Parameter button repeatedly to cycle through all Parameter display modes.

If any Parameter display mode is active, simply moving a different Parameter control brings that Parameter into focus and its **Manual** value onscreen. Moving a Time, Space, or Slope control knob displays the associated Modulation property and its value.

If Videomancer is in **SYSTEM**, **MOTION**, or **STATE** mode, then the LCD display shows the menus for that mode. In this case, the properties of the focused Parameter are not displayed. However, all Parameter controls are still active. The **Time**, **Space**, and **Slope** Modulation controls for the focused Parameter are also active.

**Soft Pickup**

Parameter controls feature an optional soft takeover method for updating the value Parameter. When **Soft Pickup** is enabled, the physical control must be moved beyond the current Parameter value in order to take effect. When the Parameter value doesn't match the physical control position, an exclamation point ( **&excl;** ) is displayed on the left side of the value.

Soft Pickup is enabled or disabled from its submenu in the System menu.

---

### Modulation

Each Parameter can be separately modulated by its own individual chain of modulation sources. The Parameter value at any point in time is the sum of **Manual** control, a **Modulation Operator**, and incoming **MIDI**.

$$
\textbf{Parameter} = \textbf{Manual} + \textbf{Modulation} + \textbf{MIDI}
$$

#### Modulation Operators

Videomancer features dozens of **Modulation Operators** of various types, ranging from raw control voltage input to generative algorithms. Modulation Operators are documented in full in the [Modulation Guide](/docs/instruments/videomancer/modulation-operators.md).

:::note
**MOTION** transport playback usually needs to be running to apply modulation. Press the **PLAY** button to enable all Modulation Operators.
:::

Modulation Operator sample rate is latched to the current video format. Values are usually constrained to the current frame/field rate. This prevents frame tearing that could occur if a modulation value changes in the middle of a frame. Additionally, some Modulation Operators, such as **Audio In**, are capable of operating at the higher sample rate of individual video scanlines.

**Modulation Operators include:**

- External signals
        - Audio
        - Control voltages
        - Envelopes & Followers
        - Clocks and Logic
- Internal generative algorithms
        - Oscillators
        - Sequencing & Rhythm
        - Random & Chaos
        - Physics
        - Spatial
- USB devices
        - Mouse
        - Graphics tablet
        - Game controller
        - Joystick
        - Sensor

<img src={videomancer_LCD_modulation_selection} alt="Videomancer Modulation Selection display" />
*Modulation Selection*

**Modulation Operator selection procedure:**

* Give focus to the desired Parameter by pressing its button, or by adjusting its physical Knob, Switch, or Fader
* Press the Rotary Encoder, or turn it by one increment, to display the current Modulation Operator
* Turn the Rotary Encoder to cycle through the available Modulation Operators

Selection of a Modulation Operator takes place immediately. If the name of a Modulation Operator is displayed, it's active.

:::note
The **MOTION** button doesn't choose Modulation operators. Pressing the MOTION button displays the current **Timecode** and **BPM** (beats per minute).
:::

**Disabling Modulation**

To change Parameter values with Manual controls and/or MIDI only, disable the Modulation operator. When the Modulation Operator name is displayed, turn the Rotary Encoder to set the Modulation mode to **Disabled**, or simply press the Rotary Encoder.

<!--
:::tip
To quickly disable modulation for the focused Parameter, press the Rotary Encoder twice.
:::
-->

---

### Modulation Control Knobs

Modulation Operator properties are adjusted with the **Time**, **Space**, and **Slope** knobs. Adjusting one of those knobs brings the associated property into focus, and the property's value is displayed onscreen. The values can also be displayed without changing them by repeatedly pressing the desired Parameter button.

**Space** controls the **Gain** or amplitude of modulation. The range of the Gain property depends on the current Modulation Operator. For example, **LFO** modulators have a maximum Gain of 100%. **CV** and **Audio** modulators have a maximum Gain of 400% to accommodate sources with different voltage ranges.

**Time** and **Slope** knobs perform different functions depending on the active Modulation Operator, as described in the [Modulation Guide](/docs/instruments/videomancer/modulation-operators.md). For example, Time adjusts the period of an oscillator, and Slope chooses the waveform type.

<img src={videomancer_LCD_slope_wave_sine} alt="Videomancer Slope display" />
*Slope display showing Sine LFO waveform selection*

If Modulation is disabled, and no Modulation Operator is assigned to the focused Parameter, then the Time, Space, and Slope controls have no effect. The LCD screen merely displays the name of the active Knob and its value from 0 to 100.

<!--
**Free LFO** and **Sync LFO**:
* **Slope** = waveform **Shape**
    - **Ramp** (rising)
    - **Sawtooth** (falling)
    - **Triangle**
    - **Square**
    - **Sine**
    - **Logarithmic** (fast out)
    - **Exponential** (slow out)
    - **Parabola**

**Free LFO**:
* **Time** = **Frequency**
    - Oscillation period, in seconds

**Sync LFO**:
* **Time** = **Division**
    - Oscillation period expressed as the ratio of beats divided by oscillator cycles
    - Beats ÷ oscillations
    - E.g. 1/4 = one beat per four oscillations, 4/1 = four beats per oscillation

**CV** and **Audio**:
* **Time** = **Slew** rate
    - Similar to a lowpass filter, removes high frequency components of the control signal
* **Slope** = **Input** channel selector
    - If a channel pair is selected, then the modulation is the sum of the two channel values

**Random**:
* **Time** = **Rise**
* **Slope** = **Fall**
    - **Rise** and **Fall** constrain the random values, not the frequency of the noise
    - Setting **Rise** and **Fall** to zero freezes the noise at a constant value
    - Setting **Rise** and **Fall** to 100% gives the full range within the **LFN Gain** property set by the **Space** knob

Within a Modulation property page, the current mode is indicated by the following abbreviations:

* **Free LFO** = **LFO**, Low Frequency Oscillator
* **Sync LFO** = **LFSO**, Low Frequency Synchronized Oscillator
* **CV** = **LFCV**, Low Frequency Control Voltage
* **Audio** = **HFCV**, High Frequency Control Voltage
* **Random** = **LFN**, Low Frequency Noise 
-->

---

### MIDI Modulation

All Parameters can be additionally controlled via MIDI Continuous Controllers or MIDI Note messages. MIDI Modulation is documented in full in the [Modulation Guide](/docs/instruments/videomancer/modulation-operators.md). Controller and Note numbers can be assigned to Parameters manually or automatically via MIDI Learn. Any incoming MIDI is added to the Manual control value, and to any active Modulation Operator.

There's no Modulation operator for MIDI, it's always enabled.

---

### MIDI Output

Videomancer can control external devices via MIDI Continuous Controller messages. Send the values of Parameter Manual controls, active Modulation Operators, or their combined values. <!-- Or echo the MIDI input to the MIDI output with Thru mode.--> Choose the desired behavior from **System &#8594; MIDI Out Mode**.

| Option         | MIDI Out                             |
|:---------------|:-------------------------------------|
| Disabled       | None                                 |
| Manual+Mod     | Manual control + Modulation Operator |
| Manual Only    | Manual control only                  |
| Mod Only       | Modulation Operator only             |
<!--
| Thru           | Echo input messages                  |
-->

---

### MOTION

Press the **MOTION** button to display the current values of Timecode (**TC**) and Beats Per Minute (**BPM**).

<img src={videomancer_LCD_timecode_bpm} alt="Videomancer Timecode and BPM display" />
*Timecode and Beats Per Minute*

Modulation within Videomancer is usually linked to the Timecode displayed in MOTION mode. Videomancer can generate timecode internally, or [synchronize to MIDI](/docs/instruments/videomancer/user-manual#midi-synchronization).

Modulation is deterministic based on Videomancer's timecode. For example, oscillators begin with a phase of zero at timecode value `00:00:00:00`. If the Time properties of Modulation Operators don't change, then the exact same Modulation patterns are generated each time playback begins from zero.

#### Internal Synchronization

Press the **START** button to activate playback of internal Timecode.

Press the **STOP** button to deactivate playback of internal Timecode. The time index is reset to `00:00:00:00`.

When the transport is stopped, a left arrow ( **&larr;** )appears on the lower left of the display. When the transport is running, a right arrow ( **&rarr;** ) is displayed.

:::note
Videomancer does not have a manual pause button. Stopping playback sends the timecode value to zero, resetting all modulation. Use [MIDI Timecode](/docs/instruments/videomancer/user-manual#midi-synchronization) if you wish to pause and resume playback.
:::

#### Internal BPM Tempo

To change the **BPM** value numerically:
    - Press the **MOTION** button
    - Turn the Rotary Encoder

To change the **BPM** value rhythmically while playback is stopped:
    - Press the **MOTION** button
    - Press the **TAP** button once to begin sampling the tempo
    - Press the **TAP** button again to finish sampling the tempo

To change the **BPM** value rhythmically during playback:
    - Press the **TAP** button once to begin sampling the tempo
    - Press the **TAP** button again to finish sampling the tempo

The new tempo takes effect immediately.

#### MOTION Overview

Pressing the MOTION button a second time brings up the **Motion Overview** display.

<img src={videomancer_LCD_motion_overview} alt="Videomancer Motion Overview display" />
*Motion Overview*

The illustration above indicates the following:

- Parameter 1 Modulation Operator is **Free LFO**
- Parameter 3 Modulation Operator is **Turing Machine**
- Playback is stopped
- Beats Per Minute is 120.00
- Two Modulation Operators are active

The top row lists all active Modulation Operators. Each character or symbol to the right of the word **Mod** represents one of the 12 Parameters, in numerical order from left to right. The first place is Parameter 1, the second is Parameter 2, etc. The table below lists which Modulation Operator is signified by each symbol.

| Symbol | Modulation Operator | Symbol | Modulation Operator |
|:-------|:--------------------|:-------|:--------------------|
| <span class="system-ui">&bull;</span>      | Disabled            | K      | Comparator          |
| L      | Free LFO            | N      | Pendulum            |
| S      | Sync LFO            | W      | Drift               |
| C      | CV Input            | *      | Ring Mod            |
| A      | Audio Input         | #      | Cellular            |
| R      | Random              | P      | Pulse Width         |
| E      | Envelope            | J      | Peak Hold           |
| H      | Sample & Hold       | I      | Field Accum         |
| T      | Trigger Envelope    | /      | Slew Limiter        |
| Q      | Step Sequencer      | ~      | Perlin Noise        |
| F      | FFT Band            | Z      | Wavefolder          |
| D      | H Displace          | V      | Clock Div           |
| U      | Turing Machine      | ?      | Prob Gate           |
| B      | Bouncing Ball       | O      | Quantizer           |
| X      | Logistic Map        | m      | Mouse               |
| Y      | Euclidean Rhythm    | k      | Keyboard            |
| M      | Motion LFO          | g      | Gamepad             |
| G      | V Gradient          | t      | Tablet              |


The second row of the Motion Overview displays the state of the MOTION transport and the current Beats Per Minute. A left-facing arrow indicates that the transport is stopped, a right-facing arrow indicates that the transport is playing. To the right of the arrow, the current BPM value is displayed.

Also on the second row, the total number of active Modulation Operators is indicated by the word **Act:** followed by a number.

---

### MIDI Synchronization

A MIDI Clock or MIDI Timecode signal supplied to Videomancer automatically overrides the internal Timecode.

By default, Videomancer receives MIDI on all channels (Omni). Videomancer can also be configured to recognize only one of the 16 available MIDI channels, via **SYSTEM > Midi Channel**.

**BPM** setting is determined by incoming MIDI Clock or MIDI Timecode (MTC). Videomancer adopts the current incoming MIDI BPM tempo, even when the MIDI source is stopped. Any manual changes to BPM are overridden by incoming MIDI on the next beat.

Transport functions are also overridden by incoming MIDI Clock or MIDI Timecode. When the MIDI source starts or stops, Videomancer transport also starts or stops. However, if the MIDI source is stopped, Videomancer transport controls still function. We can press the **START** or **STOP** buttons to control playback while the MIDI source is not playing. However, we can't change the BPM as long as the MIDI source is transmitting MIDI Clock or MIDI Timecode.

MIDI Clock Start and Stop signals perform the same functions as the **START** and **STOP** buttons. MIDI Clock Stop resets the Videomancer timecode to `00:00:00:00`, regardless of the timecode value of the MIDI source. As a result, MIDI Clock Continue and Song Pointer messages have no effect. Therefore, in the Videomancer implementation, MIDI Clock is a relative time index, not an absolute one.

MIDI Timecode is an absolute time reference. Videomancer timecode follows the current MIDI Timecode value, but only during playback. Stopping or pausing the MIDI source causes Videomancer timecode to stop, but does not reset to zero. Starting the MIDI source causes Videomancer timecode to update to the incoming MIDI Timecode value, so we can pause and resume playback without resetting oscillator phase. Any other transport controls on the MIDI source, such as rewind, fast forward, or skipping to a different timecode value, have no effect on Videomancer's timecode. Videomancer only responds when MIDI Timecode plays or stops.

If the MIDI source transmits both MIDI Clock and MIDI Timecode, Videomancer gives priority to MIDI Clock. Videomancer timecode is reset to zero when the MIDI source stops.

---

### STATE Presets

The **STATE** button accesses factory or user-defined **Presets** for a particular Program. All Modulation and Parameter values are stored in non-volatile internal flash memory. Videomancer will commit your spell to memory, and recall it even after a power failure or reboot.

Programs can include up to eight Factory Presets, indicated by the letter **F**. User Presets are signified by the letter **U**. The currently loaded Preset number is followed by a slash, then by the total number of Presets, either Factory or User. Internal storage provides a total of 32 Preset registers.

<img src={videomancer_LCD_presets_F1_basic} alt="Videomancer Preset Selection display" />
*Preset Selection display*

**To load a Preset:**

* Press the **STATE** button
* Turn the Rotary Encoder to select a Preset number
* Press the Rotary Encoder to confirm the load operation

**To save a new User Preset :**

* Press the **STATE** button
* Long-press and hold the Rotary Encoder for at least two seconds
* Define the Preset name
    * Turn the Rotary Encoder to choose a character
    * Press the Rotary Encoder to advance to the next place
    * Repeat until the Preset name is completed
* Press the Rotary Encoder to confirm the save operation

**To overwrite an existing User Preset:**

* Press the **STATE** button
* Turn the Rotary Encoder to select a User Preset
* Long-press and hold the Rotary Encoder for at least two seconds
* Press the Rotary Encoder to confirm overwrite
* Define the Preset name
    * Turn the Rotary Encoder to choose a character
    * Press the Rotary Encoder to advance to the next place
    * Repeat until the Preset name is completed
* Press the Rotary Encoder to confirm the save operation


**MIDI Program Change**

Presets can be recalled remotely with MIDI Program Change messages, as described in the [Modulation Guide](/docs/instruments/videomancer/modulation-operators.md).

---

### MicroSD Card

Expand the storage capabilities of Videomancer with a **microSD** card. Load additional **Programs** and their associated **Presets**. In addition to the Programs provided by LZX, third party developers can create Programs with the [Software Developer's Kit](https://github.com/lzxindustries/videomancer-sdk).

#### Compatibility

All brands of microSD cards should be compatible with Videomancer. Storage capacities up to 2 TB are supported.

Format the microSD card on a personal computer. The FAT32 file system is recommended, but Videomancer also supports FAT12, FAT16, FAT32, and exFAT. 

#### Functionality

Presently, microSD card storage is limited to Programs and Presets. Additional functionality is planned, and intended to be integrated with the **LZX Connect** desktop application.

At boot time, Videomancer scans internal flash storage and microSD card for Program files with the extension `.vmprog`. In the case of duplicate filenames, Videomancer loads the highest version number, or the internally stored version.

:::note
By default, Videomancer ignores third party Programs or those with version numbers lower than 1.0.0. To load Programs developed by third parties, or currently in alpha or beta development stage, [Developer Mode](/docs/instruments/videomancer/user-manual#developer-mode) must be enabled. See below.
:::

Currently, Videomancer recursively scans the entire file system of the microSD card, looking for `.vmprog` files. You can organize Programs in any folder structure you like, and Videomancer will find them. However, be aware that the number of files and folders affects the time it takes for Videomancer to boot up. We recommend keeping the microSD card free of any extraneous data to minimize boot times.

#### Presets

Both Factory Presets and User **Presets** are stored in the same place from which the Program was loaded. Presets for internal Programs are stored in internal flash memory, Presets for microSD card Programs are stored on the card. **Factory Presets** are embedded in the `.vmprog` file. **User Presets** are stored in sidecar files with the extension `.toml`.

---

### Developer Mode

For testing purposes, Videomancer firmware may include Programs that are currently in development. These have version numbers lower than 1.0.0. Normally, they are hidden from the Videomancer Program Selection menu. To expose them, enable **Developer Mode** from the SYSTEM menu. When prompted to `**Restart Device?**`, choose `**Yes**` to reboot and rescan the internal and microSD file systems.

:::note
Any Programs in development may not have full functionality, will probably have bugs, and won't be publicly documented.
:::

---

## Firmware Update

Keeping Videomancer updated with the latest firmware ensures access to the latest programs, features, and bug fixes. The process is very simple and only takes a few minutes. It can be performed manually through the computer's file browser, or via the **LZX Connect** desktop application.

### Requirements

- Videomancer and power supply
- Windows, Mac or Linux computer
- USB-A to USB-C cable

### Manual Update Procedure

- Download the desired firmware `.UF2` file from the Videomancer [firmware repository](https://github.com/lzxindustries/videomancer-firmware/releases)  on GitHub
- Connect Videomancer to power supply and switch power to the **OFF** position
- Connect the computer's USB-A port to Videomancer's USB-C **Device** port (not the Host port)
- Hold down Videomancer **BOOT** button
- Switch Videomancer power to the **ON** position
- Release the **BOOT** button
- A new USB storage device is listed in the computer's file system. It shows up as a Raspberry Pi, because that's the control system for Videomancer's USB ports.
- Copy the firmware `.UF2` file to the newly detected storage device. Wait a few minutes for the transfer to complete.
- Videomancer automatically reboots into the new firmware and displays the currently installed version

---

## Developer Resources

Videomancer is an open-source FPGA-based video synthesis platform. LZX Industries provides comprehensive development tools and community resources for creating custom video processing programs.

### Videomancer SDK

The official Software Developer's Kit provides everything needed to develop programs for Videomancer with the VHDL hardware description language. The SDK includes build tools, documentation, example programs, and utilities for creating signed `.VMPROG` packages.

**Repository:** [github.com/lzxindustries/videomancer-sdk](https://github.com/lzxindustries/videomancer-sdk)

Key features:
- Complete FPGA development toolchain
- Program development and TOML configuration guides
- Example programs (passthrough, YUV amplifier)
- Visual TOML editor and validation tools
- Package signing with Ed25519 cryptography

### Videomancer Community Programs

A community repository for sharing FPGA video processing programs. This collection extends Videomancer's capabilities with effects, processors, and creative tools contributed by the community.

**Repository:** [github.com/lzxindustries/videomancer-community-programs](https://github.com/lzxindustries/videomancer-community-programs)

Key features:
- Community-contributed VHDL programs
- Automated build scripts for compiling programs
- Contributing guidelines for submitting your own programs
- GPL-3.0 licensed open-source contributions

Both repositories are licensed under GPL-3.0 and welcome community contributions.

