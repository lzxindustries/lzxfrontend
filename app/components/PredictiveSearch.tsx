import {useFetcher, useNavigate} from '@remix-run/react';
import {Image, Money} from '@shopify/hydrogen';
import type {CurrencyCode} from '@shopify/hydrogen/storefront-api-types';
import {useEffect, useRef, useState} from 'react';

interface PredictiveProduct {
  id: string;
  title: string;
  handle: string;
  featuredImage?: {url: string; altText?: string; width?: number; height?: number};
  variants: {nodes: Array<{price: {amount: string; currencyCode: CurrencyCode}}>};
}

interface PredictiveCollection {
  id: string;
  title: string;
  handle: string;
  image?: {url: string; altText?: string; width?: number; height?: number};
}

interface PredictiveResults {
  products: PredictiveProduct[];
  collections: PredictiveCollection[];
  pages: Array<{id: string; title: string; handle: string}>;
  articles: Array<{id: string; title: string; handle: string; blog: {handle: string}}>;
}

export function PredictiveSearch({onClose}: {onClose?: () => void}) {
  const fetcher = useFetcher<PredictiveResults>();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      fetcher.load(`/api/predictive-search?q=${encodeURIComponent(query)}`);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const results = fetcher.data;
  const hasResults =
    results &&
    (results.products.length > 0 ||
      results.collections.length > 0 ||
      results.pages.length > 0 ||
      results.articles.length > 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose?.();
    }
  }

  function handleSelect(path: string) {
    navigate(path);
    onClose?.();
  }

  return (
    <div ref={containerRef} className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, collections..."
          className="input input-bordered w-full pr-10"
          aria-label="Search"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm"
        >
          Go
        </button>
      </form>

      {query.length >= 2 && hasResults && (
        <div className="mt-1 bg-base-100 border border-base-300 rounded-lg shadow-xl max-h-[70vh] overflow-y-auto">
          {results.products.length > 0 && (
            <div className="p-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-2">
                Products
              </h3>
              <ul className="space-y-2">
                {results.products.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(`/products/${product.handle}`)}
                      className="flex items-center gap-3 w-full text-left p-2 rounded hover:bg-base-200 transition"
                    >
                      {product.featuredImage && (
                        <Image
                          data={product.featuredImage}
                          width={40}
                          height={40}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {product.title}
                        </p>
                        {product.variants.nodes[0]?.price && (
                          <Money
                            data={product.variants.nodes[0].price}
                            className="text-xs text-base-content/60"
                          />
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.collections.length > 0 && (
            <div className="p-3 border-t border-base-300">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-2">
                Collections
              </h3>
              <ul className="space-y-1">
                {results.collections.map((collection) => (
                  <li key={collection.id}>
                    <button
                      type="button"
                      onClick={() =>
                        handleSelect(`/collections/${collection.handle}`)
                      }
                      className="flex items-center gap-3 w-full text-left p-2 rounded hover:bg-base-200 transition"
                    >
                      {collection.image && (
                        <Image
                          data={collection.image}
                          width={40}
                          height={40}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <p className="text-sm truncate">{collection.title}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.articles.length > 0 && (
            <div className="p-3 border-t border-base-300">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-2">
                Articles
              </h3>
              <ul className="space-y-1">
                {results.articles.map((article) => (
                  <li key={article.id}>
                    <button
                      type="button"
                      onClick={() =>
                        handleSelect(
                          `/journal/${article.handle}`,
                        )
                      }
                      className="text-sm p-2 rounded hover:bg-base-200 transition w-full text-left truncate"
                    >
                      {article.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-3 border-t border-base-300">
            <button
              type="button"
              onClick={() => handleSubmit({preventDefault: () => {}} as React.FormEvent)}
              className="text-sm text-primary hover:underline w-full text-center"
            >
              View all results for &ldquo;{query}&rdquo;
            </button>
          </div>
        </div>
      )}

      {query.length >= 2 && results && !hasResults && (
        <div className="mt-1 bg-base-100 border border-base-300 rounded-lg shadow-xl p-4 text-center text-sm text-base-content/50">
          No results for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
