# Video Sync Generator

**Manufacturer:** LZX Industries
**Series:** Visionary
**ModularGrid:** [https://www.modulargrid.net/e/lzx-industries-video-sync-generator](https://www.modulargrid.net/e/lzx-industries-video-sync-generator)
**MG ID:** 1028
**Status:** Available

## Specifications

| Spec         | Value |
| ------------ | ----- |
| Width        | 6 HP  |
| +12V Current | 60 mA |
| -12V Current | 40 mA |
| +5V Current  | 0 mA  |
| MSRP         | $279  |

## Description

**Master NTSC/PAL video sync generator with external sync lock, sync bus access, RGB color bar generator, DC-restored external video input**

Video Sync Generator is one of two required modules in the LZX Visionary system, and serves as a master timing and clock generator for modules throughout a system. It’s primary companion is the Color Video Encoder, together these two modules create the framework to synthesize and process Composite video in the modular environment. In addition to a video sync signal generation, other features include access to the sync distribution buses, the creation of color bar reference signals, an external video input for external sync-locking, and a DC restored output for the Luma (Y) component of the external video signal.

SYNC OUTPUTS The four sync outputs on the front panel are 1V logic signals for Field rate, Line rate, Odd field rate, and Even field rate. These outputs can be used to sync Video Waveform Generator and other signal generator modules in order to create stable video patterns.

COLOR BAR OUTPUTS Color bar outputs are multiplications of the Line rate, and when patched directly to the Color Video Encoder can be used as a signal reference for calibration. They can also be used as logic signals to sync signal generators such as Video Waveform Generators. Unlike the other outputs, which are 1V signals, these are precisely adjusted to 0.75V to represent standard 75% saturation color bars.

SYNC DISTRIBUTION BUS INPUTS The Bus 1 &amp; 2 input jacks allow patch access to two signal buses which allow distribution of sync signals to Video Waveform Generator modules and other modules that implement sync bus selection. By default, these buses are connected to the Field &amp; Line outputs. By plugging into the Bus 1 &amp; Bus 2 jacks, this connection is broken and a different signal can be inserted into the bus. For more information on the sync distribution bus standards implemented by the LZX Visionary system, please review the Technical Details page.

DC RESTORED EXTERNAL VIDEO (Y) INPUT Video Sync Generator’s synchronization timing can be slaved to the timing of an external video signal inserted at the Video Input RCA jack. This video signal is also DC restored, sync-stripped, Chroma notch filtered, and output via the Y output jack for processing throughout the system.

EXTERNAL VIDEO SYNC LOCK To lock Video Sync Generator to an external video input to the Video Input RCA jack, flip the toggle switch to a downward position. The LED will turn on solid if a valid video signal is detected, or flash if no video signal is detected. Since the sync lock feature implements a Phase Locked Loop to control the internal clock, the system defeats Macrovision protection, and in the case of a non-valid or undetected video signal, operation of Video Sync Generator is undisturbed.

---

_Source: [ModularGrid](https://www.modulargrid.net/e/lzx-industries-video-sync-generator)_
