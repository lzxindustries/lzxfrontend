# LZX Frontend

## Development

### Requirements

- Node >=18.19 (https://nodejs.org)
- Yarn 4.5.3 (https://yarnpkg.com/)

### Getting Started

Set required environment variables:

- `SESSION_SECRET`
- `PUBLIC_STOREFRONT_API_TOKEN`
- `PRIVATE_STOREFRONT_API_TOKEN`
- `PUBLIC_STORE_DOMAIN`
- `PUBLIC_STOREFRONT_ID`

Optional environment variables:

- `KLAVIYO_PRIVATE_API_KEY` (enables back-in-stock Notify Me submissions)

Install dependencies:

```
yarn install
```

Run development server:

```
yarn run dev
```

Run development server on local network:

```
yarn run dev --host
```

Build and run preview server:

```
yarn run preview
```
