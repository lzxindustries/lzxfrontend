import {Outlet} from '@remix-run/react';

/**
 * Optional locale layout only — invalid locale validation lives in
 * `($lang)._index.tsx` so paths like `/docs/...` are not mistaken for
 * `/:lang/docs/...` with `lang="docs"`.
 */
export default function OptionalLocaleLayout() {
  return <Outlet />;
}
