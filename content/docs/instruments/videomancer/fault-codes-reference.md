---
draft: false
sidebar_position: 4
slug: /instruments/videomancer/fault-codes-reference
title: "Fault Codes Reference"
description: "Reference table for Videomancer fault codes displayed on the LCD during error conditions."
image: /img/instruments/videomancer/videomancer_frontpanel.png
---

# Videomancer Fault Codes Reference

When Videomancer encounters a fault, the LCD displays a hex code (e.g., `0x2C000008`). Use this table to look up the meaning.

| Hex Code | Subsystem | Description |
|----------|-----------|-------------|
| **Core — Messaging Infrastructure** | | |
| `0x00000001` | Core | Null receiver ID passed |
| `0x00000002` | Core | Null ticket ID passed |
| `0x00000003` | Core | Null requester in ticket |
| `0x00000004` | Core | Duplicate receiver registry entry |
| `0x00000005` | Core | Receiver not found in registry |
| `0x00000006` | Core | Message receiver registry full |
| `0x00000007` | Core | Message queue empty |
| `0x00000008` | Core | Message queue full |
| `0x00000009` | Core | Invalid message packet |
| `0x0000000A` | Core | Re-entrant state transition |
| `0x0000000B` | Core | State transition guard failed |
| `0x0000000C` | Core | State machine rate-limited |
| `0x0000000D` | Core | Machine already suspended |
| `0x0000000E` | Core | Machine not started |
| `0x0000000F` | Core | Machine already started |
| `0x00000010` | Core | Sequence already completed |
| `0x00000011` | Core | Stack machine at max depth |
| `0x00000012` | Core | Stack machine has no frames |
| `0x00000013` | Core | Retry machine retries exhausted |
| `0x00000014` | Core | Queue machine full |
| `0x00000015` | Core | Queue machine empty on advance |
| `0x00000016` | Core | Machine already registered |
| `0x00000017` | Core | Machine not found in registry |
| `0x00000018` | Core | Machine registry full |
| `0x00000019` | Core | Machine not suspended |
| `0x0000001A` | Core | Pipeline has no data |
| `0x0000001B` | Core | Pipeline stage stalled |
| `0x0000001C` | Core | Request already pending |
| `0x0000001D` | Core | No request pending |
| `0x0000001E` | Core | Request timed out |
| `0x0000001F` | Core | Watchdog deadline expired |
| **Silicon — System Clock** | | |
| `0x04000001` | System Clock | Self-test failed |
| **Silicon — Critical Section** | | |
| `0x04100001` | Critical Section | Self-test failed |
| **Silicon — Watchdog** | | |
| `0x04200001` | Watchdog | Timeout exceeds hardware maximum |
| `0x04200002` | Watchdog | Self-test failed |
| **Silicon — GPIO** | | |
| `0x04300001` | GPIO | Invalid pin number |
| `0x04300002` | GPIO | Self-test failed |
| `0x04300003` | GPIO | Operation not applicable |
| `0x04300004` | GPIO | Bus communication error |
| **Silicon — SPI** | | |
| `0x04400001` | SPI | Invalid SPI mode |
| `0x04400002` | SPI | Null buffer pointer |
| `0x04400003` | SPI | Self-test failed |
| **Silicon — I2C** | | |
| `0x04500001` | I2C | Device NACK (no acknowledge) |
| `0x04500002` | I2C | Bus error |
| `0x04500003` | I2C | Null data pointer |
| `0x04500004` | I2C | Self-test failed |
| **Silicon — Flash** | | |
| `0x04600001` | Flash | Address alignment error |
| `0x04600002` | Flash | Address range error |
| `0x04600003` | Flash | Null data pointer |
| `0x04600004` | Flash | Erase failed |
| `0x04600005` | Flash | Program (write) failed |
| `0x04600006` | Flash | Self-test failed |
| **Silicon — Resets** | | |
| `0x04700001` | Resets | Self-test failed |
| **Silicon — Multicore** | | |
| `0x04800001` | Multicore | Null entry function pointer |
| `0x04800002` | Multicore | Inter-core FIFO timeout |
| `0x04800003` | Multicore | Self-test failed |
| **Silicon — UART** | | |
| `0x04900001` | UART | Null buffer pointer |
| `0x04900002` | UART | Self-test failed |
| **Silicon — Unique ID** | | |
| `0x04A00001` | Unique ID | Self-test failed |
| **Silicon — USB CDC** | | |
| `0x04C00001` | USB CDC | Self-test failed |
| `0x04C00002` | USB CDC | Device not initialized |
| **Silicon — PWM** | | |
| `0x04D00001` | PWM | Invalid slice number |
| `0x04D00002` | PWM | Invalid channel (must be A or B) |
| `0x04D00003` | PWM | Self-test failed |
| **Silicon — ADC** | | |
| `0x04E00001` | ADC | Invalid input channel |
| `0x04E00002` | ADC | Not initialized |
| `0x04E00003` | ADC | Invalid round-robin channel mask |
| `0x04E00004` | ADC | FIFO not enabled |
| `0x04E00005` | ADC | Self-test failed |
| `0x04E00006` | ADC | Operation not applicable |
| **Silicon — IRQ** | | |
| `0x04F00001` | IRQ | Invalid IRQ number |
| `0x04F00002` | IRQ | Handler conflict (already set) |
| `0x04F00003` | IRQ | No user IRQ slots free |
| `0x04F00004` | IRQ | IRQ already claimed |
| `0x04F00005` | IRQ | Self-test failed |
| **Silicon — DMA** | | |
| `0x05000001` | DMA | No DMA channel free |
| `0x05000002` | DMA | Invalid channel number |
| `0x05000003` | DMA | Channel busy |
| `0x05000004` | DMA | No DMA pacing timer free |
| `0x05000005` | DMA | Invalid timer number |
| `0x05000006` | DMA | Self-test failed |
| **Silicon — Random** | | |
| `0x05200001` | Random | Entropy source exhausted |
| `0x05200002` | Random | Not initialized |
| `0x05200003` | Random | Self-test failed |
| **Silicon — RTC** | | |
| `0x05300001` | RTC | Not running |
| `0x05300002` | RTC | Invalid date/time value |
| **Silicon — PLL** | | |
| `0x05400001` | PLL | Invalid VCO frequency |
| `0x05400002` | PLL | Invalid post-divider |
| `0x05400003` | PLL | No valid PLL configuration found |
| **Silicon — Clock Tree** | | |
| `0x05500001` | Clock Tree | Invalid frequency |
| `0x05500002` | Clock Tree | Configuration failed |
| **Silicon — Voltage Regulator** | | |
| `0x05600001` | Voltage Regulator | Invalid voltage level |
| `0x05600002` | Voltage Regulator | Self-test failed |
| **Silicon — Crystal Oscillator** | | |
| `0x05700001` | Crystal Oscillator | Init failed |
| `0x05700002` | Crystal Oscillator | Self-test failed |
| **Silicon — Hardware Timer** | | |
| `0x05800001` | Hardware Timer | Invalid alarm number |
| `0x05800002` | Hardware Timer | No alarms available |
| `0x05800003` | Hardware Timer | Alarm target time missed |
| `0x05800004` | Hardware Timer | Invalid parameter |
| **Silicon — Cache** | | |
| `0x05900001` | Cache | Invalid address range |
| `0x05900002` | Cache | Self-test failed |
| **Board — Video Decoder (ADV7181C)** | | |
| `0x08100004` | Video Decoder | Unsupported video timing |
| `0x08100005` | Video Decoder | Unsupported video connector |
| `0x08100006` | Video Decoder | Invalid chip revision |
| `0x0810000A` | Video Decoder | I2C communication error |
| `0x08100032` | Video Decoder | Self-test failed |
| **Board — Video Encoder (ADV7393)** | | |
| `0x08200001` | Video Encoder | Unsupported video timing |
| `0x08200002` | Video Encoder | Unsupported video connector |
| `0x0820000A` | Video Encoder | I2C communication error |
| `0x08200033` | Video Encoder | Self-test failed |
| **Board — HDMI Receiver (ADV7611)** | | |
| `0x08300007` | HDMI Receiver | Unsupported video timing |
| `0x0830000A` | HDMI Receiver | I2C communication error |
| `0x08300034` | HDMI Receiver | Self-test failed |
| **Board — HDMI Transmitter (ADV7513)** | | |
| `0x08400008` | HDMI Transmitter | Unsupported video timing |
| `0x0840000A` | HDMI Transmitter | I2C communication error |
| `0x08400035` | HDMI Transmitter | Self-test failed |
| **Board — LCD (ST7032)** | | |
| `0x08700036` | LCD | Self-test failed |
| **Board — ADC Capture** | | |
| `0x08A00001` | ADC Capture | Not initialized |
| `0x08A00002` | ADC Capture | DMA channel claim failed |
| `0x08A00003` | ADC Capture | Already initialized |
| **Kernel — Lifecycle** | | |
| `0x0C300001` | Kernel Lifecycle | Invalid phase transition |
| `0x0C300002` | Kernel Lifecycle | Supervisor not registered |
| `0x0C300003` | Kernel Lifecycle | Message queue above capacity |
| **Kernel — Capability Registry** | | |
| `0x0C400001` | Capability Registry | Null capability pointer |
| `0x0C400002` | Capability Registry | Registry full |
| `0x0C400003` | Capability Registry | Duplicate capability |
| **Timing Service** | | |
| `0x10000001` | Timing | Timer not found |
| `0x10000002` | Timing | Timer already registered |
| `0x10000003` | Timing | Timer schedule full |
| `0x10000004` | Timing | Invalid duration |
| `0x10000005` | Timing | Invalid timer mode |
| `0x10000006` | Timing | Timer not paused (on resume) |
| `0x10000007` | Timing | Timer already paused |
| `0x10000008` | Timing | Message post failed |
| **Logging Service** | | |
| `0x14000001` | Logging | Sink array full |
| `0x14000002` | Logging | Invalid log level |
| `0x14000003` | Logging | Sink not found |
| **Filesystem** | | |
| `0x1C000001` | Filesystem | Generic error |
| `0x1C000002` | Filesystem | Drive not mounted |
| `0x1C000003` | Filesystem | File or folder not found |
| `0x1C000004` | Filesystem | No space left on drive |
| `0x1C000005` | Filesystem | File or folder already exists |
| `0x1C000006` | Filesystem | Invalid argument |
| `0x1C000007` | Filesystem | I/O error |
| `0x1C000008` | Filesystem | Too many open files |
| `0x1C000009` | Filesystem | Resource busy |
| `0x1C00000A` | Filesystem | Write-protected media |
| `0x1C00000B` | Filesystem | Invalid internal object |
| `0x1C00000C` | Filesystem | Invalid drive ID |
| `0x1C00000D` | Filesystem | No valid filesystem on media |
| `0x1C00000E` | Filesystem | I/O timeout |
| `0x1C00000F` | Filesystem | Invalid path or filename |
| `0x1C000010` | Filesystem | Path is a file, not a folder |
| `0x1C000011` | Filesystem | Path is a folder, not a file |
| `0x1C000012` | Filesystem | Folder not empty |
| `0x1C000013` | Filesystem | Bad file structure |
| `0x1C000014` | Filesystem | File too large |
| `0x1C000015` | Filesystem | Name too long |
| `0x1C000016` | Filesystem | Filesystem metadata corrupt |
| `0x1C000017` | Filesystem | SD card not detected |
| `0x1C000018` | Filesystem | Mount failed |
| `0x1C000019` | Filesystem | Unmount failed |
| `0x1C00001A` | Filesystem | Invalid file ID |
| `0x1C00001B` | Filesystem | File not open |
| `0x1C00001C` | Filesystem | Invalid folder ID |
| `0x1C00001D` | Filesystem | Driver registration table full |
| `0x1C00001E` | Filesystem | Invalid driver |
| `0x1C00001F` | Filesystem | Invalid mount prefix |
| `0x1C000020` | Filesystem | Media removed during operation |
| **Settings** | | |
| `0x20000001` | Settings | Preset not found |
| `0x20000002` | Settings | Storage full |
| `0x20000003` | Settings | Corrupt data |
| `0x20000004` | Settings | Setting not found |
| `0x20000005` | Settings | Settings working set full |
| `0x20000006` | Settings | I/O error during save/load |
| `0x20000007` | Settings | Setting already exists |
| `0x20000008` | Settings | Invalid preset name |
| `0x20000009` | Settings | Filesystem unavailable |
| `0x2000000A` | Settings | Serialization buffer overflow |
| `0x2000000B` | Settings | Value out of range |
| `0x2000000C` | Settings | Schema already exists |
| `0x2000000D` | Settings | Schema registry full |
| **FPGA** | | |
| `0x2C000001` | FPGA | Program not found |
| `0x2C000002` | FPGA | Program registry full |
| `0x2C000003` | FPGA | Invalid .vmprog package |
| `0x2C000004` | FPGA | Package hash mismatch |
| `0x2C000005` | FPGA | Package signature invalid |
| `0x2C000006` | FPGA | No matching bitstream variant |
| `0x2C000007` | FPGA | SPI transfer to FPGA failed |
| `0x2C000008` | FPGA | FPGA configuration timeout |
| `0x2C000009` | FPGA | Bitstream read failed |
| `0x2C00000A` | FPGA | Unknown parameter ID |
| `0x2C00000B` | FPGA | Parameter bridge write failed |
| `0x2C00000C` | FPGA | Parameter bridge full |
| `0x2C00000D` | FPGA | Invalid FPGA state for operation |
| `0x2C00000E` | FPGA | Service not initialized |
| `0x2C00000F` | FPGA | Filesystem error during program load |
| `0x2C000010` | FPGA | Configuration already in progress |
| `0x2C000011` | FPGA | Configuration not started |
| `0x2C000012` | FPGA | No DMA channel available |
| `0x2C000013` | FPGA | DMA transfer busy |
| `0x2C000014` | FPGA | DMA bridge init failed |
| `0x2C000015` | FPGA | Bitstream decompression failed |
| `0x2C000016` | FPGA | Video timing not supported by program |
| `0x2C000017` | FPGA | Crypto verification failed |
| `0x2C000018` | FPGA | Passthru program not found |
| **UI** | | |
| `0x30000001` | UI | Invalid button index |
| `0x30000002` | UI | Invalid LED index |
| `0x30000003` | UI | Invalid toggle index |
| `0x30000004` | UI | Scan loop not running |
| `0x30000005` | UI | Service already running |
| `0x30000006` | UI | Pin not configured |
| `0x30000014` | UI | Potentiometer ADC read error |
| `0x30000015` | UI | Potentiometer value out of range |
| `0x30000016` | UI | Potentiometer signal too noisy |
| `0x30000017` | UI | Invalid potentiometer channel |
| **Video** | | |
| `0x34000001` | Video | Sync service not initialized |
| `0x34000002` | Video | Sync service already initialized |
| `0x34000003` | Video | GPIO IRQ registration failed |
| `0x34000004` | Video | Invalid sync pin config |
| `0x34000009` | Video | Analog decoder not configured |
| `0x3400000A` | Video | Analog encoder not configured |
| `0x3400000B` | Video | HDMI receiver not configured |
| `0x3400000C` | Video | HDMI transmitter not configured |
| `0x3400000D` | Video | Unsupported video connector |
| `0x3400000E` | Video | Unsupported video timing |
| **Localization** | | |
| `0x38000001` | Localization | Language not supported |
| `0x38000002` | Localization | String not found |
| **Pseudorandom** | | |
| `0x3C000001` | Pseudorandom | Stream pool exhausted |
| `0x3C000002` | Pseudorandom | Invalid stream ID |
| `0x3C000003` | Pseudorandom | Stream not allocated |
| **Screen** | | |
| `0x40000001` | Screen | Invalid screen index |
| `0x40000002` | Screen | LCD self-test failed |
| `0x40000003` | Screen | Service already running |
| **MIDI** | | |
| `0x44000001` | MIDI | Unknown fault |
| `0x44000002` | MIDI | Receive buffer overflow |
| `0x44000003` | MIDI | Protocol parse error |
| `0x44000004` | MIDI | Invalid MIDI message |
| `0x44000005` | MIDI | UART port not ready |
| `0x44000006` | MIDI | UART hardware error |
| `0x44000007` | MIDI | MIDI-CI message malformed |
| `0x44000008` | MIDI | MIDI-CI MUID conflict |
| `0x44000009` | MIDI | MIDI-CI profile list full |
| `0x4400000A` | MIDI | MIDI-CI profile not found |
| `0x4400000B` | MIDI | MIDI-CI unsupported message type |
| **Motion** | | |
| `0x4C000001` | Motion | Invalid BPM value |
| **Modulation** | | |
| `0x50000001` | Modulation | Invalid modulator |
| `0x50000002` | Modulation | Invalid source |
| **Shell** | | |
| `0x58000001` | Shell | Unknown command |
| `0x58000002` | Shell | Command parse error |
| `0x58000003` | Shell | Required service unavailable |
| `0x58000004` | Shell | Input buffer overflow |
| `0x58000005` | Shell | USB CDC not connected |
| `0x58000006` | Shell | File not found |
| `0x58000007` | Shell | I/O error |
| `0x58000008` | Shell | SD card not mounted |
| `0x58000009` | Shell | Path too long |
| `0x5800000A` | Shell | Invalid path |
| **Preset** | | |
| `0x5C000001` | Preset | No FPGA program loaded |
| `0x5C000002` | Preset | Invalid preset index |
| `0x5C000003` | Preset | Preset slot empty |
| `0x5C000004` | Preset | Invalid preset name |
| `0x5C000005` | Preset | Save to flash failed |
| `0x5C000006` | Preset | All user preset slots full |
| `0x5C000007` | Preset | Save data malformed |
| **USB** | | |
| `0x60000001` | USB | Device not mounted |
| `0x60000002` | USB | Device buffer full |
| `0x60000003` | USB | Report generation error |
