---
slug: inside-the-workshop
title: "Inside the Workshop: A Day in the Life at LZX HQ"
authors: [lars]
tags: [behind-the-scenes, manufacturing, team]
draft: true
---

:::danger PLACEHOLDER CONTENT - DO NOT PUBLISH
This is a detailed outline only. Requires:
- Actual photography of workshop, team, equipment, processes
- Team member interviews and quotes
- Real examples of daily work
- Action shots of assembly, testing, shipping
- Complete rewrite with actual content and photos
:::

**[Intro paragraph]**

For two years of blog posts, I've written about PCB revisions, firmware updates, and supply chain challenges. But I've rarely shown you the actual physical space where it all happens, or the people who make it possible. Today, let's take a walk through the LZX workshop in Portland, Oregon - a typical day in the life of keeping analog video synthesis alive.

<!--truncate-->

---

## Morning: 8:00 AM - The Shop Opens

[Photo of the workshop exterior/entrance]

The workshop is a [square footage] space in [neighborhood description]. It's not fancy - exposed beams, concrete floors, the smell of solder flux and electronics. But it's home.

### Mail Call & Order Review

[Photo of shipping station with stacks of packages]

**Morning ritual:** Check email, review overnight orders, print packing slips. Every order gets reviewed personally. This isn't Amazon - we know many customers by name after years of correspondence.

**Today's orders:**
- 3x Vessel 84 cases (to Australia, Germany, Netherlands)
- 2x SMX3 modules
- 1x complete Gen3 starter system (6 modules + case)
- 5x assorted P-Series modules
- Firmware update request for Memory Palace

[Photo of order management screen or packing slips]

---

## Mid-Morning: 9:30 AM - Assembly Station

[Photo of assembly bench with partially assembled module]

**Nick's domain.** This is where completed PCBs become finished modules.

### The Assembly Process

[Series of photos showing assembly steps]

1. **PCB inspection** - Check for solder quality, component placement
2. **Power cable attachment** - Both barrel and EuroRack cables
3. **Panel mounting** - Align front panel, install all knobs/switches/jacks
4. **Sync cable prep** (for modules that need it)
5. **Initial power-on test** - Does it boot? Any smoke? (Important!)

**What's on the bench today:**
- [Photo] Stack of DSG3 PCBs from recent run
- [Photo] Front panels waiting for assembly
- [Photo] The knob inventory (organized by color)
- [Photo] The cable prep station

[Close-up photo of hands installing a front panel]

**Nick:** "The most tedious part is the knobs. Each Gen3 module has 8-12 knobs that need to be pressed on perfectly straight. Get one crooked and you have to pull it off and start over. After a few hundred modules, you develop a feel for it."

---

## Late Morning: 11:00 AM - Hans the SMT Machine

[Photo of the Pick & Place machine]

**Meet Hans.** Our Neoden 4 pick-and-place machine. Without Hans, LZX doesn't exist.

### SMT Assembly in Action

[Photo of Hans placing components on a PCB]

Before tariffs, we sent PCBs to China for assembly. Now, everything happens here. That meant learning to operate professional SMT equipment, which was... a journey.

**The SMT process:**
1. Apply solder paste through stencil
2. Hans places components (0402 resistors, ICs, etc.)
3. Reflow oven melts solder
4. Inspection under microscope
5. Hand-solder any through-hole components
6. Testing and validation

[Photo of solder paste application]
[Photo of reflow oven]
[Photo of microscope inspection]

**Current job:** RevI control board for Videomancer prototypes  
**Components placed today:** ~450 per board, 6 boards in this batch  
**Success rate:** 98% (those 2% need rework under microscope)

[Photo of completed SMT board]

**Andrew:** "Hans has moods. Some days everything goes perfectly. Other days he jams on the third component and you spend two hours recalibrating. We've learned to be patient with Hans."

---

## Lunch Break: 12:30 PM - What We're Listening To

[Photo of workspace with speakers or headphones]

**Lars:** Currently rotating between:
- William Basinski - "The Disintegration Loops"
- Boards of Canada
- Tangerine Dream - "Phaedra"
- Ambient sets from NTS Radio

**Nick:** Mostly doom metal. Don't ask.

**Andrew:** Whatever Spotify recommends. Algorithm knows me too well.

**Jonah:** Podcasts about electronics, obscure synthesizers, and occasionally true crime.

The shop soundtrack matters. Hours of repetitive assembly work demand the right audio environment.

---

## Early Afternoon: 1:30 PM - The Testing Bench

[Photo of testing station with oscilloscope, waveform generator, etc.]

**This is where we prove everything works.**

### Testing Protocol

[Photo of test setup with module connected to instruments]

Every module gets tested before shipping. Not a quick power-on check - actual signal testing.

**Standard test for DSG3:**
1. Power consumption verification
2. Sync input/output check
3. Ramp generator linearity and frequency
4. Shape output waveforms (all 12 outputs)
5. CV input response
6. Switch function validation
7. Fold/curve/invert behavior
8. Crossfade verification

[Photos of oscilloscope screens showing waveforms]

**Time per module:** 10-15 minutes for standard modules, 30-45 minutes for complex ones like TBC2

**Today's testing queue:**
- 8x newly assembled SMX3 modules
- 2x TBC2 firmware update verification
- 1x customer return (noise issue - turned out to be power supply)

[Photo of testing checklist]

---

## Mid-Afternoon: 3:00 PM - Development Zone

[Photo of Lars's development workbench]

**This is where future products live.** Currently:

[Photo of Chromagnon prototype on workbench]
**Chromagnon RevI control board** - Running firmware validation tests

[Photo of Videomancer prototype]
**Videomancer prototype #3** - Testing FPGA configuration over USB

[Photo of breadboard with experimental circuit]
**Mystery project** - New module in early R&D phase (can't say more yet)

### The Dev Tools

[Photo spread of development equipment]
- Oscilloscope (Keysight DSOX1204G)
- Waveform generator
- Logic analyzer
- Microscope for SMT inspection
- Hot air rework station
- Soldering station (Hakko)
- The "junk drawer" (every engineer has one)

[Photo of software development screen showing code]

**Current task:** Debugging USB communication between Chromagnon and the desktop configuration app. Getting the protocol right is finicky work.

---

## Late Afternoon: 4:30 PM - Inventory & Shipping

[Photo of inventory shelves]

**The wall of parts.** Thousands of components organized by part number.

[Photo of shipping station with scales and printer]

**Jonah's domain.** Final assembly, QC, packaging, and shipping out the door.

### Packaging Process

[Photos of packaging steps]

1. Final visual inspection
2. Cable organization (tie wraps, labels)
3. Box selection (we have 15 different sizes)
4. Protective packaging
5. Documentation/stickers
6. Weight and postage
7. Label print and application

[Photo of finished packages ready to ship]

**Today's shipments:** 12 packages going to 8 different countries

**Fun fact:** We've shipped to 43 countries. The most remote delivery was to a research station in Antarctica. (Yes, really.)

---

## Early Evening: 5:30 PM - Patch Session

[Photo of patch setup for testing/content creation]

Not every day, but often: After assembly and testing, someone builds a patch to verify musical/creative functionality.

**Today's patch:** Testing the new PGO modules with Stairs for wavefolder madness

[Photo of patch cables and modules in action]
[Photo of monitor showing the video output]

**This is the moment it all makes sense.** Hours of SMT placement and firmware debugging fade away when you see what the tools can actually do.

[Photo or video still of the generated imagery]

Sometimes we record these for Instagram or Discord. Sometimes we just sit and watch for a few minutes before heading home.

---

## Evening Wrap: 6:00 PM - Tomorrow's Plan

[Photo of whiteboard with task list]

**Tomorrow's priorities:**
- Complete SMX3 assembly batch (8 units)
- Videomancer firmware update testing
- RevI Chromagnon bringup
- Order restock (running low on 0805 caps)
- Customer support responses (15 emails pending)
- Blog post draft (you're reading it!)

[Photo of cleaned-up shop floor]

We try to leave the space cleaner than we found it each morning. Doesn't always work out that way.

---

## What You Don't See

**[Section on the harder parts]**

[Photo of electronics recycling bin full of failed prototypes]

- The prototypes that didn't work (there are many)
- The all-nighters before big deadlines
- The stress of cashflow gaps
- The difficult conversations about project delays
- The emotional toll of disappointing customers

[Photo of notes/sketches on difficult design problems]

This isn't a glamorous business. It's repetitive assembly, tedious testing, frustrating debugging, and constant problem-solving. But it's also deeply satisfying when a customer emails to say they created something beautiful with the tools we made.

---

## The Team

**[Individual profiles with photos]**

### Lars Larsen - Product Designer & Owner
[Photo]
- Designs circuits, writes firmware, manages projects
- Coffee intake: Excessive
- Favorite module to assemble: ESG3 (most complex)
- Spirit animal: Caffeine molecule

### Nick - Production & Assembly
[Photo]
- Master of the soldering iron
- Runs the testing bench
- Keeps inventory organized
- Spirit animal: Hans the SMT machine

### Andrew - SMT Operations
[Photo]
- Hans whisperer
- Microscope specialist
- Rework wizard
- Spirit animal: 0402 resistor (small but essential)

### Jonah - Fulfillment & QC
[Photo]
- Shipping coordinator
- Final inspection
- Customer communication
- Spirit animal: Packing tape dispenser

**[Note on team size]**

Four people. That's the current core team keeping LZX running. We're not a corporation - we're a small group of people who care deeply about these tools and the community that uses them.

In 2023-2024, we had a larger team (up to 9 people). Supply chain challenges and market conditions forced us to downsize. It's been difficult, but it's also clarified our focus: Make great tools. Support our community. Stay alive to ship Chromagnon.

---

## Why We Do This

**[Closing reflection]**

[Photo of the team together in the workshop]

Small-batch electronics manufacturing in the US is not a lucrative business. It would be easier and more profitable to design in the US, manufacture in China, and drop-ship from Alibaba. But that's not what this is about.

LZX exists because:
- Analog video synthesis is a unique art form worth preserving
- The community deserves tools built by people who understand the craft
- Some things are worth doing even when they're hard
- We get to make weird electronic instruments for living, which is basically the dream

Every module that leaves this workshop is built by human hands, tested by human eyes, and shipped with genuine care. That's the difference between a product and a craft.

**[Call to action]**

Next time you turn on your Vessel case or patch in a new module, know that real people built it in this workshop. We're not a faceless corporation - we're Nick and Andrew and Jonah and Lars, working daily to keep this weird corner of the arts alive.

Thank you for supporting small-batch manufacturing and analog video synthesis.

---

## Want to Visit?

We occasionally host workshop tours and open studio days. If you're in the Portland area and want to see the space in person, reach out via [contact method]. We love showing people the operation.

**Upcoming events:**
- [TBD: Workshop open house]
- [TBD: LZX user meetup]

---

This is what it takes to keep analog video synthesis alive. One module at a time. One test at a time. One shipment at a time.

See you in the workshop.

**- The LZX Team**
