---
draft: false
title: "Glossary"
sidebar_position: 8
description: "Glossary of key terms used in video synthesis, video art, and modular video synthesizer systems."
---

# Glossary
&nbsp;

The following terms are commonly used in the contexts of video, video art, and video synthesizers. Knowing the meaning of these terms is essential to getting the most out of your video synth.

---

### Absolute value

A math function that converts all values to positive. All negatively signed values below zero are inverted, forcing the output to be positive.

### Analog logic

A category of circuits that perform logical operations on continuous analog signals. In contrast to binary Boolean logic, analog logic can produce continuously variable outputs. LZX modules that employ analog logic include DSG3 and FKG3.

### Bipolar

A signal that may include both positive and negative voltages. Compare to [unipolar](/docs/guides/glossary#unipolar), which only includes positive voltages. In LZX systems, the final video output to the encoder is unipolar only. 

Many modules can only handle unipolar signals. However, some modules such as [Swatch](/docs/modules/swatch) require bipolar signals. Others, such as [DSG3](/docs/modules/dsg3) and [Contour](/docs/modules/contour), can optionally accept bipolar signals, but can only output unipolar signals. Utility modules such as [Proc](/docs/modules/proc) and [PGO](/docs/modules/pgo) can convert between unipolar and bipolar signals.

### Blending

A type of [layering](/docs/guides/glossary#layering) in which exactly two images are combined using a math operation such as sum or difference. Blending operations can be simple or complex. Image editing applications feature complex blend modes such as *screen* or *overlay*. LZX modules such as DSG3 and Arch use [analog logic](/docs/guides/glossary#analog-logic) to blend two signals in interesting ways. See [compositing](/docs/guides/glossary#compositing).

### Chroma

Abbreviation of *chrominance*, the color of a video signal. In composite and S-video formats, all color information is combined into a single signal component that carries the hue and saturation of the picture. In chrominance-based component video formats, color is encoded in color difference channels. In the native RGB space of video, chroma is inherent in the red, green, and blue primary color channels. See [luma](/docs/guides/glossary#luma).

### Chroma key

A video [keying](/docs/guides/glossary#key) process in which the key stencil is extracted based on [chrominance](/docs/guides/glossary#chroma) of the video source. A common application is the "green screen" or "blue screen" process, where a figure can be extracted from a blue or green background, and composited with some other video source.

### Clipping amplifier

A circuit that increases the contrast of a signal until information is gradually discarded. One application is a [soft key](/docs/guides/glossary#soft-keyer), a high contrast mask with variable edge width. Another application is sine waveshaping, where a linear distribution of signal values is converted to a sine wave distribution. Also known as a wide range contrast processor.

### Comparator

A binary output circuit that compares two signals. Usually this takes the form of a continuously variable analog signal compared to a set threshold. If the input is greater than the threshold, the circuit outputs a positive voltage, or a binary value of one. If the input is less than the threshold, the output is zero. Also known as a one-bit analog-to-digital (ADC) function. A high-speed video comparator is also known as a [hard key generator](/docs/guides/glossary#hard-key-generator).

### Component key generator

A type of [chroma key](/docs/guides/glossary#chroma-key) generator that acts on a single color channel. Conventional production chroma keyers allow the user to dial in any hue as the key source. A component key generator such as [FKG3](/docs/modules/fkg3) can only key a mask off of a pure red, green, or blue color channel.

### Compositing

A type of [layering](/docs/guides/glossary#layering) in which two or more images appear to be stacked over one another, or in front of one another. Compositing requires a mask or stencil, often called a *matte* in film compositing, and *alpha channel* in computer graphics, or a [key](/docs/guides/glossary#key) in video terms. The various layers of a composite image may have different levels of transparency, allowing some layers to [blend](/docs/guides/glossary#blending) with others.
### Encoder

An *encoder module* accepts arbitrary signals in the zero to one volt range and outputs conventional, standard video. An encoder is required to convert modular signals to legal video that can be displayed or recorded.

In the context of the LZX [TBC2](/docs/modules/tbc2) module, *encoder* has a different meaning. The Encoder submodule of TBC2 accepts digital video from one of various sources, converts it to analog, and outputs LZX 1 volt patchable signals.

### Exponential amplifier

A circuit that performs an exponential function. Scales a linear input to an exponential output, staying within the zero to one range. The effect is increased contrast and overall darker tones. The inverse operation is performed by a [logarithmic amplifier](/docs/guides/glossary#logarithmic-amplifier).

### Fader

A circuit or module that produces a continuous transition between two video sources. At slow transition speeds in the range of seconds or frames, the result is a visible crossfade between two images. At high transition speeds of less than a frame, the result is a composite of the two images, a [soft key](/docs/guides/glossary#soft-keyer). The fader circuit generally accepts two signal source inputs and a third, external key input to drive the transition between sources.

### Frame synchronizer

A digital device that synchronizes a free-running video signal to some other sync timing reference. Also known as a time base corrector (TBC), or frame store. Each frame of incoming video is held in a memory buffer, then output in precise sync with a different clock source. A frame synchronizer is required to send multiple free-running ("wild") video sources into the a video synth.

### Frequency doubler

A circuit that doubles the frequency of a signal. Also known as a rectifier or saw-to-triangle waveshaper. In the LZX implementation, values above 0.5 are reflected downward, inverting their slope so that an input value of one is mapped to an output value of zero. The result is then scaled up to the full range of zero to one volts.

### Genlock

A process, state, or connection in which a video device is externally synchronized to some other device. The term *genlock* is commonly used as a verb or an adjective. In a historical video studio, all devices have *genlock inputs* and are *genlocked* to *house sync*. All devices are synchronized to a single reference, so that their signals can be combined seamlessly and free of glitches. 

The same situation applies to the internal workings of a modular video synthesizer. All modules that require sync must be genlocked to the same reference timing, provided by the sync generator module such as [ESG3](/docs/modules/esg3). To send a video signal into the synthesizer, either the external device must be genlocked to the sync generator, or the sync generator must be genlocked to the external device. For multiple video sources, everything must be genlocked to a single reference. But today, only the most advanced professional video equipment has genlock capability. Ordinary consumer cameras, VCRs, etc. can't be genlocked. The [TBC2](/docs/modules/tbc2) module solves this problem by sampling two incoming video streams with [frame synchronizers](/docs/guides/glossary#frame-synchronizer).

### Hard key generator

A type of [key generator](/docs/guides/glossary#key-generator) that produces sharp, crisp edges. Typically implemented as a high-speed analog [comparator](/docs/guides/glossary#comparator).

### Hard keyer

A circuit that performs a binary Boolean logic operation to switch between two signals. A mask generated by a [hard key generator](/docs/guides/glossary#hard-key-generator) provides the input signal for the switching operation. In a video context, the result is two images composited together with a hard edge between them.

### Key

The term *key* is used in multiple ways in video. The strictest definition is a video signal that controls a transition between two or more other video signals. Conventionally, a key is a video image that acts as a mask to composite two other images. It's also commonly known as an *alpha channel* or *matte*. A key is created by a [key generator](/docs/guides/glossary#key-generator). The key generator output is applied as the key source to a [keyer](/docs/guides/glossary#keyer), which uses the key to mask and composite two images.

In common usage, the term *key* can refer to the mask, or to the final composited output of the keyer.

*Key* is also a verb, referring to the act of generating or "cutting" a key mask, or to the global process of key compositing.

### Key generator

A circuit or module that converts an incoming signal to a [key](/docs/guides/glossary#key) or mask channel for compositing operations.

### Keyer

A device that performs a [key](/docs/guides/glossary#key) compositing operation. Also known as a *keying compositor*. A keyer usually includes an integrated [key generator](/docs/guides/glossary#key-generator). However, many video synth modules can act as keyers if a key mask is provided by an external key generator.

### Layering

Any combination of two or more images or video streams. See [blending](/docs/guides/glossary#blending) and [compositing](/docs/guides/glossary#compositing).

### Logarithmic amplifier

A circuit that performs a logarithmic function. Scales a linear input to a logarithmic output, staying within the zero to one range. The effect is reduced contrast and overall brighter tones. The inverse operation is performed by an [exponential amplifier](/docs/guides/glossary#exponential-amplifier).

### Luma

Abbreviation of *luminance*, the brightness of a video image. Often represented by the letter *Y*. If all color saturation is removed from a video image, luma is what remains. Composite, S-video, and YPbPr component video formats carry luminance separately from color in various ways. In the native RGB space of video, luminance is inherent in the red, green, and blue primary color components.

### Luma key generator

A [key generator](/docs/guides/glossary#key-generator) that extracts a key based on [luminance](/docs/guides/glossary#luma) of a video source.

### Maximum value

A math function that compares two or more inputs, sending the highest value to the output.

### Minimum value

A math function that compares two or more inputs, sending the lowest value to the output.

### Multi-level key generator

A complex circuit that extracts multiple [keys](/docs/guides/glossary#key) from a single source. The generated keys are often used as the sources for colorizers and sequencers. A multi-level key generator creates key masks associated with particular ranges of brightness values, which can then be used to design posterization and colorization effects.

### Negative

A circuit that inverts a signal. Also known as a voltage mirror. For a video image, dark and light tones are reversed. This is achieved by subtracting the input signal from white, or a static voltage of one volt.

### Ramp generator

A module or circuit that outputs a linear waveform synchronized to the horizontal or vertical dimension of the video image. Technically, it's a rising sawtooth wave with a period equal to one frame of picture information (vertical ramp), or one line of picture information (horizontal ramp). Ramps are common components of analog graphics modules, such as shape and pattern generators. They provide source coordinates for direct synthesis operations. Each location within the frame can be represented by a pair of values: the brightness of the horizontal and vertical ramps at that point.

### Soft key generator

A type of [key generator](/docs/guides/glossary#key-generator) capable of creating a key with a soft edge border or transition. Typically implemented as a high gain [clipping amplifier](/docs/guides/glossary#clipping-amplifier).

### Soft keyer

A type of [keyer](/docs/guides/glossary#keyer) capable of compositing images with a soft edge border or transition between them.

### Summing amplifier

A circuit or module that adds two or more voltages. Also known as a *mixer*. The voltages may be unipolar (positive values only) or bipolar (positive and negative values).

### Sync

*Sync* refers to the timing signals of video. These precisely determine when a video frame starts and ends, and when a single line of video starts and ends. Sync is an absolute hard requirement for all analog video. Without it, video can't exist. 

LZX and most other video equipment uses *composite sync*. This is a type of sync that can stand alone or be embedded within an analog video stream. Composite sync combines the vertical sync pulses controlling frame rate and the horizontal sync pulses controlling individual scanlines. 

If sync is altered or missing, the result is corrupted video. This is why some glitch devices produce video that cannot be recorded, and needs to be rephotographed from a very forgiving monitor such as a cathode ray tube (CRT).

### Time base corrector (TBC)

See [frame synchronizer](/docs/guides/glossary#frame-synchronizer).

### Unipolar

A signal with only positive voltages. Compare to [bipolar](/docs/guides/glossary#bipolar), which is a signal that may include negative voltages. In LZX systems, video is unipolar. The final output sent to the encoder must be unipolar. Any voltages outside the zero to one volt range cannot be used, and are ignored.

### Voltage-controlled oscillator (VCO)

A module or circuit that generates a periodic waveform such as a sawtooth or sine wave, whose frequency may be controlled by another signal. Any VCO can run freely, in sync with nothing. The oscillation of some VCOs can be reset with another signal. Resetting the oscillator with video sync produces a pattern that is stable relative to the video frame.

### Window key generator

A [key generator](/docs/guides/glossary#key-generator) with two thresholds instead of just one. Values below the low threshold and above the high threshold are clipped to zero, or black. Values between the two thresholds are rendered as white, or a value of +1 volt. The center range of values is the eponymous "window" that gives this type of key generator its name.
