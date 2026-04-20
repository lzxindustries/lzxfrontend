import {Outlet, useRouteError, isRouteErrorResponse} from '@remix-run/react';
import {Section} from '~/components/Text';

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.data}`
    : error instanceof Error
    ? error.message
    : 'Unknown error';
  return (
    <Section>
      <h1 className="text-xl font-bold">Error loading page</h1>
      <p>{message}</p>
    </Section>
  );
}

export default function GettingStartedLayout() {
  return <Outlet />;
}
