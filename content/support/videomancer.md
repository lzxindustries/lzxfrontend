---
slug: videomancer
setupPrerequisites:
  - 'HDMI source device (camera, media player, computer, console, or other HDMI output)'
  - 'Display, monitor, or capture device with HDMI input'
  - 'Two standard full-size HDMI cables'
  - 'Included 12V DC power supply'
  - 'USB-C data cable (for firmware updates and LZX Connect — charge-only cables will not work)'
faqItems:
  - question: 'How do I update Videomancer firmware?'
    answer: |
      The answer depends on which firmware version is currently installed.

      **If Videomancer is running firmware 0.1.8:** Use the manual BOOT button
      method for the initial upgrade to 1.x.x. LZX Connect cannot perform this
      upgrade. Close LZX Connect before starting. See
      [Firmware Update](/instruments/videomancer/manual/user-manual#firmware-update)
      in the User Manual for step-by-step instructions.

      **If Videomancer is already running firmware 1.x.x:** Open
      [LZX Connect](/connect), connect Videomancer via USB-C, and click
      Check for Updates. Firmware 1.x.x is currently pre-release — enable
      **Show pre-releases** in LZX Connect settings to see available
      pre-release updates.
  - question: 'How do I add new programs to Videomancer?'
    answer: |
      Programs are `.vmprog` files loaded from Videomancer's microSD card at
      boot. Two libraries are available:

      - **Official LZX Program Library** — bundled with firmware or available
        from the [Downloads](/instruments/videomancer/downloads) page.
      - **Community Programs Library** — third-party programs signed for
        firmware 1.x.x, available from the
        [community programs releases](https://github.com/lzxindustries/videomancer-community-programs/releases).

      To install: copy `.vmprog` files to the `programs/` folder on the SD
      card, or use [LZX Connect](/connect) → Install Program Library to
      transfer directly over USB. Videomancer rescans on the next boot.
  - question: 'Do community programs require Developer Mode?'
    answer: |
      No. Signed community `.vmprog` releases from the official community
      programs repository load without Developer Mode on firmware 1.x.x.
      Developer Mode is only needed for unsigned programs with version numbers
      below 1.0.0, typically during active development.
  - question: 'What video formats does Videomancer support?'
    answer: |
      Videomancer supports HDMI, Composite (CVBS), S-Video, Component (YPbPr & RGB SOG)
      and 1V RGB video input and output in NTSC and PAL formats.
  - question: 'Can I use Videomancer with analog sources (composite, component, S-Video, RGB)?'
    answer: |
      Yes. The Quick Start covers the HDMI path; analog setup is documented in the
      [Signal Paths](/instruments/videomancer/manual/user-manual#signal-paths) section
      of the User Manual. Videomancer accepts composite (CVBS), S-Video, component
      YPbPr, RGB with sync on green, and the LZX 1V modular standard, in NTSC and PAL.
  - question: 'Can I use Videomancer with eurorack modules?'
    answer: |
      Yes. Videomancer works standalone or alongside LZX eurorack modules via its
      1V RGB video I/O and Audio/CV modulation inputs.
  - question: 'Is there perceptible delay between a knob turn and the output?'
    answer: |
      Internal processing is FPGA-based with latency on the order of
      **microseconds** in typical paths, not “whole frames” like many GPU
      plugins. The exact number depends on program and I/O; treat the
      [Quick Start](/instruments/videomancer/manual/quick-start) and
      [User Manual](/instruments/videomancer/manual) as authoritative when you
      are wiring time-critical show cues.
---

# Videomancer Support

Per-product support content for the Videomancer instrument. The frontmatter
above is the source of truth for FAQ entries and setup prerequisites surfaced
on the Videomancer support and setup pages.
