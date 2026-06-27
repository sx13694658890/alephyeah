# Build Configuration

## Overview

The build is configured in two layers:

1. **Base config** — `packages/rsbuild/src/rspack/index.ts` exports a factory function that accepts `IBuildOptions` and returns a Rsbuild config object.
2. **Project config** — `rsbuild.config.ts` calls that factory with project-specific values and merges additional settings via `mergeRsbuildConfig`.

## Base Config (`@init-project/rsbuild`)

Located in `packages/rsbuild/src/rspack/index.ts`, the factory produces:

- **Dev server**: `host: '0.0.0.0'`, configurable `port` (default `3074`), with proxy support
- **Source**: Auto‑imports aliases (`~/` → `./src`, `~~/` → `./`)
- **HTML**: Standard viewport meta (`viewport-fit=cover` for mobile), dynamic title from `appName`
- **Environment variables**: Prefixes `PUBLIC_`, `TANSTACK_`, `CLERK_`, `API_`, `MCP_`, `COMMIT_` are loaded and injected as compile-time defines
- **Performance**: `buildCache: false`, `removeConsole: true`
- **H5 platform** (Vue only): Injects vConsole and WeChat JS-SDK scripts into HTML

## Project Config (`rsbuild.config.ts`)

```typescript
rsConfig({
  framework: 'react',
  plugins: [pluginReact()],
  appName: 'galaxy-react',
  port: 3076,
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
    },
  },
})
```

The proxy rewrites `/api/*` requests to `http://localhost:3000` with `changeOrigin: true`. This is the main integration point with any backend service.

## Customizing the Build

### Adding a new build plugin

```typescript
// rsbuild.config.ts
import { pluginReact } from '@rsbuild/plugin-react';
import somePlugin from 'some-plugin';

rsConfig({
  plugins: [
    pluginReact(),
    somePlugin(),  // add here
  ],
  // ...
})
```

### Changing the dev server port

Edit the `port` field in `rsbuild.config.ts`.

### Adding a new proxy rule

```typescript
proxy: {
  '/api': { target: 'http://localhost:3000' },
  '/ws': { target: 'ws://localhost:3001', ws: true },
}
```

## Environment Variables

The build exposes environment variables with specific prefixes as compile-time globals:

```bash
PUBLIC_API_URL=https://api.example.com
CLERK_PUBLISHABLE_KEY=pk_xxx
```

These become accessible in source code as `process.env.PUBLIC_API_URL` or directly as `PUBLIC_API_URL` depending on usage. No `.env` file is required — any shell environment variable with the configured prefixes is picked up automatically.

## Key Dependencies

| Package | Role |
|---------|------|
| `@rsbuild/core` | Bundler core |
| `@rsbuild/plugin-react` | React JSX transform and Fast Refresh |
| `@tailwindcss/postcss` | Tailwind CSS v4 PostCSS plugin |
| `wrangler` | Cloudflare Pages CLI for deployment |
