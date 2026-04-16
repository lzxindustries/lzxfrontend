/// <reference types="vite/client" />
/// <reference types="@shopify/remix-oxygen" />
/// <reference types="@shopify/oxygen-workers-types" />

import type { WithCache } from '@shopify/hydrogen';
import type { Storefront } from '~/lib/type';
import type { AppSession } from '~/lib/session.server';

declare global {
  /**
   * A global `process` object is only available during build to access NODE_ENV.
   */
  const process: {env: {NODE_ENV: 'production' | 'development'}};

  /**
   * Declare expected Env parameter in fetch handler.
   */
  interface Env {
    SESSION_SECRET: string;
    PUBLIC_STOREFRONT_API_TOKEN: string;
    PRIVATE_STOREFRONT_API_TOKEN: string;
    PUBLIC_STOREFRONT_API_VERSION: string;
    PUBLIC_STORE_DOMAIN: string;
    PUBLIC_STOREFRONT_ID: string;
    SHOPIFY_ADMIN_API_TOKEN: string;
  }

  interface FbqStandard {
    (
      method: 'track',
      event:
        | 'PageView'
        | 'ViewContent'
        | 'AddToCart'
        | 'InitiateCheckout'
        | 'Purchase'
        | 'Search'
        | 'AddPaymentInfo',
      params?: Record<string, unknown>,
    ): void;
    (method: 'init', pixelId: string): void;
  }

  interface Window {
    fbq?: FbqStandard;
  }
}

/**
 * Declare local additions to `AppLoadContext` to include the session utilities we injected in `server.ts`.
 */
declare module '@shopify/remix-oxygen' {
  export interface AppLoadContext {
    waitUntil: ExecutionContext['waitUntil'];
    session: AppSession;
    storefront: Storefront;
    env: Env;
  }

  declare module '*.md' {
    const value: string; // markdown is just a string
    export default value;
  }
}

// Needed to make this file a module.
export { };
