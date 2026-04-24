/** Must match the key used in `CookieConsent` for Meta / advertising tags. */
export const ADVERTISING_CONSENT_STORAGE_KEY = 'lzx-cookie-consent';

export function readAdvertisingConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(ADVERTISING_CONSENT_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}
