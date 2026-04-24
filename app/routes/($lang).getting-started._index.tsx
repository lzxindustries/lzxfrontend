import {useRouteError, isRouteErrorResponse, Link} from '@remix-run/react';
import type {MetaFunction} from '@shopify/remix-oxygen';
import {Section} from '~/components/Text';
import {Breadcrumbs} from '~/components/Breadcrumbs';

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

export const meta: MetaFunction = () => {
  return [
    {title: 'Getting Started | LZX Industries'},
    {
      name: 'description',
      content:
        'Choose your path into video synthesis — learn the fundamentals, set up a modular system, or get started with Videomancer.',
    },
  ];
};

export const PATHS = [
  {
    title: 'Learn Video Synthesis',
    description:
      'Discover what video synthesis is, how it works, and the concepts behind it. Perfect if you are new to the art form.',
    to: '/getting-started/learn',
    icon: '🎓',
    cta: 'Start Learning',
  },
  {
    title: 'Start with Modular',
    description:
      'Set up your first Eurorack video synthesis system — install modules, connect sync, and create your first patch.',
    to: '/getting-started/modular',
    icon: '🔧',
    cta: 'Build Your System',
  },
  {
    title: 'Start with Videomancer',
    description:
      'Unbox, connect, and start using Videomancer — our standalone video effects console. No modular experience needed.',
    to: '/instruments/videomancer/setup',
    icon: '🎛️',
    cta: 'Set Up Videomancer',
  },
];

export default function GettingStarted() {
  return (
    <>
      <Breadcrumbs
        items={[{label: 'Home', to: '/'}, {label: 'Getting Started'}]}
      />
      <div className="px-6 pb-16 md:px-10 lg:px-12 max-w-screen-lg mx-auto">
        <h1 className="text-3xl font-bold mb-2">Getting Started</h1>
        <p className="text-lg opacity-70 mb-4">
          Welcome to LZX Industries. Choose the path that matches where you are
          in your video synthesis journey.
        </p>
        <p className="text-base opacity-60 mb-10">
          A video synthesizer is an electronic instrument which creates or
          processes video images in real time. Whether you are exploring the art
          form for the first time or setting up your next system, we have a
          guide for you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PATHS.map((path) => (
            <Link
              key={path.title}
              to={path.to}
              className="card bg-base-200 hover:bg-base-300 transition-colors p-6 flex flex-col"
            >
              <span className="text-4xl mb-4">{path.icon}</span>
              <h2 className="text-xl font-bold mb-2">{path.title}</h2>
              <p className="text-sm opacity-70 mb-4 flex-1">
                {path.description}
              </p>
              <span className="btn btn-primary btn-sm self-start">
                {path.cta}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
