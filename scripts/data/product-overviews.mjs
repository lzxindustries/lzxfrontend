/**
 * Short Overview copy for Shopify mirror (body contract: positioning + use case,
 * not full reference — detail belongs in Manual / Specs / metafields).
 * Used by scripts/apply-product-overviews.mjs
 */

/**
 * @typedef {{ html: string, plain: string, seoDescription?: string }} ProductOverview
 * @type {Record<string, ProductOverview>}
 */
export const PRODUCT_OVERVIEWS = {
  videomancer: {
    html: `<p>Videomancer is a standalone real-time video effects console: programmable FPGA video processing, hard-mapped front-panel controls, and a large library of programs for color, glitch, keying, patterns, and feedback. HDMI and analog I/O work in both directions with effectively no perceptible latency—what you change with a knob is what you see on the display.</p>
<p>Line-level and modular signals, MIDI, and USB (firmware, expansion) are covered end-to-end in the in-site documentation. Unboxing, menus, every program, modulation, and I/O: use the <a href="/instruments/videomancer/manual">Manual</a> tab. For ports and block diagrams, use <a href="/instruments/videomancer/specs">Specs</a>.</p>`,
    plain: `Videomancer is a standalone real-time video effects console: programmable FPGA video processing, hard-mapped front-panel controls, and a large library of programs. HDMI and analog I/O, modulation, and MIDI. Full reference in the Manual tab on this site; ports and block diagrams in Specs.`,
    seoDescription: `Videomancer: standalone FPGA video effects, analog + HDMI, hands-on control. Manual and Specs on lzxindustries.com for programs, I/O, and firmware.`,
  },
  tbc2: {
    html: `<p>TBC2 is the Gen3 dual video input and time-base correct module: two independent decode paths, a full system sync engine, 1V patchable encoders, and still/sequence playback from the front-panel microSD slot—decoding and reference glue for a modular LZX system in 16 HP.</p>
<p>Menu structure, submodules, MicroSD use, and firmware are documented in the <a href="/modules/tbc2/manual">Manual</a>. The <a href="/modules/tbc2/specs">Specs</a> tab lists connectors and data from the LZX module knowledge base.</p>`,
    plain: `TBC2: dual video input, time base correction, sync, encoders, and media playback for Gen3 LZX systems. Full reference in the Manual; connectors in Specs.`,
    seoDescription: `TBC2: Gen3 dual video input, time-base correction, sync, and 1V encoders. Full Manual and Specs on lzxindustries.com.`,
  },
  'memory-palace': {
    html: `<p>Memory Palace (Orion series) is a full-color digital video memory and color-space instrument for the Eurorack: capture, rescan, and transform video through frame memory with extensive CV control—built for resynthesis, time smear, and architected feedback paths rather than a “simple buffer.”</p>
<p>When this product ships, the in-site <a href="/modules/memory-palace/manual">Manual</a> is the full reference. Until then, the <a href="/modules/memory-palace/specs">Specs</a> tab surfaces connector and feature data as we publish it.</p>`,
    plain: `Memory Palace: Orion-series digital video memory and color-space module for LZX. Manual and Specs on this site for full reference when published.`,
    seoDescription: `Memory Palace: digital video memory and color-space for LZX modular. Specs and docs on lzxindustries.com (Manual when product ships).`,
  },
  'andor-1-media-player': {
    html: `<p>Andor 1 is a front-panel video media player for the Eurorack: load and trigger clips, route video through your patch, and keep playback under voltage and front-panel control alongside the rest of the LZX system.</p>
<p>Codec support, I/O, and UI behavior are documented in the <a href="/instruments/andor-1-media-player/manual">Manual</a>; physical connectors and product metadata are on <a href="/instruments/andor-1-media-player/specs">Specs</a>.</p>`,
    plain: `Andor 1: Eurorack video media player for LZX. See Manual for operation and Specs for I/O and metadata.`,
    seoDescription: `Andor 1: Eurorack video media player for LZX systems. Operation in Manual, I/O on Specs at lzxindustries.com.`,
  },
  'triple-video-fader-key-generator': {
    html: `<p>Triple Video Fader &amp; Key Generator (TVFKG) packs three wideband voltage-controlled crossfaders and three high-speed key generators into one Visionary-series panel: you get linked crossfade, luma and chroma keying, and logical combinations of keys without stacking separate utility modules end to end.</p>
<p>Front-panel modes select whether CV, key outputs, or a shared master bus drives each fader. The <a href="/modules/triple-video-fader-key-generator/manual">Manual</a> tab carries the long-form block discussion; the <a href="/modules/triple-video-fader-key-generator/specs">Specs</a> tab matches the LZX module database for jacks and current.</p>`,
    plain: `TVFKG: three VC crossfaders and three key generators for Visionary/legacy LZX systems. See Manual and Specs on this product hub.`,
    seoDescription: `TVFKG: 3 crossfaders + 3 key generators for LZX Visionary. Manual and Specs on lzxindustries.com.`,
  },
  chromagnon: {
    html: `<p>Chromagnon is a signal-frontier matrix video instrument: a patchable 14×5 analog matrix, dedicated shape and colorization paths, and deep CV—built for generative and performance video without parking a DAW in the signal chain.</p>
<p>Matrix patching, calibrations, and creative workflows live in the <a href="/instruments/chromagnon/manual">Manual</a>. Commerce-facing highlights and the <a href="/instruments/chromagnon/specs">Specs</a> tab keep long tables out of this Overview copy.</p>`,
    plain: `Chromagnon: matrix video instrument for LZX. Full patching and operations in the Manual; feature lists in Specs.`,
    seoDescription: `Chromagnon: patchable matrix video instrument. Manual, Specs, and hub on lzxindustries.com.`,
  },
  'video-blending-matrix': {
    html: `<p>Video Blending Matrix is a triple-bus analog crosspoint: six inputs and six outputs, normalled for both parallel broadcast mixing and reconfigurable feedback—built for bussed color mixing, distribution, and self-patched feedback topology without a tangle of individual mults and switches.</p>
<p>Patch recipes and use cases: <a href="/modules/video-blending-matrix/manual">Manual</a>. Jack map and data: <a href="/modules/video-blending-matrix/specs">Specs</a>.</p>`,
    plain: `Video Blending Matrix: 6×6 analog crosspoint for LZX Visionary. Manual and Specs on this site.`,
    seoDescription: `Video Blending Matrix: 6×6 analog video crosspoint (LZX). Manual and Specs on lzxindustries.com.`,
  },
  'video-logic': {
    html: `<p>Video Logic is a multi-function Boolean and comparison stage for 1V video-rate signals: you get NAND, OR, and window-style logic, plus a dedicated voltage comparator in one Orion-series module—handy for key shaping, gating, and non-linear control before colorization or mixing.</p>
<p>Truth tables, normals, and patch ideas: <a href="/modules/video-logic/manual">Manual</a>. Physical layout: <a href="/modules/video-logic/specs">Specs</a>.</p>`,
    plain: `Video Logic: Boolean and comparator video modules for LZX. See Manual and Specs.`,
    seoDescription: `Video Logic: Boolean + comparator for 1V video (LZX Orion). See Manual and Specs.`,
  },
  'video-waveform-generator': {
    html: `<p>Video Waveform Generator (Cadet / Visionary) is a two-channel, temperature-compensated analog function generator: triangle and square outputs, syncable to a global video timing ramp—your reference for adjustable oscillators, envelopes, and timing experiments that stay locked to line and field.</p>
<p>Calibration and patching: <a href="/modules/video-waveform-generator/manual">Manual</a>. Panel I/O: <a href="/modules/video-waveform-generator/specs">Specs</a>.</p>`,
    plain: `Video Waveform Generator: dual analog function generator, sync to video. Manual and Specs on this site.`,
    seoDescription: `Video Waveform Generator: dual analog LFO, sync to video. Manual and Specs on lzxindustries.com.`,
  },
  vidiot: {
    html: `<p>Vidiot is a self-contained 3U instrument: a shape generator, 2D keyer, and two-channel open-architecture modulator/oscillator, designed as an entry point to analog video before you commit to a full 84 HP row.</p>
<p>Controls, I/O, and sound-to-video ideas are in the <a href="/instruments/vidiot/manual">Manual</a>. Panel data: <a href="/instruments/vidiot/specs">Specs</a>.</p>`,
    plain: `Vidiot: 3U analog video instrument—shape, keying, and modulation. See Manual and Specs on this product hub.`,
    seoDescription: `Vidiot: 3U analog video instrument. Manual, Specs, and hub on lzxindustries.com.`,
  },
  esg3: {
    html: `<p>ESG3 is the Gen3 encoder and sync heart of the LZX system: it generates the master sync reference, encodes 1V patchable color and mono outputs for monitoring and downstream gear, and hands off stable timing to the rest of the case.</p>
<p>Encoding modes, rear I/O, and calibration flow are in the <a href="/modules/esg3/manual">Manual</a>. The <a href="/modules/esg3/specs">Specs</a> tab tracks connectors and switch definitions from the module database—avoid duplicating that table in marketing copy here.</p>`,
    plain: `ESG3: Gen3 sync and encoder for LZX. Manual for modes and I/O; Specs for the canonical connector list.`,
    seoDescription: `ESG3: Gen3 sync + encoder for LZX modular video. Full Manual and Specs on lzxindustries.com.`,
  },
  fortress: {
    html: `<p>Fortress is a 5-input sequential video switching engine for analog video rate signals: a performance-oriented, voltage-addressable input router with a dedicated programming interface—use it to build rhythmic cuts, long-form sequences, and CV-driven channel gymnastics.</p>
<p>The community <a href="/modules/fortress/manual">Manual</a> route may surface forum archive content where no single PDF exists; the <a href="/modules/fortress/specs">Specs</a> tab lists the hardware as catalogued.</p>`,
    plain: `Fortress: five-input sequenced video switch for LZX. Manual may include community archive; Specs for hardware data.`,
    seoDescription: `Fortress: 5-input sequence video switch (LZX). Manual, forum archive, Specs on lzxindustries.com.`,
  },
  topogram: {
    html: `<p>Topogram is a wideband voltage-controlled 2D shape generator with a dedicated voltage-controlled 3D perspective stage: you create geometry in the plane, then foreshorten and skew it in depth using continuous CV—built for 3D-like scenes without a digital framebuffer.</p>
<p>Block diagram and full operator guide: <a href="/modules/topogram/manual">Manual</a>. Jack list: <a href="/modules/topogram/specs">Specs</a>.</p>`,
    plain: `Topogram: 2D shape + perspective for LZX. See Manual and Specs.`,
    seoDescription: `Topogram: 2D shapes + 3D perspective (LZX Orion). See Manual and Specs.`,
  },
  arch: {
    html: `<p>Arch is a 3-input voltage controlled summing and keying hub: a central node for matting, additive combinations, and soft routing between sources—intended to sit at the “center” of a color or compositing patch in Orion-series systems.</p>
<p>Signal flow, normals, and patch patterns: <a href="/modules/arch/manual">Manual</a>. I/O: <a href="/modules/arch/specs">Specs</a>.</p>`,
    plain: `Arch: 3-in VC summing and keying. Manual and Specs on this product hub.`,
    seoDescription: `Arch: 3-input summing and keying (LZX Orion). Manual and Specs on lzxindustries.com.`,
  },
  'sensory-translator': {
    html: `<p>Sensory Translator is a 5-channel CV and video-rate signal acquisition stage: a bridge between the outside world and your 1V patch, built for control voltages, audio, and light-to-voltage work without treating the module as a generic “interface” box.</p>
<p>Input ranges, scaling, and patch ethics: <a href="/modules/sensory-translator/manual">Manual</a>. <a href="/modules/sensory-translator/specs">Specs</a> for hardware.</p>`,
    plain: `Sensory Translator: 5-channel acquisition for LZX. Manual and Specs on this site.`,
    seoDescription: `Sensory Translator: 5-channel input acquisition for LZX. Manual and Specs on lzxindustries.com.`,
  },
  'liquid-tv': {
    html: `<p>Liquid TV is a multi-channel NTSC / PAL / SECAM video input decoder for 1V systems: a practical front-end for off-the-air and composite sources, with CV over selection and a dedicated subcarrier reference path for downstream color work.</p>
<p>Where the long-form text lives in community threads, the <a href="/modules/liquid-tv/manual">Manual</a> may resolve to archive; <a href="/modules/liquid-tv/specs">Specs</a> for panel data when published.</p>`,
    plain: `Liquid TV: multi-format RF/composite input for LZX. Manual may be forum-sourced; Specs for panel data.`,
    seoDescription: `Liquid TV: multi-standard RF and composite in for LZX. See Manual (archive) and Specs.`,
  },
  'double-vision-complete': {
    html: `<p>Double Vision 168 is a complete 6U video instrument in a self-contained case: a ready-to-perform LZX system with display integration—targeted at gallery, studio, and stage setups where you want a finished instrument rather than a blank rack start.</p>
<p>What ships in the box, hookup, and sub-module roles: <a href="/instruments/double-vision-168/manual">Manual</a>. <a href="/instruments/double-vision-168/specs">Specs</a> for configuration.</p>`,
    plain: `Double Vision 168: 6U complete LZX system. See Manual and Specs for configuration and I/O.`,
    seoDescription: `Double Vision 168: complete 6U LZX system. Manual, Specs, and hub on lzxindustries.com.`,
  },
};
