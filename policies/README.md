# LZX Industries — Store Policies

This directory contains all store policies for lzxindustries.net, ready to paste into Shopify.

## Files

| File                     | Shopify Location                       | Status                                               |
| ------------------------ | -------------------------------------- | ---------------------------------------------------- |
| `shipping-policy.md`     | Settings → Policies → Shipping policy  | **New** (currently 404 on site)                      |
| `refund-policy.md`       | Settings → Policies → Refund policy    | **Replaces** existing "no refunds" text              |
| `terms-of-service.md`    | Settings → Policies → Terms of service | **Replaces** existing ToS (includes Warranty Policy) |
| `privacy-policy.md`      | Settings → Policies → Privacy policy   | **New** (currently missing)                          |
| `contact-information.md` | Pages → Contact Information            | **New**                                              |
| `legal-notice.md`        | Pages → Legal Notice                   | **New**                                              |

Each policy also has a matching `.html` file (e.g., `shipping-policy.html`) formatted for direct paste into Shopify's HTML editor.

## How to Publish

1. Log in to your Shopify admin at `your-store.myshopify.com/admin`.
2. Go to **Settings → Policies**.
3. For each policy, click into the corresponding field.
4. Switch to the **HTML editor** (click the `<>` button in the rich text toolbar).
5. Paste the contents of the matching `.html` file.
6. Click **Save**.

## Before You Publish

Address and state placeholders have been filled in:

- **Address:** 3955 SE Ankeny St, Portland, OR 97214, USA
- **Governing law state:** Oregon

## Note on Warranty Policy

Shopify does not have a dedicated "Warranty" policy slot. The warranty text is included as a section at the bottom of the Terms of Service (in both `.md` and `.html` files).

The refund policy cross-references the warranty section via an anchor link (`/policies/terms-of-service#warranty`).

## Footer Navigation

After publishing policies in Shopify, update your footer to link to all five policies. The site's policy routes at `/policies/{handle}` will automatically render any policy defined in Shopify settings. For the Warranty policy (if using a standalone page), add a manual link.
