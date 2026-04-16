import {Link} from '@remix-run/react';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumbs({items}: {items: BreadcrumbItem[]}) {
  return (
    <nav aria-label="Breadcrumb" className="px-6 py-3 text-sm md:px-10 lg:px-12">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1">
            {i > 0 && <span className="opacity-40">/</span>}
            {item.to ? (
              <Link to={item.to} className="link link-hover opacity-70">
                {item.label}
              </Link>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
