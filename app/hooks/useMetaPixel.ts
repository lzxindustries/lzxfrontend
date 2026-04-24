import {readAdvertisingConsent} from '~/lib/advertising-consent';

export function trackMetaEvent(
  event:
    | 'ViewContent'
    | 'AddToCart'
    | 'InitiateCheckout'
    | 'Purchase'
    | 'Search'
    | 'AddPaymentInfo',
  params?: Record<string, unknown>,
) {
  if (!readAdvertisingConsent()) return;
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, params);
  }
}
