# Notify Me Rollout Guide

This checklist covers everything still required to move back-in-stock notifications from code-complete to production-ready.

## If you do not have Klaviyo yet

You can still ship safely in placeholder mode.

1. Do not set `KLAVIYO_PRIVATE_API_KEY` yet.
2. Deploy as-is.
3. Notify Me forms will still return a friendly success message, but no provider-side subscription is created.
4. When ready, create Klaviyo, set the key, and rerun the Step 4 smoke test.

Important: Placeholder mode prevents user-facing errors, but does not deliver real back-in-stock emails.

## What is already done in code

- Sold-out forms on both module and instrument product pages post to `/api/notify-me`.
- `app/routes/($lang).api.notify-me.tsx` is implemented with Klaviyo support and graceful fallback when no key is set.
- `KLAVIYO_PRIVATE_API_KEY` is documented in `README.md` and scaffolded in `setup.sh`.
- Unit tests now exist for notify route behavior:
  - `app/routes/__tests__/notify-me.test.ts`

## Step 1: Run local verification (you can do this now)

From repo root:

```bash
yarn test app/routes/__tests__/notify-me.test.ts
yarn run typecheck
```

Expected result:

- Unit tests pass.
- Typecheck exits with code 0.

## Step 2: Configure production secret (required user/platform step)

Set `KLAVIYO_PRIVATE_API_KEY` in your deployment environment.

If using environment UI (recommended):

1. Open your deployment provider dashboard.
2. Add secret `KLAVIYO_PRIVATE_API_KEY`.
3. Redeploy.

If using CLI-based secret management (only if your environment supports it), use your provider’s secret command and then redeploy.

## Step 3: Create/confirm Klaviyo back-in-stock target (required user/platform step)

1. In Klaviyo, confirm your account has Back in Stock subscriptions enabled.
2. Confirm API key permissions include back-in-stock subscription write access.
3. If your workflow expects specific list/flow tagging, configure it now.

## Step 4: Manual E2E smoke test in browser (required user step)

1. Start app locally (`yarn dev`) or open staging.
2. Navigate to a sold-out module page.
3. Submit Notify Me form with test email.
4. Repeat on a sold-out instrument page.
5. Confirm:
   - Success message appears in UI.
   - Submission appears in Klaviyo.

Negative checks:

1. Submit invalid email and confirm validation error response.
2. Temporarily remove key in local env and confirm graceful fallback message.

## Step 5: Post-deploy monitoring (required user step)

For the first 24-48 hours:

1. Watch server logs for `/api/notify-me` failures.
2. Track non-200 response counts.
3. Confirm submissions are not silently failing in Klaviyo.

## Optional next hardening

1. Add Playwright E2E for sold-out notify form behavior.
2. Add rate-limiting/captcha if abuse appears.
3. Add email domain allow/deny rules if needed.
