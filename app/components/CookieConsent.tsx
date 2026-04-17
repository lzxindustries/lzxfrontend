import {useEffect, useState} from 'react';

const CONSENT_KEY = 'lzx-cookie-consent';

export function CookieConsent({
  onConsent,
}: {
  onConsent: (hasConsent: boolean) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === null) {
      setVisible(true);
    } else {
      onConsent(stored === 'true');
    }
  }, [onConsent]);

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'true');
    onConsent(true);
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'false');
    onConsent(false);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] p-4 bg-base-200 border-t border-base-300 shadow-lg">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm flex-1">
          We use cookies for analytics and to improve your experience. You can
          accept or decline non-essential cookies.
        </p>
        <div className="flex gap-2 shrink-0">
          <button onClick={decline} className="btn btn-sm btn-ghost">
            Decline
          </button>
          <button onClick={accept} className="btn btn-sm btn-primary">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
