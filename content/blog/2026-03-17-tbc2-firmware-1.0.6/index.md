---
slug: tbc2-firmware-1.0.6
title: 'TBC2 Firmware 1.0.6'
authors: [lars]
tags: [gen3, software]
image: /docs/img/social-card.jpg
---

TBC2 firmware version 1.0.6 is now available for download.

<!--truncate-->

## Changelog

### Bug Fixes

- Fixed decoder getting stuck in a scanning loop on certain inputs
- Fixed OLED preview scrolling during PAL-to-NTSC conversion
- Fixed HD component input sync glitch causing picture displacement
- Fixed encoder output not following source selection
- Fixed bouncing ball screensaver going off-screen
- Fixed various crashes and stability issues

### New Features

- Added letterbox scaling for cross-format conversions
- Added confirmation prompts before firmware update/reset
- Added invert and triangle controls to ramp generator
- Shows error when SD card or BOOT.bin is missing during firmware update

### Improvements

- Ramp phase control now goes from 0–360 degrees
- Renamed shutdown button to "Save & Restart"
- Decoder GUI adapts layout to input/output resolution

## Download

- [TBC2 Firmware 1.0.6](/firmware/tbc2_1.0.6/tbc2_1.0.6.zip)

See the [TBC2 documentation](/docs/modules/tbc2) for firmware update instructions.
