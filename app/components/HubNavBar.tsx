import {Link, useLocation} from '@remix-run/react';
import clsx from 'clsx';

export interface HubTab {
  label: string;
  to: string;
  hidden?: boolean;
}

interface HubNavBarProps {
  tabs: HubTab[];
}

export function HubNavBar({tabs}: HubNavBarProps) {
  const location = useLocation();
  const visibleTabs = tabs.filter((t) => !t.hidden);

  return (
    <nav
      aria-label="Product sections"
      className="border-b border-base-300 bg-base-100 sticky top-0 z-30"
      data-testid="hub-nav"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10 relative">
        {/* Edge fade masks hint the horizontal scroll on narrow viewports.
         * Pointer-events pass through so the tabs stay clickable under them. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-base-100 to-transparent md:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-base-100 to-transparent md:hidden"
        />
        <ul className="flex gap-0 overflow-x-auto scrollbar-none -mb-px">
          {visibleTabs.map((tab) => {
            const isActive =
              location.pathname === tab.to ||
              (tab.to !== visibleTabs[0]?.to &&
                location.pathname.startsWith(tab.to + '/'));

            return (
              <li key={tab.to}>
                <Link
                  to={tab.to}
                  prefetch="intent"
                  className={clsx(
                    'inline-block whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-base-content/60 hover:text-base-content hover:border-base-300',
                  )}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
