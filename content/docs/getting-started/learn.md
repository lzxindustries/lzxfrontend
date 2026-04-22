---
title: 'Learn Video Synthesis'
description: 'Discover what video synthesis is, the concepts behind it, and the standards that define LZX Modular.'
sidebar_position: 2
---

# Learn Video Synthesis

## What Is A Video Synthesizer?

A video synthesizer is an electronic instrument which creates or processes video images in real time. A modular video synthesizer is comprised of one or more electronic modules. Each module performs a specific function, such as shape generation or color mixing. Modules are connected to each other with patch cables in an open ended manner which encourages experimentation and offers a wholly immersive creative experience. A large system of modules may be purchased at once, or it may be built up over time, according to an artist's specific creative goals.

> **Ready to explore?** Browse all [LZX Instruments](/instruments) and [Eurorack Modules](/modules), or check out our [Starter Systems](/systems) for curated configurations.

## Quick Facts About LZX

*   The LZX mission is to preserve and expand upon tools available to the video art movement from the 1960s thru the 1980s. LZX exists as a counterpoint to the worlds of mainstream broadcast equipment and GPU based video processing software.
*   LZX started as a DIY project in 2008, and then evolved through several series of modular instrument designs. Previous generations of LZX modules were referred to as the Visionary series (2011), Expedition series (2015), and Orion series (2018). The current modular series (2022) is referred to as just LZX Modular, or Gen3.
*   LZX products are manufactured in Portland, Oregon at the LZX workshop.
*   Modules are compatible with EuroRack cases and patch cables used by modular audio synthesizers.
*   Modules can be powered by 12V DC "wall wart" adapters or by EuroRack power supplies.
*   External video inputs and outputs are the same as the Component & Composite connections found on most televisions and some cameras.
*   Patchable signal levels are in the 0 to 1V range; This is lower than most audio modules (0V-10V), but inputs are tolerant of any voltage produced by a EuroRack system.
*   Voltage control inputs are capable of very high frequencies, allowing signals such as camera images to modulate oscillators or VCAs.

![/media/GettingStartedWorkshop.jpg](/media/GettingStartedWorkshop.jpg)

# Concepts

## Generators

### Ramp Generator

A ramp generator is a waveform generator which produces analog waveforms synchronous to the horizontal or vertical dimensions of the video screen. It is a common component of analog graphics modules, such as shape and pattern generators.

### Voltage Controlled Oscillator (VCO)

A voltage controlled oscillator is similar to a ramp generator, only its frequency may be changed or modulated. A voltage controlled oscillator may be free running, or reset in time with the video sync to synthesize a stable pattern.

### Frame Synchronizer

A frame synchronizer takes an external video feed and synchronizes it with the system's internal timing. A frame synchronizer is usually required to input multiple external video sources into your system like cameras and media players.

## Functions

Modules often contain many analog functions. Some modules may have similar internal function blocks, but different strategies for allowing the user access to them.

### Comparator

Also known as a hard key generator or 1-bit ADC (Analog-to-Digital converter) function. When the positive input voltage is greater than the negative input voltage, the output is 1 volt (White Level). Otherwise, the output is 0 volts (Black Level).

### Clipping Amplifier

Also known as a soft key generator or wide range contrast processor. The output is created by amplifying the video source to create a high contrast mask with variable edge width.

### Encoder

A video encoder takes 1 volt scale unipolar signals for Red, Green & Blue color channels, and performs all operations required to convert them into a video signal for display or recording.

### Negative

Also known as a voltage mirror. The output is equal to the input voltage is subtracted from 1 volt (White Level).

### Doubler

Also known as a saw-to-triangle waveshaper, the doubler is a combination of an absolute value function and clipping amplifier function.

### Logarithmic Amplifier

An logarithmic amplifier changes a linear input voltage into an output with logarithmic scale.

### Exponential Amplifier

An exponential amplifier changes a linear input voltage into an output with exponential scale.

### Summing Amplifier

Also known as a Mixer. A summing amplifier adds two or more voltages to each other. The voltages may be unipolar or bipolar scale.

### Minimum Value

A minimum value function compares two or more inputs, and passes the input with the least voltage to the output.

### Maximum Value

A maximum value function compares two or more inputs, and passes the input with the most voltage to the output.

### Absolute Value

An absolute value function inverts all values below zero and forces the output to be positive.

# Standards

## Electrical

LZX Modular proposes an interface specification for wide bandwidth analog computing instruments. It is optimized for, but not limited to: (1) generating and processing analog RGB video graphics in SD/HD resolutions, (2) affordable devices which are accessible to working artists and not just big studios, and (3) maximum patchability via a universal DC voltage range and high impedance connections.

### Patchable Signals

Waveform generators, video sources, boolean logic, and control voltages all share the same voltage ranges and IO connectors. Cross patching different signal types is an encouraged use of the system.

Connectors: 3.5mm mono jacks
Cables: 3.5mm patch cables
Unipolar Scale: 0 to +1V DC
Bipolar Scale: +/-1V DC
Minimum Bandwidth: 5 MHz
Input Impedance: 100K ohms

### Video

0 IRE (Black Level) and 100 IRE (White Level) are scaled to the patchable unipolar range.

### Logic

Inputs to logic gates, multiplexer controls, and other CMOS functions must have an analog voltage comparator frontend, for converting any voltage into a binary signal.

Comparator Threshold: 0.5V DC

## Mechanical

LZX Modular is based on the form factor specified by Doepfer in their [A-100 Construction Details](https://doepfer.de/a100_man/a100m_e.htm) manual.

In addition to conforming to Doepfer's standard, LZX Modular is designed according to the following dimensional reference.

Frontpanel Width: (HP \* 200) - 12 mils
Frontpanel Height: 5058 mils
Rear PCB Assembly Max Width: (HP \* 200) - 40 mils
Rear PCB Assembly Max Height: 4370 mils

## Video Timing

The current generation of LZX Modular supports 15 video sync formats.

*   NTSC
*   PAL
*   480p
*   576p
*   720p50
*   720p5994
*   720p60
*   1080p2398
*   1080p24
*   1080p25
*   1080p2997
*   1080i50
*   1080i5994
*   1080i60

Products released before 2020 supported 2 video sync formats.

*   NTSC
*   PAL

# Glossary

## key

any video signal used to control a transition between two or more other video signals

## hard key

a boolean logic signal which switches between two signals.

## key generator

a module designed to condition an input for the purpose of keying operations

## soft key

an analog voltage representing the mix ratio between two video signals

## hard key generator

typically implemented as a differential analog comparator.

## soft key generator

typically implemented as a high gain differential amplifier with black and white level clipping

## chroma key generator

processes the chroma components (PbPr) of a component video signal, allowing key extraction based on Hue and Saturation of the video source

## luma key generator

processes the luma component (Y) of a component video signal, allowing key extraction based on the overall brightness of the video source

## multi level key generator

produces multiple key signals from a single source, and are often used as the frontend for colorizers and sequencers

## component key generator

acts on one color channel at a time, but still includes the entire colorspace in its output function

## window key generator

has dual threshold controls, either Upper/Lower or Span/Center

## fader

a module which performs a transition between two video sources. typically it has a direct key input, without much local control over the key itself.

## keyer

a module which has both a key generator and a fader or switcher

## linear colorizer / multi level keyer

combines multiple faders with a multi level key generator function to produce a transition across more than two inputs
