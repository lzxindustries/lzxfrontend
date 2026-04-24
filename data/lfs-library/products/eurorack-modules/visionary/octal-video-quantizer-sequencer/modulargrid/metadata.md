# Octal Video Quantizer & Sequencer

**Manufacturer:** LZX Industries
**Series:** Visionary
**ModularGrid:** [https://www.modulargrid.net/e/lzx-industries-octal-video-quantizer-sequencer](https://www.modulargrid.net/e/lzx-industries-octal-video-quantizer-sequencer)
**MG ID:** 1409
**Status:** Available

## Specifications

| Spec  | Value |
| ----- | ----- |
| Width | 18 HP |
| MSRP  | $599  |

## Description

**amplitude classification, sequential multiplexing**

8 stage video quantizer &amp; sequencer is a complex key generation and high speed switching module. it consists of eight high speed analogue switches, only one of which is active at any time. each switch has an independent input and output, along with a bias control which is summed with the input. there is also a global sum input which feeds a signal to the inputs of all eight switches, and a global sum output which shows the output of the currently selected switch.

the quantizer takes whatever signal is input to the classify input and splits it into eight amplitude bands distributed evenly between upper and lower threshold points. the upper and lower threshold voltages also have control voltage inputs and attenuverting controls for modulation. the output of the quantizer is a number between 0 and 7.

the sequential clock also has eight steps from 0 to 7 and functions separately from the quantizer. when a clock pulse is received, the sequential clock counts upward by one. when a reset pulse is received, the clock resets to a value of 0.

the values of the quantizer and sequencer are summed together and wrapped around, the value of this sum determines which of the eight video switches is currently active. for example, if both the quantizer and sequencer have a current value of 0, then the selected switch is also 0 (0+0=0), which is the first switch. if the value of the quantizer is 2, and the value of the sequencer is 7, then the sum wraps around and the currently selected switch is the second switch (7+2=9, 9-8=1.)

if this sounds complicated, a starter patch will make things more clear. patch a video signal into the classify input. monitor the sum output. play with the bias controls on each switch channel, and the upper/lower threshold values. then press the clock button and see how the amplitude bands rotate their values cyclically.

---

_Source: [ModularGrid](https://www.modulargrid.net/e/lzx-industries-octal-video-quantizer-sequencer)_
