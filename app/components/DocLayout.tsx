import {Fragment, useRef, useState, type ReactNode} from 'react';
import {Link} from '@remix-run/react';
import {Dialog, Transition} from '@headlessui/react';
import clsx from 'clsx';
import {Breadcrumbs} from './Breadcrumbs';
import {useImageZoom} from '~/hooks/useImageZoom';
import {useMermaid} from '~/hooks/useMermaid';
import type {SidebarItem, TocHeading} from '~/lib/content.server';

// --- Sidebar ---

function Sidebar({
  items,
  currentPath,
  basePath,
  linkBuilder,
}: {
  items: SidebarItem[];
  currentPath: string;
  basePath: string;
  linkBuilder: (item: SidebarItem) => string;
}) {
  return (
    <nav
      className="w-64 shrink-0 hidden lg:block"
      aria-label="Documentation sidebar"
    >
      <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pr-4">
        <SidebarList
          items={items}
          currentPath={currentPath}
          basePath={basePath}
          depth={0}
          linkBuilder={linkBuilder}
        />
      </div>
    </nav>
  );
}

function SidebarList({
  items,
  currentPath,
  basePath,
  depth,
  linkBuilder,
}: {
  items: SidebarItem[];
  currentPath: string;
  basePath: string;
  depth: number;
  linkBuilder: (item: SidebarItem) => string;
}) {
  return (
    <ul className={clsx('space-y-1', depth > 0 && 'ml-3 mt-1')}>
      {items.map((item) => (
        <SidebarEntry
          key={item.path}
          item={item}
          currentPath={currentPath}
          basePath={basePath}
          depth={depth}
          linkBuilder={linkBuilder}
        />
      ))}
    </ul>
  );
}

function SidebarEntry({
  item,
  currentPath,
  basePath,
  depth,
  linkBuilder,
}: {
  item: SidebarItem;
  currentPath: string;
  basePath: string;
  depth: number;
  linkBuilder: (item: SidebarItem) => string;
}) {
  const isActive = currentPath === item.path;
  const hasChildren = item.children && item.children.length > 0;
  const [expanded, setExpanded] = useState(
    hasChildren && currentPath.startsWith(item.path),
  );

  if (hasChildren) {
    return (
      <li>
        <button
          onClick={() => setExpanded(!expanded)}
          className={clsx(
            'w-full text-left text-sm py-1.5 px-2 rounded flex items-center gap-1',
            'hover:bg-base-200 transition-colors',
          )}
        >
          <span
            className={clsx(
              'transition-transform text-xs',
              expanded && 'rotate-90',
            )}
          >
            ▶
          </span>
          <span className="font-medium">{item.label}</span>
        </button>
        {expanded && (
          <SidebarList
            items={item.children!}
            currentPath={currentPath}
            basePath={basePath}
            depth={depth + 1}
            linkBuilder={linkBuilder}
          />
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        to={linkBuilder(item)}
        className={clsx(
          'block text-sm py-1.5 px-2 rounded transition-colors',
          isActive
            ? 'bg-primary/10 text-primary font-medium'
            : 'hover:bg-base-200',
        )}
      >
        {item.label}
      </Link>
    </li>
  );
}

// --- Table of Contents ---

function TableOfContents({headings}: {headings: TocHeading[]}) {
  if (headings.length === 0) return null;

  return (
    <nav
      className="w-56 shrink-0 hidden xl:block"
      aria-label="Table of contents"
    >
      <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto pl-4 border-l border-base-200">
        <p className="text-xs font-bold uppercase tracking-wider mb-3 opacity-60">
          On this page
        </p>
        <ul className="space-y-1.5">
          {headings.map((h) => (
            <li key={h.id} className={clsx(h.depth === 3 && 'ml-3')}>
              <a
                href={`#${h.id}`}
                className="text-sm opacity-70 hover:opacity-100 transition-opacity block py-0.5"
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

// --- Prev/Next Navigation ---

function PrevNextNav({
  prev,
  next,
  linkBuilder,
}: {
  prev: SidebarItem | null;
  next: SidebarItem | null;
  linkBuilder: (item: SidebarItem) => string;
}) {
  if (!prev && !next) return null;

  return (
    <nav className="flex justify-between items-center mt-12 pt-6 border-t border-base-200">
      {prev ? (
        <Link
          to={linkBuilder(prev)}
          className="group flex flex-col items-start"
        >
          <span className="text-xs opacity-50 group-hover:opacity-70">
            ← Previous
          </span>
          <span className="text-sm font-medium text-primary">{prev.label}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link to={linkBuilder(next)} className="group flex flex-col items-end">
          <span className="text-xs opacity-50 group-hover:opacity-70">
            Next →
          </span>
          <span className="text-sm font-medium text-primary">{next.label}</span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}

// --- Mobile sidebar ---

function MobileSidebar({
  items,
  currentPath,
  basePath,
  linkBuilder,
}: {
  items: SidebarItem[];
  currentPath: string;
  basePath: string;
  linkBuilder: (item: SidebarItem) => string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden mb-4 px-6 md:px-10">
      <button
        onClick={() => setOpen(true)}
        className="btn btn-ghost gap-2 min-h-11"
        aria-label="Open documentation menu"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          ☰
        </span>
        <span>Docs menu</span>
      </button>

      <Transition show={open} as={Fragment}>
        <Dialog onClose={() => setOpen(false)} className="relative z-50 lg:hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="ease-in duration-150"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-auto flex h-full w-full max-w-sm flex-col overflow-y-auto bg-base-100 shadow-xl pb-[env(safe-area-inset-bottom,0px)]">
                <div className="flex items-center justify-between border-b border-base-300 px-4 py-3 sticky top-0 bg-base-100">
                  <Dialog.Title className="text-lg font-semibold">
                    Documentation
                  </Dialog.Title>
                  <button
                    type="button"
                    aria-label="Close menu"
                    className="inline-flex items-center justify-center w-11 h-11 text-2xl leading-none"
                    onClick={() => setOpen(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="p-4" onClick={() => setOpen(false)}>
                  <SidebarList
                    items={items}
                    currentPath={currentPath}
                    basePath={basePath}
                    depth={0}
                    linkBuilder={linkBuilder}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

// --- Main DocLayout ---

export interface DocLayoutProps {
  html: string;
  sidebar: SidebarItem[];
  headings: TocHeading[];
  breadcrumbs: {label: string; to?: string}[];
  sectionHeader?: {
    badge: string;
    contextLabel: string;
    description?: string;
    backLink?: {label: string; to: string};
  };
  showBreadcrumbs?: boolean;
  prev: SidebarItem | null;
  next: SidebarItem | null;
  frontmatter: {title?: string; description?: string};
  currentPath: string;
  /** Custom function for building sidebar/nav links. Defaults to `/docs/${item.path}` */
  linkBuilder?: (item: SidebarItem) => string;
  /** Optional content rendered after the markdown article and before prev/next navigation. */
  articleFooter?: ReactNode;
}

export function DocLayout({
  html,
  sidebar,
  headings,
  breadcrumbs,
  sectionHeader,
  showBreadcrumbs = true,
  prev,
  next,
  frontmatter,
  currentPath,
  linkBuilder,
  articleFooter,
}: DocLayoutProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  useImageZoom(contentRef);
  useMermaid(contentRef);

  const buildLink =
    linkBuilder ?? ((item: SidebarItem) => `/docs/${item.path}`);

  return (
    <>
      {showBreadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <MobileSidebar
        items={sidebar}
        currentPath={currentPath}
        basePath="/docs"
        linkBuilder={buildLink}
      />
      <div className="flex gap-8 px-6 pb-16 md:px-10 lg:px-12 max-w-screen-2xl mx-auto">
        <Sidebar
          items={sidebar}
          currentPath={currentPath}
          basePath="/docs"
          linkBuilder={buildLink}
        />
        <article className="flex-1 min-w-0 max-w-prose-wide">
          {sectionHeader && (
            <div className="mb-4 border-b border-base-200 pb-3 md:mb-7 md:pb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-base-content/55 md:text-xs">
                {sectionHeader.badge}
              </p>
              <p className="mt-1 text-sm font-medium text-base-content/80 md:text-base">
                {sectionHeader.contextLabel}
              </p>
              {sectionHeader.description && (
                <p className="mt-1 text-sm text-base-content/65">
                  {sectionHeader.description}
                </p>
              )}
              {sectionHeader.backLink && (
                <Link
                  to={sectionHeader.backLink.to}
                  className="mt-1.5 inline-block text-sm text-primary hover:underline md:mt-2"
                >
                  &larr; Back to {sectionHeader.backLink.label}
                </Link>
              )}
            </div>
          )}
          {frontmatter.title && (
            <h1 className="text-heading font-bold mb-6">{frontmatter.title}</h1>
          )}
          <div
            ref={contentRef}
            className="docs-content prose max-w-none"
            dangerouslySetInnerHTML={{__html: html}}
          />
          {articleFooter}
          <PrevNextNav prev={prev} next={next} linkBuilder={buildLink} />
        </article>
        <TableOfContents headings={headings} />
      </div>
    </>
  );
}
