import {useState, useRef, useEffect} from 'react';
import {FaChevronDown, FaExternalLinkAlt} from 'react-icons/fa';
import clsx from 'clsx';

export interface MegaMenuItem {
  label: string;
  to: string;
  external?: boolean;
  highlight?: boolean;
  description?: string;
  children?: MegaMenuItem[];
}

export interface MegaMenuGroup {
  label: string;
  items: MegaMenuItem[];
}

const MENU_GROUPS: MegaMenuGroup[] = [
  {
    label: 'Products',
    items: [
      {
        label: 'Videomancer',
        to: '/instruments/videomancer',
        highlight: true,
        description: 'Video effects console',
      },
      {label: 'Instruments', to: '/instruments'},
      {label: 'Modules', to: '/modules'},
      {label: 'Systems', to: '/systems'},
      {label: 'Accessories', to: '/accessories'},
      {label: 'Parts', to: '/parts'},
      {label: 'Merchandise', to: '/merchandise'},
      {label: 'Cases & Power', to: '/cases-and-power'},
      {label: 'B-Stock', to: '/b-stock'},
      {label: 'Shop All', to: '/catalog'},
    ],
  },
  {
    label: 'Support',
    items: [
      {label: 'Support Hub', to: '/support'},
      {label: 'Documentation', to: '/docs'},
      {label: 'Downloads', to: '/downloads'},
      {label: 'Getting Started', to: '/getting-started'},
      {label: 'LZX Connect', to: '/connect'},
      {label: 'Glossary', to: '/docs/guides/glossary'},
    ],
  },
  {
    label: 'Community',
    items: [
      {label: 'Blog', to: '/blog'},
      {label: 'Patches', to: '/patches'},
      {
        label: 'Forum',
        to: 'https://community.lzxindustries.net',
        external: true,
      },
    ],
  },
  {
    label: 'About',
    items: [
      {label: 'About LZX', to: '/about'},
      {label: 'Artists', to: '/artists'},
      {label: 'Legacy Modules', to: '/legacy'},
    ],
  },
];

// --- Desktop Mega Menu ---

function DesktopDropdown({
  group,
  url,
}: {
  group: MegaMenuGroup;
  url: string;
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const isGroupActive = group.items.some((item) => {
    if (item.external) return false;
    return url === item.to || url.startsWith(item.to + '/');
  });

  const handleEnter = () => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className={clsx(
          'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
          isGroupActive
            ? 'bg-base-200 text-primary'
            : 'hover:bg-base-200 text-base-content',
        )}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {group.label}
        <FaChevronDown
          className={clsx(
            'text-[10px] transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border border-base-300 bg-base-100 p-2 shadow-lg">
          {group.items.map((item) => {
            const isActive =
              !item.external &&
              (url === item.to || url.startsWith(item.to + '/'));
            return (
              <a
                key={item.to}
                href={item.to}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
                className={clsx(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-base-200',
                  item.highlight &&
                    !isActive &&
                    'text-[#0072BC] font-semibold',
                )}
                onClick={() => setOpen(false)}
              >
                <span className="flex-1">{item.label}</span>
                {item.external && (
                  <FaExternalLinkAlt className="text-[10px] opacity-50" />
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DesktopMegaMenu({url}: {url: string}) {
  return (
    <nav className="hidden lg:flex items-center gap-1" aria-label="Main" data-testid="mega-menu">
      <a
        href="/"
        className={clsx(
          'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
          url === '/' || url === ''
            ? 'bg-base-200 text-primary'
            : 'hover:bg-base-200',
        )}
      >
        Home
      </a>
      {MENU_GROUPS.map((group) => (
        <DesktopDropdown key={group.label} group={group} url={url} />
      ))}
    </nav>
  );
}

// --- Mobile Accordion Menu ---

function MobileAccordionGroup({
  group,
  url,
  onNavigate,
}: {
  group: MegaMenuGroup;
  url: string;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-base-200 last:border-b-0">
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {group.label}
        <FaChevronDown
          className={clsx(
            'text-[10px] transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <div className="pb-2">
          {group.items.map((item) => {
            const isActive =
              !item.external &&
              (url === item.to || url.startsWith(item.to + '/'));
            return (
              <a
                key={item.to}
                href={item.to}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
                className={clsx(
                  'flex items-center gap-2 px-6 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-base-200',
                  item.highlight &&
                    !isActive &&
                    'text-[#0072BC] font-semibold',
                )}
                onClick={onNavigate}
              >
                <span className="flex-1">{item.label}</span>
                {item.external && (
                  <FaExternalLinkAlt className="text-[10px] opacity-50" />
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MobileMegaMenu({
  url,
  onNavigate,
}: {
  url: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Mobile main">
      <a
        href="/"
        className={clsx(
          'block px-4 py-3 text-sm font-semibold border-b border-base-200',
          (url === '/' || url === '') && 'text-primary',
        )}
        onClick={onNavigate}
      >
        Home
      </a>
      {MENU_GROUPS.map((group) => (
        <MobileAccordionGroup
          key={group.label}
          group={group}
          url={url}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}
