import {useEffect, useState} from 'react';
import {FaMoon, FaSun} from 'react-icons/fa';

export const LIGHT_THEME = 'lofi';
export const DARK_THEME = 'night';
const STORAGE_KEY = 'lzx-theme';

/**
 * Inline script string injected in <head> to set the theme before paint
 * (avoids a flash of the wrong theme on first load). Reads localStorage,
 * falls back to prefers-color-scheme.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'${DARK_THEME}':'${LIGHT_THEME}';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','${LIGHT_THEME}');}})();`;

function readInitialTheme(): string {
  if (typeof document === 'undefined') return LIGHT_THEME;
  return (
    document.documentElement.getAttribute('data-theme') || LIGHT_THEME
  );
}

export function ThemeToggle({iconSize = 20}: {iconSize?: number}) {
  const [theme, setTheme] = useState<string>(LIGHT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readInitialTheme());
    setMounted(true);
  }, []);

  const isDark = theme === DARK_THEME;

  const toggle = () => {
    const next = isDark ? LIGHT_THEME : DARK_THEME;
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore quota / privacy mode */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      title={isDark ? 'Light mode' : 'Dark mode'}
      data-testid="theme-toggle"
      // suppressHydrationWarning: server renders the default; client may
      // immediately swap based on localStorage / prefers-color-scheme
      suppressHydrationWarning
    >
      {mounted && isDark ? (
        <FaSun size={iconSize} />
      ) : (
        <FaMoon size={iconSize} />
      )}
    </button>
  );
}
