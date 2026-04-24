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
  options?: {eventId?: string},
) {
  if (!readAdvertisingConsent()) return;
  if (typeof window !== 'undefined' && window.fbq) {
    if (options?.eventId) {
      window.fbq('track', event, params, {eventID: options.eventId});
      return;
    }
    window.fbq('track', event, params);
  }
}
