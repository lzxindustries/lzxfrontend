---
slug: chromagnon-testing-w2
title: Chromagnon Testing W2
authors: [lars]
tags: [chromagnon]
---

Hello friends,

It's nice and sunny here in SE Portland. This week was another steady week of Chromagnon testing and firmware updates for the new core assembly, with a few foibles.  (My trusty lab laptop needs a new power jack installed.)

<!-- truncate -->

Last week we ended the Chromagnon Core RevF verification process -- testing that all circuits are passing signal and the embedded system is communicating with all of its peripherals. This week we entered the validation process -- that is, testing that all functions are working as desired.  To do that, I compare the model for the design, represented by a software simulation, against the measured output of each circuit (using my oscilloscope and other testing tools.)   

Part of the challenge of designing complex hardware systems like Chromagnon, is that you can not power up a new board until it's already designed, fabricated, and assembled.  So the verification & validation processes need to happen in cycles, with the board being revised to fix issues in each iteration. 

Since designing the LZX Visionary modular series, we have used software simulations and spreadsheets for validating the functional model of a module or device.  

As a simplified example, our typical attenuverter circuit could be modeled something like this:

- Given POTENTIOMETER is a bipolar voltage up to +/-1.00V
- Given INPUT is a bipolar voltage up to +/-2.00V
- The OUTPUT voltage shall be represented by the following formula:
- OUTPUT = INPUT * POTENTIOMETER

Now that we have defined a functional model, we can write a test plan:

- Set POTENTIOMETER to 1.00V
- Set INPUT to 1.00V
- Measure OUTPUT voltage

And pass/fail conditions:

- PASS: Output measurement is 1.00V
- FAIL: Output measurement is not 1.00V

My job right now involves working through a list of hundreds of cases like this, comparing results to the software simulation I wrote last quarter.  Next week I expect to be moving past all the tests, applying the edits to the circuit board design, and tackling a few missing firmware functions -- like range calibration for the rotation function, and user prompted firmware upgrade via SD card. 

**Rob asked "There's a few modules from other toolmakers which play nicely with LZX modules (the one I'm specifically thinking of is BPMC's Fluxus Duo.) Is there anything different about the Chromag's build that would change said interactivity, or should those modules also be compatible?﻿"**

Chromagnon follows the same voltage and IO standards as the modular system. Glitch type devices may always cause issues with certain displays or any video devices, of course.  Usually you want the glitch to be between the output and a display that's tolerant of the glitches.  So for example, you could patch Chromagnon's composite video output into a Fluxus Duo, and then to a CRT display -- that would be a natural combo!

Got more questions? Ask ‘em here: https://wkf.ms/47lhPPA

Until next time,
Lars