---
draft: false
title: "Troubleshooting"
sidebar_position: 6
description: "Troubleshooting guide for diagnosing and resolving common issues with LZX modular video synthesizer systems."
---

#  Troubleshooting

## Halp!

***I suspect something isn't working. How should I troubleshoot the system?***

---

## Isolate the problem

Keep it simple. Simplify your patch to the least number of cables or connections that create the issue you're seeing. Sometimes this will reveal the problem. If you jump into more complex theories right away, you may miss simple answers, like a defective patch cable or a neglected setting.

---

## Insufficient power?

**The system may be drawing more current than the 12V barrel or Euroack power supply can provide.**

Underpowering the system can result in a variety of glitchy behavior &mdash; not the good kind of glitch. Add up the current consumption required by all modules sharing the same power source. Verify that this is less than the current supplied by the power supply. If total consumption is close to or greater than the supplied current, the system is underpowered. Upgrade the power supply, or add another one to power some modules. A common configuration is to power all audio modules with a standard Eurorack power supply, and all LZX modules with **DC Distro** or **Bus 168**.

---

## Testing methodology

**Test modules in isolation.** 

Disconnect all modules from the system, and connect only the output encoder, such as ESG3, to the power supply. After verifying it works correctly, power up the next module. Keep going until the issue recurs. If the issue reappears near the current limits of the power supply, upgrade the power supply. If the issue seems to be connected to a specific module, focus on troubleshooting that module.

---

## Picture dropout

**"My synthesizer's video output is intermittent!"**

### External equipment issues

Verify the functionality of the destination video device connected to the synthesizer output. Check to see if the destination device can accept a video signal from a different source device. Using different cables, connect a different device that outputs the same video format as the synthesizer. If the same issue occurs, then the destination device is defective or may not properly support the current video format. Contact the manufacturer for advice on further troubleshooting.

### Cable defects

Try different video cables. If the issue is resolved with the new cables, then the previously used video cables are defective.

### Cable length

Because video is a much higher frequency than audio, the length of video cables can be a factor. Signals can be degraded over long cable lengths. High quality video cables are generally capable of carrying a clean signal 10 meters or more, but consumer cables may not be manufactured to those standards. Try different video cables, no longer than 2 meters in length. If this resolves the issue, use the shorter cables, or invest in higher quality cables. For very long cable runs, a video distribution amplifier (DA) may be required.

### Adapters and splitters

Connection adapters such as RCA to BNC may introduce problems such as signal dropouts and visual artifacts. Eliminate or reduce the number of adapters to test if they may be contributing to picture dropout. Splitters such as "T" adapters or passive (unpowered) video distribution boxes can also cause issues. 

:::note
Signal current is divided by the number of destinations. If a signal is split three ways, the current to each input is only 1/3 of normal. For configurations requiring the same video signal to be sent to multiple destinations, a video distribution amplifier will prevent any drop in current level, helping avoid signal degradation and dropouts.
:::

---

## Manufacturer Warranty

For warranty coverage details, see our [Warranty Policy](/policies/terms-of-service#warranty). To request service, contact support@lzxindustries.net