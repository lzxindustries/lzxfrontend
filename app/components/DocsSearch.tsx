import {useEffect, useRef, useState, useCallback} from 'react';
import {useNavigate} from '@remix-run/react';

interface PagefindResult {
  url: string;
  excerpt: string;
  meta: {
    title?: string;
    image?: string;
  };
  sub_results?: Array<{
    url: string;
    title: string;
    excerpt: string;
  }>;
}

interface PagefindResponse {
  results: Array<{
    id: string;
    data: () => Promise<PagefindResult>;
  }>;
}

declare global {
  interface Window {
    pagefind?: {
      init: () => Promise<void>;
      search: (query: string) => Promise<PagefindResponse>;
      debouncedSearch: (
        query: string,
        options?: Record<string, unknown>,
        debounceMs?: number,
      ) => Promise<PagefindResponse | null>;
    };
  }
}

export function DocsSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PagefindResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pagefindLoaded, setPagefindLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load pagefind on first focus
  const loadPagefind = useCallback(async () => {
    if (pagefindLoaded || window.pagefind) {
      setPagefindLoaded(true);
      return;
    }
    try {
      // Pagefind generates its assets at /pagefind/pagefind.js
      const pagefindModulePath = '/pagefind/pagefind.js';
      const module = await import(/* @vite-ignore */ pagefindModulePath);
      const pf = ((module as {default?: Window['pagefind']}).default ??
        module) as unknown as Window['pagefind'];
      if (!pf) return;
      window.pagefind = pf;
      await pf.init();
      setPagefindLoaded(true);
    } catch {
      // Pagefind not available (dev mode or not built yet)
      console.warn('Pagefind search index not available');
    }
  }, [pagefindLoaded]);

  // Search handler
  useEffect(() => {
    if (!query || query.length < 2 || !window.pagefind) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    window.pagefind
      .debouncedSearch(query, {}, 300)
      .then(async (response) => {
        if (cancelled || !response) return;
        const items = await Promise.all(
          response.results.slice(0, 8).map((r) => r.data()),
        );
        if (!cancelled) {
          setResults(items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
        loadPagefind();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [loadPagefind]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="search"
          placeholder="Search docs... (⌘K)"
          className="input input-bordered input-sm w-full max-w-xs pl-8"
          value={query}
          onFocus={() => {
            setIsOpen(true);
            loadPagefind();
          }}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search documentation"
        />
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {isOpen && query.length >= 2 && (
        <div className="absolute top-full mt-1 w-96 max-h-96 overflow-y-auto bg-base-100 border border-base-300 rounded-lg shadow-xl z-50">
          {loading && (
            <div className="p-4 text-center text-base-content/50 text-sm">
              Searching...
            </div>
          )}
          {!loading && results.length === 0 && (
            <div className="p-4 text-center text-base-content/50 text-sm">
              No results found
            </div>
          )}
          {results.map((result, i) => (
            <button
              key={i}
              className="block w-full text-left px-4 py-3 hover:bg-base-200 border-b border-base-200 last:border-0 transition-colors"
              onClick={() => {
                navigate(result.url);
                setIsOpen(false);
                setQuery('');
              }}
              type="button"
            >
              <div className="font-medium text-sm">
                {result.meta?.title || result.url}
              </div>
              <div
                className="text-xs text-base-content/60 mt-1 line-clamp-2"
                dangerouslySetInnerHTML={{__html: result.excerpt}}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
