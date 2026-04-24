---
slug: tbc2
setupPrerequisites:
  - 'MicroSD card formatted FAT32 (for media; see manual for tested brands)'
  - 'Cables for your input sources: composite, component, and/or S-Video as your build requires'
faqItems:
  - question: 'What video sources can TBC2 accept?'
    answer: |
      Each decoder accepts component (YPbPr/RGsB), composite (CVBS), and
      S-Video (YC). With the [VGA + SCART expander](/modules/tbc2-expander)
      you add VGA (RGBHV) and SCART inputs. TBC2 time-base-corrects and decodes
      into the 1V patchable standard—see the [Manual](/modules/tbc2/manual) for format lists and menu paths.
  - question: 'Where does firmware come from, and how do I recover a blank screen?'
    answer: |
      Official releases live on this site and in GitHub. Copy **BOOT.bin** to a
      FAT32 microSD, power off, insert the card, and use the on-screen
      **Update Firmware** path—or the **boot-from-SD** hardware procedure if the
      UI does not start—exactly as described in the [TBC2 manual](/modules/tbc2/manual) troubleshooting section.
---

# TBC2 Support

Per-product support content for the TBC2 Time Base Corrector module.
