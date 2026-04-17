---
slug: the-redesign-decision
title: 'The Redesign Decision: Why We Changed Everything in 2025'
authors: [lars]
tags: [chromagnon, videomancer, manufacturing, business]
draft: true
---

:::danger PLACEHOLDER CONTENT - DO NOT PUBLISH
This is a detailed outline only. Requires:

- Verification of all technical specs and cost figures
- Actual photos/renders of both designs for comparison
- Review of financial data for accuracy
- Legal review of tariff/business information shared
- Confirmation of timeline and forward-looking statements
- Complete rewrite with accurate data and approved messaging
  :::

**[Opening]**

In May 2025, I wrote a blog post titled "This Week in Hell" that briefly mentioned we were radically redesigning Chromagnon in response to China tariffs jumping from 0% to 175% (then "settling" at 55%). What I didn't have space to explore in that post was the magnitude of the decision - or why the redesign that emerged might actually be better than the original plan.

This is the story of how economic catastrophe forced better engineering.

<!--truncate-->

---

## The Original Vision (2023-2024)

**[Section establishing baseline]**

### What Chromagnon Was Supposed to Be

[Rendering or photo of original Chromagnon design concept]

When we started designing Chromagnon in earnest in 2023, the vision was:

**Enclosure:**

- Custom injection-molded plastic shell
- Integrated aluminum heat spreader
- Internal cooling fan
- Custom molded knobs (like Vidiot)
- Premium finish and feel

**Electronics:**

- Single main PCB with FPGA, power, and all analog circuits
- External assembly in China for SMT work
- Complex but cost-effective at scale
- High component density

**Timeline:**

- Complete in Q1 2024
- Ship first units Q2 2024
- Fulfill all pre-orders by end of 2024

**Pricing:**

- Target retail: $2,400-2,600
- Margin sufficient for business sustainability

[Technical diagram of original architecture]

### The Engineering Philosophy

Why this design?

1. **Integration:** Everything on one board meant fewer connection points, lower assembly time, reduced failure modes
2. **Cost:** China manufacturing meant affordable SMT assembly for complex boards
3. **Aesthetics:** Injection molding created the premium look/feel customers expect
4. **Scale:** Designed to eventually produce 500+ units per year

It made sense. It should have worked.

---

## When the Numbers Changed (April 2025)

**[The tariff crisis moment]**

### The Email That Changed Everything

On April 23, 2025, I received a quote from our China PCB vendor:

**Original quote (March 2025):**

- PCB fabrication and assembly: $284 per unit
- Projected landed cost after shipping/duties: ~$320

**New quote (April 2025):**

- PCB fabrication and assembly: $284 per unit
- Tariffs (175%): +$497
- **Total: $781 per unit**

[Screenshot or graphic showing the cost breakdown]

For context: Our bill of materials (components only) was $180. Adding $781 just for PCB assembly meant the unit cost exceeded retail price before we even began final assembly.

**The math was simple:** Chromagnon was financially impossible.

### What a 175% Tariff Actually Means

Let's be specific about the impact:

**Per-unit cost increase:**

- PCBs: +$497
- Injection molding tooling: +$18,000 (amortized cost increase)
- Plastic parts: +$45 per unit
- Custom knobs: +$80 per unit
- Cooling fans: +$12 per unit
- **Total landed cost impact: ~$650-700 per unit**

**Business implications:**

- Need to raise retail price by $700 minimum
- Or absorb $700 loss per unit (impossible)
- Or redesign everything

Tariffs later "settled" at 55%, which still meant ~$250/unit cost increase. Still impossible at original pricing.

---

## The Decision Matrix (May 2025)

**[Walking through the options considered]**

We had three basic paths forward:

### Option 1: Push Through with Original Design

**Pros:**

- No redesign delay
- Meet original timeline
- Tooling already paid for

**Cons:**

- Retail price must increase to $3,200-3,400
- Lose most pre-orders (many placed at $1,999)
- Market positioning becomes difficult
- Customer trust damaged by price increase

**Verdict:** Unacceptable. Betrays pre-order customers.

---

### Option 2: Abandon Chromagnon Entirely

**Pros:**

- Stop bleeding money
- Refund pre-orders, move on
- Focus on profitable existing products

**Cons:**

- Moral failure (people waited years)
- Reputation damage
- Lose future revenue from flagship product
- Personal defeat

**Verdict:** Not an option. Would destroy LZX.

---

### Option 3: Radical Redesign for US Manufacturing

**Pros:**

- Eliminate tariff exposure
- Leverage in-house SMT capability (Hans)
- Force architecture improvements
- Maintain retail pricing
- Keep pre-order commitments

**Cons:**

- Major delay (6+ months)
- Need to solve complex technical challenges
- Requires abandoning sunk costs (tooling, etc.)
- Emotional toll of "starting over"

**Verdict:** Only viable path forward.

---

## What We Changed (And Why)

**[Detailed technical comparison]**

### Enclosure: Injection Molding → Sheet Metal

[Side-by-side images of plastic mockup vs sheet metal prototype]

**Original plan:**

- Custom injection-molded plastic shells
- Tooling cost: $45,000
- Per-unit cost: ~$35 (at volume)
- Lead time: 8-10 weeks from China
- Tariff exposure: High

**New approach:**

- Sheet metal enclosure (like Gen3 modules)
- Tooling cost: $8,000
- Per-unit cost: ~$50 (US manufacturing)
- Lead time: 2-3 weeks from Oregon
- Tariff exposure: Zero

**Tradeoffs:**

- Less "premium" aesthetic (subjective)
- Slightly heavier
- But: More repairable, modular, customizable
- Fits LZX design language better
- US manufacturing means rapid iteration

**Why it's better:** Original plastic design was borrowed from consumer electronics thinking. Sheet metal is honest about what Chromagnon is: a modular instrument. Plus, if we need to change anything, we're not locked into expensive injection mold tooling.

---

### Knobs: Custom Molded → Gen3 Standard Parts

[Photo comparison of knob styles]

**Original plan:**

- Custom injection-molded knobs (like Vidiot)
- Unique tactile feel and appearance
- Tooling: $12,000
- Tariff exposure: High

**New approach:**

- Use existing Gen3 knob design
- Already in production
- Zero additional tooling cost
- Consistent with modular aesthetic

**Why it's better:** Visual consistency across Gen3 ecosystem. Parts interchangeability. Customers already familiar with the feel. And honestly? The Gen3 knobs are excellent.

---

### Architecture: Monolithic → Modular Subassemblies

[Technical diagrams comparing architectures]

**Original plan:**

- Single large PCB with everything
- FPGA, power supply, analog circuits, all integrated
- Efficient at scale, but hard to test and iterate
- One bad component means scrapping entire board

**New approach:**

- Core control board (FPGA, USB, system management)
- Separate analog processing boards
- Modular power distribution
- Subassemblies connect via internal bus

[Diagram showing new modular architecture]

**Why it's better:**

- Each board can be tested independently
- Failed component doesn't scrap entire assembly
- Can upgrade subsystems in future without full redesign
- Easier to manufacture with in-house SMT
- Better thermal management (no cooling fan needed!)
- **Shared platform with Videomancer** (crucial point)

---

### FPGA Platform: Original Design → EVS39 Platform

[Block diagrams of both approaches]

**Original plan:**

- Custom FPGA implementation
- Optimized for Chromagnon specifically
- Significant firmware development investment

**New approach:**

- EVS39 embedded video synthesizer platform
- Developed initially for Videomancer
- Shared firmware infrastructure
- Modular subsystem design

**Why it's better:**

- One codebase supports both Chromagnon and Videomancer
- Bug fixes benefit both products
- Features developed for one benefit the other
- Development effort is amortized across products
- Platform architecture enables future products

**The key insight:** By developing the EVS39 platform first in Videomancer (simpler product), we validate the architecture before bringing it into Chromagnon (complex product). This significantly de-risks the Chromagnon redesign.

---

### Button Caps: Injection Molded → 3D Printed

[Photos of button cap options]

**Original plan:**

- Injection-molded button caps
- Tooling: $8,000
- Beautiful but expensive

**New approach:**

- Resin 3D printed button caps
- In-house production capability
- Cost: ~$2 per cap vs. ~$3 for molded
- Can iterate designs freely

**Why it's better:** 3D printing technology has reached the point where resin prints rival injection molding for small parts. We can produce them in-house, iterate designs quickly, and offer custom colors. Win-win-win.

---

### Cooling: Active Fan → Passive Design

[Thermal images or diagrams]

**Original plan:**

- Internal cooling fan
- Required due to component density and power
- Adds cost, noise, failure point

**New approach:**

- Modular architecture has better thermal distribution
- Heat spreader integrated into sheet metal enclosure
- Passive cooling sufficient
- Silent operation

**Why it's better:** One fewer thing to break. No noise. Lower power consumption. Simpler assembly.

---

## The Videomancer Strategy

**[Explaining the twin-product approach]**

### The Elegant Solution to Cashflow

Here's the problem: Chromagnon redesign takes months. But we still need revenue to keep LZX alive. And we need to validate the new architecture before committing to Chromagnon production.

**Enter Videomancer.**

[Image of Videomancer prototype]

### What is Videomancer?

- Modular embedded FPGA video processor
- Uses the same EVS39 platform as redesigned Chromagnon
- Simpler product (fewer analog circuits, smaller form factor)
- Faster to bring to market
- Higher margin (less complex assembly)

### The Strategy

1. **Phase 1 (Summer 2025):** Develop Videomancer as standalone product

   - Validates EVS39 platform in real-world use
   - Generates revenue during Chromagnon redesign
   - Builds confidence in new architecture

2. **Phase 2 (Fall 2025):** Ship Videomancer to early adopters

   - Real-world testing with actual users
   - Firmware stabilization
   - Proves manufacturing capability

3. **Phase 3 (Winter 2025):** Integrate validated platform into Chromagnon

   - Architecture already proven
   - Firmware already stable
   - Manufacturing already practiced
   - Risk dramatically reduced

4. **Phase 4 (2026):** Ship both products in parallel
   - Shared platform means efficient development
   - Two products share R&D costs
   - Videomancer revenue supports Chromagnon fulfillment

### Why This Works

**For customers:**

- Videomancer offers early access to new technology
- Chromagnon pre-order customers get first access to Videomancer
- More products in ecosystem means more creative options

**For LZX:**

- Revenue during redesign period
- Risk reduction through staged rollout
- Platform development amortized across two products
- Long-term: Foundation for future products

**Technical benefits:**

- One firmware stack (bug fixes benefit both)
- Shared subsystems reduce part count
- Manufacturing efficiencies
- Knowledge transfer between products

[Diagram showing platform relationships]

---

## The Cost Analysis: Before & After

**[Detailed financial breakdown]**

### Original Design (2024 Plan)

| Component                          | Cost       |
| ---------------------------------- | ---------- |
| PCB fabrication + assembly (China) | $320       |
| Injection molded enclosure         | $35        |
| Custom knobs (set)                 | $40        |
| Cooling fan                        | $12        |
| Additional components              | $180       |
| Assembly labor (US)                | $80        |
| **Total landed cost**              | **$667**   |
| **Retail at 2.8x**                 | **$1,868** |
| Pre-order pricing                  | $1,999     |
| Margin                             | $332 (17%) |

### With Tariffs (2025 Reality)

| Component                           | Cost       |
| ----------------------------------- | ---------- |
| PCB fabrication + assembly (China)  | $320       |
| Tariffs (55%)                       | $176       |
| Injection molded enclosure + tariff | $89        |
| Custom knobs + tariff               | $62        |
| Cooling fan + tariff                | $19        |
| Additional components               | $180       |
| Assembly labor (US)                 | $80        |
| **Total landed cost**               | **$926**   |
| **Required retail**                 | **$2,593** |
| Pre-order pricing                   | $1,999     |
| **Loss per unit**                   | **$927**   |

**Conclusion:** Original design is financially impossible.

### Redesigned Chromagnon (2025+ Plan)

| Component                            | Cost       |
| ------------------------------------ | ---------- |
| PCB fabrication + assembly (US/Hans) | $280       |
| Sheet metal enclosure (Oregon)       | $50        |
| Gen3 knobs (existing stock)          | $24        |
| No cooling fan                       | $0         |
| Additional components                | $180       |
| Assembly labor (US)                  | $100       |
| **Total landed cost**                | **$634**   |
| **Retail at 2.8x**                   | **$1,775** |
| Pre-order pricing                    | $1,999     |
| Margin                               | $365 (18%) |

**Key points:**

- Lower total cost than original design
- Zero tariff exposure
- Higher margin percentage
- Delivered at or below pre-order price
- Sustainable business model

---

## Technical Improvements from Redesign

**[Unexpected benefits section]**

### What We Gained

Beyond avoiding tariff catastrophe, the redesign actually improved Chromagnon in several ways:

#### 1. **Testability**

Original single-board design was difficult to debug. Modular architecture allows testing each subsystem independently. This significantly reduces manufacturing time and improves quality control.

#### 2. **Serviceability**

If a component fails, customers (or we) can replace the affected board rather than scrapping the entire unit. This extends product lifespan and reduces waste.

#### 3. **Thermal Performance**

Distributing heat-generating components across multiple boards eliminated the need for active cooling. The result is silent operation and one fewer failure point.

#### 4. **Future-Proofing**

The EVS39 platform architecture means future products can reuse validated subsystems. This dramatically reduces development time for next-generation instruments.

#### 5. **Manufacturing Flexibility**

In-house SMT assembly means we can iterate quickly. Found an issue? We can fix it in days rather than waiting weeks for overseas production.

#### 6. **Supply Chain Resilience**

Relying primarily on US manufacturing eliminates exposure to trade policy changes, shipping delays, and international supply chain disruptions.

---

## What We Lost (Being Honest)

**[Acknowledging tradeoffs]**

### The Costs of Redesign

Not everything about this decision was positive:

#### 1. **Time**

The redesign delayed Chromagnon by ~8-12 months. That's time customers waited longer, and time we couldn't generate revenue from our flagship product.

#### 2. **Sunk Costs**

- Injection molding tooling: $45,000
- Custom knob tooling: $12,000
- Original PCB prototypes and testing: ~$20,000
- **Total abandoned investment: ~$77,000**

That's painful for a small business. But continuing with an unsustainable design would have been worse.

#### 3. **Aesthetic Vision**

The original injection-molded design was gorgeous. Sheet metal is more utilitarian. Some customers will prefer the original aesthetic. We've made peace with that tradeoff.

#### 4. **Emotional Toll**

After 18 months of development on the original design, starting over was demoralizing. The team struggled with it. I struggled with it. "Are we ever going to finish this?"

But the alternative - shipping an overpriced product or abandoning the project - was worse.

---

## Lessons for Small Manufacturers

**[Broader implications]**

### What We Learned (The Hard Way)

If you're a small-scale hardware manufacturer, here are the lessons from our experience:

#### 1. **Tariff Risk is Real**

We designed assuming 0% tariffs would continue. That was naive. Trade policy can change overnight. Build flexibility into your supply chain.

#### 2. **Sunk Costs Are a Trap**

We held onto the original design too long because of money already spent. The right decision is based on future costs, not past costs.

#### 3. **Constraints Can Improve Design**

Being forced to redesign for US manufacturing led to better architecture. Sometimes limitations force better solutions.

#### 4. **Platform Thinking Saves You**

Developing the EVS39 platform that works across products means we're not starting from scratch for every new design. Invest in foundations.

#### 5. **Communicate Even When It's Painful**

Writing "This Week in Hell" was hard. But transparency maintains trust even when news is bad. Silence is worse than admitting problems.

#### 6. **Have a Cash Flow Strategy**

Videomancer as revenue generator during Chromagnon redesign was crucial. Long development cycles need funding. Plan for it.

#### 7. **Your Community Wants You to Succeed**

Response to the redesign decision was overwhelmingly supportive. People would rather wait for the right product than receive a compromised one.

---

## Timeline: What Happens Next

**[Looking forward]**

### The Path to Shipment

Here's where we are and where we're going:

**Completed (as of Dec 2025):**

- ✅ Redesign architecture finalized
- ✅ EVS39 platform validated in Videomancer
- ✅ Sheet metal enclosure prototypes
- ✅ Chromagnon Control Board RevI fabricated and partially tested
- ✅ Chromagnon Simulator released for Windows
- ✅ Firmware core functionality complete

**In Progress (Dec 2025 - Feb 2026):**

- 🔄 Videomancer first production run shipping
- 🔄 Chromagnon RevI full validation
- 🔄 Analog processing boards redesign
- 🔄 Desktop configuration app development
- 🔄 Final mechanical design and fit check

**Upcoming (Q1 2026):**

- Chromagnon prototype build (first complete redesigned unit)
- Beta testing with select pre-order customers
- Firmware stabilization
- Production setup and tooling

**Target (Q2-Q3 2026):**

- First production units ship
- Begin fulfilling pre-orders
- Ramp production as component availability allows

### Being Realistic

I've learned not to promise specific months. But here's what I can say:

- The redesigned Chromagnon is technically superior to the original design
- The architecture is validated through Videomancer
- In-house manufacturing gives us control over timeline
- We will ship this product, and it will be worth the wait

---

## Why I'm Sharing This

**[Closing reflection]**

### Transparency as Policy

I could have written a simple blog post: "Chromagnon delayed due to manufacturing challenges." Most companies would.

But I've always believed the LZX community deserves honesty. You've waited years. You've trusted us with pre-order money. You deserve to understand _why_ things changed and _how_ we're solving it.

This redesign wasn't a choice - it was forced by circumstances beyond our control (tariff policy). But how we responded to that challenge _was_ a choice.

We could have:

- Raised prices dramatically
- Shipped a compromised product
- Given up entirely
- Switched to cheaper components

We chose none of those paths.

Instead, we redesigned from the ground up to deliver the instrument you deserve at a price that honors your pre-order commitment. It took longer. It cost more. It was emotionally exhausting. But it was the right decision.

### Better Through Iteration

One of the core principles of modular synthesis - audio or video - is that constraints breed creativity. You can't have infinite options, so you work with what's available and discover unexpected solutions.

The Chromagnon redesign embodies that principle. Tariffs were a constraint we didn't choose. But working within that constraint led to:

- Better architecture
- Shared platform development
- Videomancer as companion product
- US manufacturing capability
- More sustainable business model

Sometimes the best designs emerge from solving problems rather than unlimited resources.

---

## Thank You

**[Final words]**

To every Chromagnon pre-order customer: Thank you for your patience. Thank you for your support. Thank you for trusting that we would figure this out.

The redesigned Chromagnon will be worth the wait. Not because marketing says so, but because economic reality forced us to make it better.

See you on the other side.

**- Lars**

---

## Technical Appendix

**[For the detail-oriented]**

### Full Bill of Materials Comparison

[Detailed spreadsheet-style table comparing every component in original vs. redesigned Chromagnon]

### Architecture Block Diagrams

[Detailed technical schematics showing signal flow, power distribution, FPGA configuration, etc.]

### Manufacturing Process Comparison

[Flowcharts showing original China-based process vs. new US-based process]

### Platform Roadmap

[Diagram showing how EVS39 platform enables future products beyond Chromagnon and Videomancer]

---

**Questions? Reach out via the usual channels. I'm happy to discuss the technical details further.**
