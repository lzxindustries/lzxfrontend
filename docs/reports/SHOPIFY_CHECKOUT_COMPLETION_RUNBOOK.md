# Shopify checkout completion runbook (no new creative)

This runbook operationalizes the current 7-day plan with concrete actions in Shopify and Meta while keeping ad creative unchanged.

## Scope

- Goal: improve **InitiateCheckout -> Purchase** completion.
- Constraint: use current website and current ad assets only.
- Primary KPI: checkout completion rate (`purchases / initiated_checkouts`).

## Baseline from current snapshot

- Content views: `771`
- Initiated checkouts: `50`
- Purchases: `6`
- Approx checkout completion: `12%`

## Daily scorecard template

Capture these once per day at a fixed time:

- Spend
- Purchases
- Purchase value
- CPA
- ROAS
- Initiated checkouts
- Checkout completion %
- Mobile checkout completion %
- Top 3 error sources (payments, address, shipping, discount)

## CLI tasks completed by agent

Executed in this repo:

- `yarn shopify:sync:doctor`
- `yarn shopify:store-sync:doctor`
- `yarn shopify:sync:diff` (dry run only, no apply)
- `yarn shopify:store-sync:diff`
- `yarn shopify:store-sync:pull --handle shipping-policy --handle refund-policy`

No Shopify write/apply command has been run.

## CLI commands for you (safe sequence)

Run these from repo root:

1. Verify environment and permissions:
   - `yarn shopify:sync:doctor`
   - `yarn shopify:store-sync:doctor`
2. Pull latest policies/pages used for trust messaging:
   - `yarn shopify:store-sync:pull --handle shipping-policy --handle refund-policy`
3. Preview store-level changes before apply:
   - `yarn shopify:store-sync:diff --handle shipping-policy --handle refund-policy`
   - `yarn shopify:store-sync:push --handle shipping-policy --handle refund-policy`
4. Apply store-level changes only if diff is expected:
   - `yarn shopify:store-sync:apply --handle shipping-policy --handle refund-policy`
5. Product catalog safety check (no apply):
   - `yarn shopify:sync:diff`

Avoid `yarn shopify:sync:apply` during this checkout-only sprint unless you explicitly want product catalog content/SEO changes pushed.

## Owner action checklist (exact steps)

Use this as a direct operator checklist. Keep ad creative unchanged during this sprint.

### 1) Shopify checkout settings audit (30-45 min)

1. Open **Shopify Admin -> Settings -> Checkout**.
2. In **Customer contact method / customer accounts**:
   - Keep account creation optional.
   - Verify guest checkout path remains available.
3. In **Checkout form options**:
   - Set optional fields to optional (or hidden where allowed).
   - Keep only fields required for fulfillment/compliance.
4. In **Checkout language/editor/customizations**:
   - Remove non-essential distractions near payment.
   - Keep support and policy links visible near final confirmation.
5. Save and run one live test checkout.

Pass criteria:
- Guest path works.
- No mandatory non-essential fields.
- No broken validation loops.

### 2) Accelerated payment verification (20 min)

1. Open **Shopify Admin -> Settings -> Payments**.
2. Confirm accelerated wallets relevant to your market are enabled:
   - Shop Pay
   - Apple Pay
   - Google Pay
3. Run one mobile checkout test for each available wallet.

Pass criteria:
- Wallet buttons appear for eligible devices.
- Wallet flow reaches order completion without errors.

### 3) Shipping clarity and surprise-cost prevention (30-60 min)

1. Open **Shopify Admin -> Settings -> Shipping and delivery**.
2. Validate each shipping zone/rate used by active campaign geos.
3. Confirm there are no missing rates that block checkout for target regions.
4. Ensure ETA expectations are documented in customer-visible policy text.
5. Re-test checkout for top geo and verify rates appear before payment completion.

Pass criteria:
- No "no shipping available" blocker for target geos.
- Shipping/tax behavior is consistent with policy and cart expectations.

### 4) Policy trust pass (20-30 min)

1. Open:
   - **Shopify Admin -> Settings -> Policies**
2. Verify **Shipping** and **Refund** policies are complete and current.
3. Confirm storefront policy URLs resolve correctly.
4. Ensure support contact route is valid (`/support`) and monitored.

Pass criteria:
- Policy links resolve.
- Copy matches actual operations (shipping windows, returns).

### 5) Abandoned checkout recovery tuning (45-60 min)

1. Open **Shopify Admin -> Marketing -> Automations** (or your ESP/Klaviyo flow).
2. Locate abandoned checkout flow.
3. Set sequence timing:
   - Message 1: 30-60 minutes
   - Message 2: 24 hours
   - Message 3: 48 hours
4. Ensure links return users to active checkout/cart state.
5. Add suppression for recent purchasers.
6. Send test events and verify delivery.

Pass criteria:
- Flow triggers reliably.
- Links restore checkout session.
- Purchasers are suppressed promptly.

### 6) Meta budget optimization with fixed creative (20 min daily)

1. Open **Meta Ads Manager -> Campaign -> Breakdown**.
2. Review by:
   - Device
   - Placement
   - Audience/ad set
3. For each ad set, record:
   - Initiated checkouts
   - Purchases
   - Checkout completion %
   - CPA / ROAS
4. Reallocate budget toward better completion performers.
5. Do not launch new creatives during this sprint.

Decision rules:
- If spend >= 1.5x target CPA and purchases = 0, reduce spend.
- If initiated checkouts are high but completion stays weak after 48-72h, prioritize checkout fixes over scaling.

## 7-day implementation checklist

### Day 1: measurement integrity

- Validate Meta Pixel + CAPI parity for `AddToCart`, `InitiateCheckout`, `Purchase`.
- Confirm deduplication quality and matching keys.
- Verify purchase currency/value and timezone alignment between Shopify and Meta.
- Export baseline by device (mobile vs desktop).

### Day 1-2: highest-friction blockers

- Run full test checkouts on iOS Safari, Android Chrome, and desktop.
- Log every blocker: form validation failures, payment declines, shipping surprises, discount confusion.
- Fix severe blockers first (anything that prevents order completion entirely).

### Day 2-3: trust and transparency

- Ensure shipping cost and ETA are visible before final payment confirmation.
- Ensure return/refund policy and support path are visible near checkout decisions.
- Confirm accelerated methods (Shop Pay, Apple Pay, Google Pay where available) are active.

### Day 3-5: flow simplification

- Remove optional checkout fields that are not required for fulfillment or compliance.
- Audit checkout extensions/apps; remove low-value elements that add friction or latency.
- Ensure account creation is optional and guest path stays clear.

### Day 4-6: abandonment recovery

- Verify abandoned checkout automations are triggering correctly.
- Configure first reminder within 30-60 minutes; follow-ups at 24h and 48h.
- Ensure recovery links reopen active checkout/cart state.
- Exclude recent purchasers from reminders quickly.

### Day 5-7: spend reallocation without creative changes

- Compare ad sets on checkout completion %, CPA, and ROAS.
- Shift budget toward segments with stronger completion, especially mobile winners.
- Reduce budget where initiated checkout is high but completion remains weak after fixes.

## Decision thresholds

- If an ad set spends `>= 1.5x` target CPA with `0` purchases, reduce spend.
- If initiated checkouts rise but completion does not improve within `48-72h`, prioritize checkout friction over traffic scaling.
- If mobile completion is `>= 30%` worse than desktop, prioritize mobile-only checkout fixes first.

## Success criteria for this sprint

- Lift checkout completion from `~12%` to at least `15-18%`.
- Increase purchases from current traffic with no new creative production.
- Show 3 consecutive days of improved CPA/ROAS after core checkout fixes.

## Notes for operators

- Attribution can be modeled or delayed. Evaluate trends over multiple days, not single-day spikes.
- Keep creative static during this sprint so conversion gains can be attributed to checkout improvements.

## Execution log (current sprint)

- `shopify:sync:doctor` passed.
- `shopify:store-sync:doctor` passed.
- `shopify:sync:diff` run in dry-run mode only (no catalog apply executed).
- `shopify:store-sync:pull --handle shipping-policy --handle refund-policy` completed.
- `shopify:store-sync:apply --handle shipping-policy --handle refund-policy` executed with no pending changes.
- `contact-information` page created and published in Shopify.
- `legal-notice` page created and published in Shopify.
- Cart tracking hardening shipped in storefront code:
  - richer `InitiateCheckout` payload
  - duplicate checkout-click tracking guard
  - visible cart action error block
  - purchase-event dedupe support with optional `eventID`
