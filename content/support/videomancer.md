---
slug: videomancer
setupPrerequisites:
  - 'HDMI source device (camera, media player, computer, console, or other HDMI output)'
  - 'Display, monitor, or capture device with HDMI input'
  - 'Two standard full-size HDMI cables'
  - 'Included 12V DC power supply'
  - 'USB-C data cable (for firmware updates and LZX Connect - charge-only cables will not work)'
faqItems:
  - id: faq-firmware-update
    question: 'How do I update Videomancer firmware?'
    answer: |
      Two tracks are available.

      **Stable 0.1.8** - maximum stability, ~8 programs built-in. There is no 1.0.0 stable release yet.

      **Pre-release 1.0.0-rc.x** - full program library (~24+ programs) and LZX Connect support.

      Download from [Videomancer Downloads](/instruments/videomancer/downloads). GitHub has the same `.uf2` files.

      **0.1.8 to 1.x upgrade:** Manual BOOT method only - LZX Connect cannot perform this jump. Close LZX Connect before starting.

      **1.x to newer 1.x:** Use LZX Connect with **Show pre-release firmware** enabled, or the manual BOOT method.

      **Mac / Linux note:** The copy may show 0 bytes progress for 5-10 minutes - wait for the device to reboot.

      For step-by-step instructions, use the [Firmware Update flow](/instruments/videomancer/support#flow-firmware) on this page.

  - id: faq-add-programs
    question: 'How do I add new programs to Videomancer?'
    answer: |
      Programs are embedded inside firmware, not installed separately.

      **~8 programs on 0.1.8** - Passthru, Colorbars, Prism, and others. Upgrade to 1.x for the full library.

      **~24+ programs on 1.x** - full library built into the firmware image. No separate download needed after flashing.

      Do not copy `.vmprog` files onto the BOOT drive during a firmware update.

      **microSD (extra programs):** Format FAT32. Create `programs/<folder-name>/`. Copy `.vmprog` files inside. Power cycle to rescan.

      **LZX Connect - Install Program Library:** Available on 1.x firmware only.

      For step-by-step: use the [Program Library flow](/instruments/videomancer/support#flow-programs) on this page.
      Downloads: [Videomancer Downloads](/instruments/videomancer/downloads).

  - id: faq-developer-mode
    question: 'Do community programs require Developer Mode?'
    answer: |
      No. Signed community `.vmprog` releases from the official community programs repository load without Developer Mode on firmware 1.x.

      Developer Mode (SYSTEM menu - Developer Mode - restart) is required only for unsigned programs or programs with a version number below 1.0.0, typically during active development.

  - id: faq-formats
    question: 'What video formats does Videomancer support?'
    answer: |
      Full table on the [Specs page](/instruments/videomancer/specs).

      **Supported:** 720p50/59/60; 1080i50/59/60; 1080p23/24/25/29/30; NTSC 486i59; PAL 576i50; 480p29; 576p25.

      **Not supported:** 1080p50, 1080p60; resolution or frame-rate conversion; upscaling or downscaling.

      Videomancer genlocks to the incoming signal timing - it does not convert formats.

      If your source outputs 1080p60, switch it to 1080p30 or 720p60. See the [No Signal flow](/instruments/videomancer/support#flow-no-signal) for lock troubleshooting.

  - id: faq-analog
    question: 'Can I use Videomancer with analog sources (composite, component, S-Video, RGB)?'
    answer: |
      Yes. Set **Analog In Mode** and **Vid Route Mode** in the SYSTEM menu to match your cable type. See [Signal Paths](/instruments/videomancer/manual/user-manual) in the User Manual.

      **HDMI to CVBS (composite out):** Source must output 480i NTSC or 576i PAL. A PC HDMI source sending RGB may look washed out - switch the source to YCbCr/YUV if available.

      **CVBS to HDMI (composite in to HDMI out):** Many HDMI displays and capture cards cannot display SD over HDMI. Use a capture card that accepts SD, or a composite-input monitor.

      **CVBS lost after reboot (0.1.x firmware):** Toggle Vid Route Mode - Analog then HDMI then back to Analog in SYSTEM menu.

  - id: faq-eurorack
    question: 'Can I use Videomancer with eurorack modules?'
    answer: |
      Yes. **1V RGB** inputs and outputs on the front panel are compatible with LZX eurorack modules.

      1V signals do not carry sync. Patch **Sync out** (rear RCA) to your modular sync input for frame-synchronized operation.

      For frame-sync and TBC workflows, see the User Manual and [TBC2](/instruments/tbc2) documentation.

  - id: faq-latency
    question: 'Is there perceptible delay between a knob turn and the output?'
    answer: |
      No. FPGA processing latency is sub-millisecond - effectively immediate for live performance.

  - id: faq-stable-vs-rc
    question: 'Which firmware should I use - stable or pre-release?'
    answer: |
      **Stable 0.1.8:** Ships on new units. ~8 programs. Maximum stability. No LZX Connect support. Choose this if your current setup is working and you do not need additional programs.

      **Pre-release 1.0.0-rc.x:** Full program library (~24+ programs). LZX Connect support. Experimental - some units may experience issues with rc.14 and newer (see the [Controls not responding flow](/instruments/videomancer/support#flow-controls)). Choose this if you need the full program library or LZX Connect integration.

      There is no 1.0.0 stable release yet. Stable release announcements will appear on the [LZX blog](https://docs.lzxindustries.net/blog).

      For the upgrade path from 0.1.8, use the [Firmware Update flow](/instruments/videomancer/support#flow-firmware).

  - id: faq-connect-stuck
    question: 'LZX Connect says the update succeeded, but I am still on 0.1.8. Why?'
    answer: |
      LZX Connect cannot flash the **0.1.8 to 1.x** upgrade path. This is a known limitation. Even if Connect reports success, it has not changed the firmware when starting from 0.1.8.

      **Fix:** Use the manual BOOT method. Close LZX Connect, download the `.uf2` from [Downloads](/instruments/videomancer/downloads), hold BOOT while powering on, drag the file to the RPI-RP2 drive, wait for reboot.

      See the [Firmware Update flow](/instruments/videomancer/support#flow-firmware) for the full step-by-step.

  - id: faq-downloads-empty
    question: 'The downloads page looks empty - where are the firmware files?'
    answer: |
      If you see "No downloads available":

      1. **Hard refresh:** Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac).
      2. Wait up to ~1 hour for CDN cache to propagate.
      3. **Fallback:** [GitHub releases](https://github.com/lzxindustries/videomancer-firmware/releases) - the same `.uf2` files are published there.

  - id: faq-connect-file-picker
    question: 'LZX Connect asks me to select a firmware file - where do I get it?'
    answer: |
      Download the `.uf2` file from the [Videomancer Downloads page](/instruments/videomancer/downloads). For pre-release builds, enable **Show pre-release firmware** in LZX Connect settings first - if it still asks for a file, download from the Pre-release row in the downloads table and select it in the file picker.

      The same files are on [GitHub releases](https://github.com/lzxindustries/videomancer-firmware/releases) if the downloads page is unavailable.

  - id: faq-no-lock
    question: 'My LCD shows NO LOCK HDMI but the rear HDMI LED is on. What does that mean?'
    answer: |
      The rear HDMI LED indicates a cable is electrically connected. `NO LOCK HDMI` on the LCD means Videomancer can see the cable but cannot lock to the video signal format.

      **Common causes:**

      - Source is outputting **1080p60 or 1080p50**, which Videomancer does not support. Switch to **1080p30, 720p60, or 1080i60**.
      - Source is not actively sending video (display off, screen saver active, laptop lid closed).
      - USB-C or HDMI adapter outputting an unstable or non-standard format. Try a direct HDMI cable.

      Full supported format list: [Specs](/instruments/videomancer/specs).

      Troubleshooting steps: [No Signal flow](/instruments/videomancer/support#flow-no-signal).

  - id: faq-black-screen
    question: 'Black screen after loading a program - is something wrong?'
    answer: |
      Not necessarily. Two common explanations:

      1. **Brief black flash on load:** All outputs disable for 3-5 seconds after loading any program. This is normal - wait before diagnosing further.

      2. **Parameter 12 (star slider) is at minimum:** Many programs use the star slider as a luminance key or master fade. Press the star button and move the slider through its full range. If a picture appears, the program was faded - not a fault.

      If neither explains your black screen, see the [No video output flow](/instruments/videomancer/support#flow-black-screen) for a full diagnosis.

  - id: faq-mac-hdmi
    question: 'My Mac or laptop will not lock over HDMI. Any tips?'
    answer: |
      Mac and laptop HDMI outputs are unreliable with Videomancer for several reasons:

      - Many GPU drivers default to 1080p60, which Videomancer does not support. Force **1080p30** or **720p60** in Display Settings.
      - USB-C to HDMI adapters often have unstable timing. Use a **dedicated HDMI converter box** rather than a direct dongle.
      - Interlaced output (1080i) is disabled on some Mac models. Stick to progressive formats.
      - Screen mirroring sometimes applies different timing than an extended display. Use **extended display mode**.

      If your laptop cannot output a supported format at all, consider a dedicated HDMI signal source (media player, capture card with loop-out, or a small format converter).

  - id: faq-factory-reset
    question: 'Is there a factory reset?'
    answer: |
      There is no software factory reset. The closest equivalent is a firmware reflash:

      1. Download **0.1.8** from [Downloads](/instruments/videomancer/downloads) - this is the known-good baseline.
      2. Use the manual BOOT method (hold BOOT while powering on, drag `.uf2` to drive).
      3. After reboot, Videomancer is in the same state as from factory.

      If a freeze persists after reflashing 0.1.8, contact support. See the [Firmware Update flow](/instruments/videomancer/support#flow-firmware).

  - id: faq-github-sync
    question: 'Are the website downloads and GitHub releases the same files?'
    answer: |
      Yes. The `.uf2` firmware files on the [Videomancer Downloads page](/instruments/videomancer/downloads) and the [GitHub releases page](https://github.com/lzxindustries/videomancer-firmware/releases) are identical. Use either source - GitHub is the fallback if the website CDN is slow to update.
---

# Videomancer Support

Per-product support content for the Videomancer instrument. The frontmatter
above is the source of truth for FAQ entries and setup prerequisites surfaced
on the Videomancer support and setup pages.
