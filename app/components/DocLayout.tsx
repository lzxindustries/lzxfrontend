import {useRef, useState} from 'react';
import {Link} from '@remix-run/react';
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
}: {
  items: SidebarItem[];
  currentPath: string;
  basePath: string;
}) {
  return (
    <nav className="w-64 shrink-0 hidden lg:block" aria-label="Documentation sidebar">
      <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-4">
        <SidebarList items={items} currentPath={currentPath} basePath={basePath} depth={0} />
      </div>
    </nav>
  );
}

function SidebarList({
  items,
  currentPath,
  basePath,
  depth,
}: {
  items: SidebarItem[];
  currentPath: string;
  basePath: string;
  depth: number;
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
}: {
  item: SidebarItem;
  currentPath: string;
  basePath: string;
  depth: number;
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
          <span className={clsx('transition-transform text-xs', expanded && 'rotate-90')}>▶</span>
          <span className="font-medium">{item.label}</span>
        </button>
        {expanded && (
          <SidebarList
            items={item.children!}
            currentPath={currentPath}
            basePath={basePath}
            depth={depth + 1}
          />
        )}
      </li>
    );
  }

  return (
    <li>
      <Link
        to={`/docs/${item.path}`}
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
    <nav className="w-56 shrink-0 hidden xl:block" aria-label="Table of contents">
      <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pl-4 border-l border-base-200">
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
}: {
  prev: SidebarItem | null;
  next: SidebarItem | null;
}) {
  if (!prev && !next) return null;

  return (
    <nav className="flex justify-between items-center mt-12 pt-6 border-t border-base-200">
      {prev ? (
        <Link
          to={`/docs/${prev.path}`}
          className="group flex flex-col items-start"
        >
          <span className="text-xs opacity-50 group-hover:opacity-70">← Previous</span>
          <span className="text-sm font-medium text-primary">{prev.label}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          to={`/docs/${next.path}`}
          className="group flex flex-col items-end"
        >
          <span className="text-xs opacity-50 group-hover:opacity-70">Next →</span>
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
}: {
  items: SidebarItem[];
  currentPath: string;
  basePath: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-sm btn-ghost gap-2"
      >
        <span className="text-xs">☰</span>
        <span>Menu</span>
      </button>
      {open && (
        <div className="mt-2 p-4 bg-base-200 rounded-lg">
          <SidebarList items={items} currentPath={currentPath} basePath={basePath} depth={0} />
        </div>
      )}
    </div>
  );
}

// --- Main DocLayout ---

export interface DocLayoutProps {
  html: string;
  sidebar: SidebarItem[];
  headings: TocHeading[];
  breadcrumbs: {label: string; to?: string}[];
  prev: SidebarItem | null;
  next: SidebarItem | null;
  frontmatter: {title?: string; description?: string};
  currentPath: string;
}

export function DocLayout({
  html,
  sidebar,
  headings,
  breadcrumbs,
  prev,
  next,
  frontmatter,
  currentPath,
}: DocLayoutProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  useImageZoom(contentRef);
  useMermaid(contentRef);

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <MobileSidebar items={sidebar} currentPath={currentPath} basePath="/docs" />
      <div className="flex gap-8 px-6 pb-16 md:px-10 lg:px-12 max-w-screen-2xl mx-auto">
        <Sidebar items={sidebar} currentPath={currentPath} basePath="/docs" />
        <article className="flex-1 min-w-0 max-w-prose-wide">
          {frontmatter.title && (
            <h1 className="text-heading font-bold mb-6">{frontmatter.title}</h1>
          )}
          <div
            ref={contentRef}
            className="docs-content prose max-w-none"
            dangerouslySetInnerHTML={{__html: html}}
          />
          <PrevNextNav prev={prev} next={next} />
        </article>
        <TableOfContents headings={headings} />
      </div>
    </>
  );
}
