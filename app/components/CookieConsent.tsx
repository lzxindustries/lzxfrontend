import {useEffect, useState} from 'react';
import {ADVERTISING_CONSENT_STORAGE_KEY} from '~/lib/advertising-consent';

export function CookieConsent({
  onConsent,
}: {
  onConsent: (hasConsent: boolean) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(ADVERTISING_CONSENT_STORAGE_KEY);
    if (stored === null) {
      setVisible(true);
    } else {
      onConsent(stored === 'true');
    }
  }, [onConsent]);

  function accept() {
    localStorage.setItem(ADVERTISING_CONSENT_STORAGE_KEY, 'true');
    onConsent(true);
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(ADVERTISING_CONSENT_STORAGE_KEY, 'false');
    onConsent(false);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] bg-base-200 border-t border-base-300 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm flex-1">
          We use cookies for analytics and to improve your experience. You can
          accept or decline non-essential cookies. See our{' '}
          <a className="link link-primary" href="/policies/privacy-policy">
            Privacy Policy
          </a>{' '}
          for details.
        </p>
        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={decline}
            className="btn btn-ghost flex-1 sm:flex-none min-h-11"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="btn btn-primary flex-1 sm:flex-none min-h-11"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
