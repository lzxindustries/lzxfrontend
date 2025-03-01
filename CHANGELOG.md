# demo-store

## 0.2.1

### Patch Changes

- Updated dependencies [[`2039a4a`](https://github.com/Shopify/hydrogen/commit/2039a4a534cf75ebcf39bab6d2f95a535bb5d390), [`82b6af7`](https://github.com/Shopify/hydrogen/commit/82b6af71cafe1f88c24630178e61cd09e5a59f5e), [`361879e`](https://github.com/Shopify/hydrogen/commit/361879ee11dfe8f1ee916b022165b1e7f0e45964)]:
  - @shopify/cli-hydrogen@4.1.1
  - @shopify/hydrogen@2023.4.0

## 0.2.0

### Minor Changes

- Fix scroll issues on Product Detail Page for small screens ([#782](https://github.com/Shopify/hydrogen/pull/782)) by [@lifeiscontent](https://github.com/lifeiscontent)

- Fix Layout title on mobile when title is long ([#781](https://github.com/Shopify/hydrogen/pull/781)) by [@lifeiscontent](https://github.com/lifeiscontent)

### Patch Changes

- Adopt Remix [`v2_meta`](https://remix.run/docs/en/main/route/meta#metav2) future flag ([#738](https://github.com/Shopify/hydrogen/pull/738)) by [@wizardlyhel](https://github.com/wizardlyhel)

  ### `v2_meta` migration steps

  1. For any routes that you used `meta` route export, convert it to the `MetaFunction` equivalent. Notice that the package name in the import statement has also changed to `'@remix-run/react'`:

     ```diff
     - import {type MetaFunction} from '@shopify/remix-oxygen';
     + import {type MetaFunction} from '@remix-run/react';

     - export const meta: MetaFunction = () => {
     + export const meta: MetaFunction = () => {
     -   return {title: 'Login'};
     +   return [{title: 'Login'}];
       };
     ```

  2. If you are using data from loaders, pass the loader type to the `MetaFunction` generic:

     ```diff
     - export const meta: MetaFunction = ({data}) => {
     + export const meta: MetaFunction<typeof loader> = ({data}) => {
     -   return {title: `Order ${data?.order?.name}`};
     +   return [{title: `Order ${data?.order?.name}`}];
       };
     ```

  3. If you are using `meta` route export in `root`, convert it to [Global Meta](https://remix.run/docs/en/main/route/meta#global-meta)

     ```diff
     // app/root.tsx

     - export const meta: MetaFunction = () => ({
     -   charset: 'utf-8',
     -   viewport: 'width=device-width,initial-scale=1',
     - });

     export default function App() {

       return (
         <html lang={locale.language}>
           <head>
     +       <meta charSet="utf-8" />
     +       <meta name="viewport" content="width=device-width,initial-scale=1" />
             <Seo />
             <Meta />
     ```

- Adopt `v2_routeConvention` future flag ([#747](https://github.com/Shopify/hydrogen/pull/747)) by [@wizardlyhel](https://github.com/wizardlyhel)

  ## `v2_routeConventions` migration steps

  Remix v2 route conventions are just file renames. We just need to ensure when changing file name and file location, the import paths of other files are also updated.

  Go to Remix docs for more details on the [V2 route convention](https://remix.run/docs/en/main/file-conventions/route-files-v2).

  Rename and move the following files in the `routes` folder to adopt to V2 route convention.

  <table>
  <tr>
  <th>Before</th>
  <th>After (V2 route convention)</th>
  </tr>
  <tr>
  <td>

  ```txt
  app/routes/
    ├─ [sitemap.xml].tsx
    ├─ [robots.txt].tsx
    └─ ($lang)/
        ├─ $shopid/orders/$token/
        │   └─ authenticate.tsx
        ├─ account/
        │   ├─ __private/
        │   │   ├─ address/
        │   │   │   └─ $id.tsx
        │   │   ├─ orders.$id.tsx
        │   │   ├─ edit.tsx
        │   │   └─ logout.ts
        │   └─ __public/
        │       ├─ recover.tsx
        │       ├─ login.tsx
        │       ├─ register.tsx
        │       ├─ activate.$id.$activationToken.tsx
        │       └─ reset.$id.$resetToken.tsx
        ├─ api/
        │   ├─ countries.tsx
        │   └─ products.tsx
        ├─ collections/
        │   ├─ index.tsx
        │   ├─ $collectionHandle.tsx
        │   └─ all.tsx
        ├─ journal/
        │   ├─ index.tsx
        │   └─ $journalHandle.tsx
        ├─ pages
        │   └─ $pageHandle.tsx
        ├─ policies/
        │   ├─ index.tsx
        │   └─ $policyHandle.tsx
        ├─ products/
        │   ├─ index.tsx
        │   └─ $productHandle.tsx
        ├─ $.tsx
        ├─ account.tsx
        ├─ cart.tsx
        ├─ cart.$lines.tsx
        ├─ discount.$code.tsx
        ├─ featured-products.tsx
        ├─ index.tsx
        └─ search.tsx
  ```

  </td>
  <td valign="top">

  ```txt
  app/routes/
    ├─ [sitemap.xml].tsx
    ├─ [robots.txt].tsx
    ├─ ($lang).$shopid.orders.$token.authenticate.tsx
    ├─ ($lang).account.address.$id.tsx
    ├─ ($lang).account.orders.$id.tsx
    ├─ ($lang).account.edit.tsx
    ├─ ($lang).account.logout.ts
    ├─ ($lang).account.recover.tsx
    ├─ ($lang).account.login.tsx
    ├─ ($lang).account.register.tsx
    ├─ ($lang).account.activate.$id.$activationToken.tsx
    ├─ ($lang).account.reset.$id.$resetToken.tsx
    ├─ ($lang).api.countries.tsx
    ├─ ($lang).api.products.tsx
    ├─ ($lang).collections._index.tsx
    ├─ ($lang).collections.$collectionHandle.tsx
    ├─ ($lang).collections.all.tsx
    ├─ ($lang).journal._index.tsx
    ├─ ($lang).journal.$journalHandle.tsx
    ├─ ($lang).pages.$pageHandle.tsx
    ├─ ($lang).policies._index.tsx
    ├─ ($lang).policies.$policyHandle.tsx
    ├─ ($lang).products._index.tsx
    ├─ ($lang).products.$productHandle.tsx
    ├─ $.tsx
    ├─ ($lang)._index.tsx
    ├─ ($lang).account.tsx
    ├─ ($lang).cart.tsx
    ├─ ($lang).cart.$lines.tsx
    ├─ ($lang).discount.$code.tsx
    ├─ ($lang).featured-products.tsx
    └─ ($lang).search.tsx
  ```

  </td>
  </tr>
  </table>

  ### Optional

  If you want to continue using nested folder routes but have the `v2_routeConvention` flag turned on, you may consider using the npm package [`@remix-run/v1-route-convention`](https://www.npmjs.com/package/@remix-run/v1-route-convention).

  If you like the flat route convention but still wants a hybrid style of nested route folder, you may consider using the npm package [`remix-flat-routes`](https://www.npmjs.com/package/remix-flat-routes)

- Adopt Remix [`unstable_tailwind`](https://remix.run/docs/en/1.15.0/guides/styling#built-in-tailwind-support) and [`unstable_postcss`](https://remix.run/docs/en/1.15.0/guides/styling#built-in-postcss-support) future flags for the Demo Store template. ([#751](https://github.com/Shopify/hydrogen/pull/751)) by [@frandiox](https://github.com/frandiox)

  ### `unstable_tailwind` and `unstable_postcss` migration steps

  1. Move the file `<root>/styles/app.css` to `<root>/app/styles/app.css`, and remove it from `.gitignore`.

  2. Add `"browserslist": ["defaults"]` to your `package.json`, or your preferred [value from Browserslist](https://browsersl.ist/).

  3. Replace the `build` and `dev` scripts in your `package.json` with the following:

     **Before**

     ```json
      "scripts": {
        "build": "npm run build:css && shopify hydrogen build",
        "build:css": "postcss styles --base styles --dir app/styles --env production",
        "dev": "npm run build:css && concurrently -g --kill-others-on-fail -r npm:dev:css \"shopify hydrogen dev\"",
        "dev:css": "postcss styles --base styles --dir app/styles -w",
        ...
      }
     ```

     **After**

     ```json
      "scripts": {
        "dev": "shopify hydrogen dev",
        "build": "shopify hydrogen build",
        ...
      }
     ```

  You can also remove dependencies like `concurrently` if you don't use them anywhere else.

- Forwards search params of `/discount/<code>` route to a redirect route. ([#766](https://github.com/Shopify/hydrogen/pull/766)) by [@lneicelis](https://github.com/lneicelis)

- Carts created in liquid will soon be compatible with the Storefront API and vice versa, making it possible to share carts between channels. ([#721](https://github.com/Shopify/hydrogen/pull/721)) by [@scottdixon](https://github.com/scottdixon)

  This change updates the Demo Store to use Online Store's `cart` cookie (instead of sessions) which prevents customers from losing carts when merchants migrate to/from Hydrogen.

- Bump internal Remix dependencies to 1.15.0. ([#728](https://github.com/Shopify/hydrogen/pull/728)) by [@wizardlyhel](https://github.com/wizardlyhel)

  Recommendations to follow:

  - Upgrade all the Remix packages in your app to 1.15.0.
  - Enable Remix v2 future flags at your earliest convenience following [the official guide](https://remix.run/docs/en/1.15.0/pages/v2).

- Updated CLI prompts. It's recommended to update your version of `@shopify/cli` to `3.45.0` when updating `@shopify/cli-hydrogen`. ([#733](https://github.com/Shopify/hydrogen/pull/733)) by [@frandiox](https://github.com/frandiox)

  ```diff
  "dependencies": {
  -  "@shopify/cli": "3.x.x",
  +  "@shopify/cli": "3.45.0",
  }
  ```

- Adopt Remix [`v2_errorBoundary`](https://remix.run/docs/en/release-next/route/error-boundary-v2) future flag ([#729](https://github.com/Shopify/hydrogen/pull/729)) by [@wizardlyhel](https://github.com/wizardlyhel)

  ### `v2_errorBoundary` migration steps

  1. Remove all `CatchBoundary` route exports

  2. Handle route level errors with `ErrorBoundary`

     Before:

     ```jsx
     // app/root.tsx
     export function ErrorBoundary({error}: {error: Error}) {
       const [root] = useMatches();
       const locale = root?.data?.selectedLocale ?? DEFAULT_LOCALE;

       return (
         <html lang={locale.language}>
           <head>
             <title>Error</title>
             <Meta />
             <Links />
           </head>
           <body>
             <Layout layout={root?.data?.layout}>
               <GenericError error={error} />
             </Layout>
             <Scripts />
           </body>
         </html>
       );
     }
     ```

     After:

     ```jsx
     // app/root.tsx
     import {isRouteErrorResponse, useRouteError} from '@remix-run/react';

     export function ErrorBoundary({error}: {error: Error}) {
       const [root] = useMatches();
       const locale = root?.data?.selectedLocale ?? DEFAULT_LOCALE;
       const routeError = useRouteError();
       const isRouteError = isRouteErrorResponse(routeError);

       let title = 'Error';
       let pageType = 'page';

       // We have an route error
       if (isRouteError) {
         title = 'Not found';

         // We have a page not found error
         if (routeError.status === 404) {
           pageType = routeError.data || pageType;
         }
       }

       return (
         <html lang={locale.language}>
           <head>
             <title>{title}</title>
             <Meta />
             <Links />
           </head>
           <body>
             <Layout
               layout={root?.data?.layout}
               key={`${locale.language}-${locale.country}`}
             >
               {isRouteError ? (
                 <>
                   {routeError.status === 404 ? (
                     <NotFound type={pageType} />
                   ) : (
                     <GenericError
                       error={{
                         message: `${routeError.status} ${routeError.data}`,
                       }}
                     />
                   )}
                 </>
               ) : (
                 <GenericError
                   error={error instanceof Error ? error : undefined}
                 />
               )}
             </Layout>
             <Scripts />
           </body>
         </html>
       );
     }
     ```

- Updated dependencies [[`e6e6c2d`](https://github.com/Shopify/hydrogen/commit/e6e6c2da274d0582c6b3b9f298dfd2e86dd4bfbe), [`475a39c`](https://github.com/Shopify/hydrogen/commit/475a39c867b0851bba0358b6db9208b664aec68c), [`1f8526c`](https://github.com/Shopify/hydrogen/commit/1f8526c750dc1d5aa7ea02e196fffdd14d17a536), [`0f4d562`](https://github.com/Shopify/hydrogen/commit/0f4d562a2129e8e03ed123dc572a14a72e487a1b), [`737f83e`](https://github.com/Shopify/hydrogen/commit/737f83ebb72fccc2f367532ebaa19ea00b1b3436), [`2d4c5d9`](https://github.com/Shopify/hydrogen/commit/2d4c5d9340c5a2458c682aa3f9b12352dacdd759), [`68a6028`](https://github.com/Shopify/hydrogen/commit/68a60285a3d563d6e98fb79c3ba6d98eb4ee6be0)]:
  - @shopify/cli-hydrogen@4.1.0
  - @shopify/hydrogen@2023.1.7
  - @shopify/remix-oxygen@1.0.5
