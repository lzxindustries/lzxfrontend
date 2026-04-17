---
slug: chromagnon-fpga-deeper-dive
title: 'Chromagnon: FPGA Deeper Dive'
authors: [lars]
tags: [chromagnon, behind-the-scenes]
draft: false
---

Yesterday's [Chromagnon update](/blog/chromagnon-building-it-right) generated a lot of great discussion on [Discord](https://discord.gg/lzx) about the move to FPGA-based signal processing. I ended up writing quite a bit in the thread answering questions, and wanted to collect those thoughts here for everyone who wasn't following along.

<!--truncate-->

FPGA has always been the right answer for this instrument design. I have just been very stubborn in not seeing that. The decision is about delivering the best instrument I can, and knowing it is not going to have issues in the field with bandwidth, noise, or lack of precision. The cost of both approaches is about the same. The savings have more to do with IO infrastructure -- the original design used some much more expensive parts than necessary, which made the project unfeasible post-tariffs, hence the redesign.

## What Changed

Chromagnon is a hybrid analog/digital instrument both before and after the updates -- just different configurations thereof. What's changed is that I am using high speed digital signal processing for the multiplier blocks, rather than discrete analog multiplier circuits. In order to do that, I now need a large number of high speed ADC/DAC parts -- which cost about the same as the discrete analog multiplier blocks they replace. So the change is more about _how we are multiplying things_ than anything else. Chromagnon's design requires 24 multipliers, whether they are analog or DSP based.

A simpler way to think about it: Chromagnon has ring mod and wavefolders in its signal path. Those moved from analog to DSP, but everything else stayed the same.

The side benefits are that the signal path is more malleable, and it becomes possible to support alternate firmware or make improvements after launch.

## What Hasn't Changed

There have never been any analog oscillators or ramp generators in Chromagnon's design. Those have always been digital and part of the timing/sync system. The IO signal path and modulation signal path are all still analog, can be processed externally and in feedback with analog processors, and will still contain analog artifacts.

For Rutt/Etra style scan processing, you still need an external XY monitor, and if anything the high speed DSP multiplication will only improve fidelity for that application. The classic scanline displacement effect comes from summing luma with the XY signals -- that remains purely analog. It's just the multiplication stages (for wave shaping, rotation, and curve shaping) that become DSP based.

It is disappointing for me to not use some of the circuits I have put so much work into. But ultimately it is the Chromagnon instrument design that I am selling. That is the user controls, the signal flow, and the IO points. The rest is implementation details.

## An Audio Analogy

If you're coming from the audio POV, here is a good analogy: FM synthesis.

The Yamaha DX7 was a DSP engine that enabled sounds impossible to produce with analog circuits easily -- bell tones, metallic textures, etc. People have tried to make "analog FM synthesis" many times, which is an interesting and perhaps worthy pursuit, but extremely difficult and expensive -- requiring thermal perfection and pitch tracking perfection to get close to the same sound.

Now swap things around -- instead of "FM operator synthesis," with Chromagnon we have "complex graphics/shape synthesis." The bell tone is analogous to shapes with complex curves like circles and spirals. Not impossible to do in analog, but the engineering requirements to produce things like "my rotation is not wobbly" or "my diamond doesn't have rounded edges" are extremely difficult to pull off -- the same way analog FM operators would be. You can think of it like I've been trying to make an analog FM synth with Chromagnon. Not the greatest idea, unless I had an unlimited budget and the device can cost $4000+ (which in this case, is not possible.) I tried to implement with discrete analog, which made it all even harder. With FPGA I am moving to a more natural fit -- making the core synthesis engine DSP-based fits the design much better. It will be capable of a lot more range than the analog multipliers would have allowed, and produce those complex shapes in a way that highlights the instrument design itself.

---

If you missed yesterday's post covering the full production plan and schedule, [start there](/blog/chromagnon-building-it-right). See you in April with board designs to show.

Lars
