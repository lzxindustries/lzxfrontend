import {vitePlugin as remix} from '@remix-run/dev';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    hydrogen(),
    oxygen(),
    remix({
      presets: [hydrogen.preset()],
      ignoredRouteFiles: ['**/.*'],
      future: {
        v3_fetcherPersist: false,
        v3_lazyRouteDiscovery: false,
        v3_relativeSplatPath: false,
        v3_singleFetch: false,
        v3_throwAbortReason: false,
      },
    }),
    tsconfigPaths(),
  ],
  build: {
    // Allow a strict Content-Security-Policy
    // withtout inlining assets as base64:
    assetsInlineLimit: 0,
    // Mermaid is already lazy-loaded into its own chunk; use a threshold that
    // reflects that intentionally large vendor bundle.
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === 'EVAL' &&
          warning.id?.includes('/node_modules/gray-matter/lib/engines.js')
        ) {
          return;
        }

        warn(warning);
      },
    },
  },
  ssr: {
    optimizeDeps: {
      /**
       * Include dependencies here if they throw CJS<>ESM errors.
       * For example, for the following error:
       *
       * > ReferenceError: module is not defined
       * >   at /Users/.../node_modules/example-dep/index.js:1:1
       *
       * Include 'example-dep' in the array below.
       * @see https://vitejs.dev/config/dep-optimization-options
       */
      include: [
        'debug',
        'extend',
        '@remix-run/dev/server-build',
        'ts-easing',
        'fast-shallow-equal',
        'screenfull',
        'nano-css/addon/vcssom/cssToTree',
        'nano-css/addon/vcssom',
        'nano-css/addon/cssom',
        'nano-css',
        'copy-to-clipboard',
        'js-cookie',
        'fast-deep-equal/react',
        'jsonp',
        'prop-types',
        'typographic-base',
        'react-universal-interface',
        'gray-matter',
        'highlight.js',
        'highlight.js/lib/core',
        'lowlight',
      ],
    },
  },
});
