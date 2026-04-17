---
draft: false
title: 'Standards'
sidebar_position: 3
description: 'Technical standards for LZX EuroRack modules including power requirements, signal levels, and compatibility.'
---

# Standards

LZX modules are compatible with standard Eurorack cases and patch cables for audio synthesizers. They can be powered by 12 volt DC "wall wart" adapters or by EuroRack power supplies.

Established video format standards are fully supported. Connections to an LZX system are made via conventional means such as RCA jacks. All LZX systems are compatible with standard definition video in both NTSC and PAL formats. Gen3 systems additionally support a wide range of high definition formats. Earlier generation modules that don't require sync are compatible with HD signals.

LZX developed a new system for encoding video that's optimized for modular synthesis. It's actually a spec for wide bandwidth analog computing, optimized for video. A primary design goal is affordability, making tools accessible to working artists, not just big studios.

Another top priority is maximum patchability: all LZX systems share a universal electrical and mechanical standard. Video sources, pattern generators, control voltages, and binary logic signals all use the same voltages, impedence, and physical connectors. Cross-patching different signal types is strongly encouraged. The LZX standard and all LZX products are designed to give artists total freedom and flexibility to combine signals in any way imaginable.

---

## Electrical

All LZX modules are designed so that signals of any frequency range can be patched into any inputs. High frequency video, mid-freqency audio, and low frequency control voltages can be combined in any way. This opens up many creative possibilities. For example, a video image or pattern can _modulate_ any signal such as an oscillator or another video image.

In the LZX patchable standard, signals generally range from zero volts to one volt. The zero to one volt range range is slightly greater than conventional analog video, which is approximately 0.7 volts.

The LZX voltage range is much less than most audio synths, which are typically 0-10v or +/-5v. LZX modules are tolerant of any voltage produced by a Eurorack system. There's no risk incurred by connecting audio modules directly to video modules. A voltage divider gives best results when incorporating audio modules in an LZX system, Additionally, many LZX modules can accept bipolar signals with negative voltages, but visible picture information is usually constrained to the zero to one volt range.

- Unipolar Scale: 0 to +1 V
- Bipolar Scale: +/-1 V
- Minimum Bandwidth: 5 MHz
- Input Impedance: 100K ohms
- Video range: 0 IRE (black) and 100 IRE (white) are scaled to the 0 to +1V unipolar range
- Binary signals: inputs to logic gates go through a comparator to convert continuous analog voltages to binary
- Binary threshold: 0.5 V DC

---

## Mechanical

LZX Modular is based on the form factor specified by Doepfer in their [A-100 Construction Details](https://doepfer.de/a100_man/a100m_e.htm) manual.

In addition to conforming to Doepfer's standard, LZX Modular is designed according to the following dimensional reference.

- Front panel width: (HP \* 200) - 12 mils
- Front panel height: 5058 mils
- Rear PCB Assembly max width: (HP \* 200) - 40 mils
- Rear PCB Assembly max height: 4370 mils

---

## Video Formats

### Currently supported formats

The current generation of LZX Modular supports the following standard definition and high definition video formats.

| Current input standards |
| ----------------------- |
| NTSC 486i59             |
| PAL 576i50              |
| 480p                    |
| 576p                    |
| 720p50                  |
| 720p59                  |
| 720p60                  |
| 1080i50                 |
| 1080i59                 |
| 1080i60                 |
| 1080p23                 |
| 1080p24                 |
| 1080p25                 |
| 1080p29                 |
| 1080p30                 |
| 640x480p60              |
| 800x600p60              |
| 1024x768p60             |

### Legacy video formats

Products released before 2020 supported standard definition video formats.

| Legacy input standards |
| ---------------------- |
| NTSC 486i59            |
| PAL 576i50             |
