# Architecture Overview

## Application Layer

The app is a single-page React application (SPA) with a single entry point (`src/index.tsx`) that mounts `<App />` into `#root`. Currently the app is minimal — a single `App.tsx` component with a demo — but the architecture supports natural growth into pages, components, hooks, and API layers.

**Data flow**: Simple component-local state via `useState` and `usehooks-ts` hooks. No global state management is configured yet.

## Build Layer

The build pipeline uses a **layered configuration** approach:

```
@init-project/rsbuild (base config factory)
        │
        ▼
rsbuild.config.ts (project overrides)
        │
        ▼
Rsbuild / Rspack (bundler)
```

- `@init-project/rsbuild` (`packages/rsbuild/`) provides a reusable `defineConfig` factory that configures dev server, proxy, HTML template, aliases, environment variables, and framework-specific plugins.
- `rsbuild.config.ts` merges project-specific settings on top — currently overrides the entry point, port (`3076`), and API proxy.

## Framework Support

The shared `@init-project/rsbuild` package supports both React and Vue:

- **React** (current): Uses `@rsbuild/plugin-react`. React plugins are currently empty (`packages/rsbuild/src/config/react.plugins.ts`).
- **Vue**: Supports both Web (`vue.web.plugins.ts`) and H5/mobile (`vue.h5.plugins.ts`) platforms. The H5 mode injects vConsole and WeChat JS-SDK automatically.

Framework selection is determined by:
1. The `framework` option in `rsbuild.config.ts`
2. Fallback to the `RSBUILD_FRAMEWORK` environment variable

## Monorepo Structure

The pnpm workspace (`pnpm-workspace.yaml`) includes all packages under `packages/`. Currently only `@init-project/rsbuild` lives there, but this structure supports adding shared UI component libraries, type packages, or utility libraries as the project grows.

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Rsbuild over Vite/Webpack | Faster cold start and build via Rspack (Rust); familiar Webpack-compatible API |
| Tailwind v4 over v3 | Native CSS-first configuration, `@import`-based setup, no JIT engine needed |
| Private npm registry | Internal packages (`@init-project/*`) published locally; all dependencies resolved through it |
| Lazy compilation in dev | `lazyCompilation: true` speeds up dev server startup by deferring module compilation |
| No external UI library | Current scope is small; Tailwind utilities cover the styling needs directly |
