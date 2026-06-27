# Repository Guidelines

## Project Structure

```
src/                        # Application source code
├── index.tsx               # Entry point (mounts <App /> to #root)
├── App.tsx                 # Root component
├── env.d.ts                # Global type declarations
├── lib/cn.ts               # cn() utility (clsx + tailwind-merge)
└── styles/index.css        # Global styles (Tailwind v4 import + icon set)

packages/rsbuild/           # Shared build configuration (@init-project/rsbuild)
├── src/config/             # Plugin configs and type definitions
├── src/rspack/index.ts     # Core config factory (defineConfig)
└── src/index.ts            # Package entry

rsbuild.config.ts           # Project-level Rsbuild config (proxy, port, entry)
wrangler.toml               # Cloudflare Pages deployment config
```

Add new pages under `src/pages/`, shared components under `src/components/`, and custom hooks under `src/hooks/` as the app grows. The `packages/rsbuild/` directory is shared across workspaces; modify it with care.

## Build, Test, and Development

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies (uses private registry at `http://139.224.196.240:4873/`) |
| `pnpm dev` | Start dev server at `http://0.0.0.0:3076` with hot reload |
| `pnpm build` | Production build, outputs to `dist/` |
| `pnpm deploy:cloudflare` | Build + deploy to Cloudflare Pages |

The dev server proxies `/api/*` requests to `http://localhost:3000`. Environment variables prefixed with `PUBLIC_`, `TANSTACK_`, `CLERK_`, or `API_` are automatically injected via `loadEnv`.

There are currently **no test, lint, or typecheck commands**. These should be added before significant feature work begins. When introducing tests, prefer **Vitest** as it integrates naturally with Rsbuild's Vite-compatible ecosystem.

## Coding Style & Naming Conventions

- **Language**: TypeScript in strict mode; use `react-jsx` JSX transform.
- **Indentation**: 2 spaces, no tabs.
- **Naming**: PascalCase for components and types; camelCase for functions, variables, hooks, and files.
- **CSS**: Use Tailwind utility classes. For conditional class merging, use the `cn()` helper from `src/lib/cn.ts` (wraps `clsx` + `twMerge`).
- **Icons**: Use the `icon-[svgicon--xxx]` classname pattern (powered by `@iconify/tailwind4` + `@init-project/iconsvg`). New icons must be defined in the `@init-project/iconsvg` package first.
- **Exports**: Prefer named exports over default exports for functions and components.
- **No lint tool is configured yet** — maintain consistency through code review.

## Commit & Pull Request Guidelines

Commit messages follow conventional format:

```
<type>: <short summary>

<optional body>
```

**Types**: `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `perf`.

Current commit history shows messages like: `Initialize project with React, TypeScript, and Tailwind CSS setup.`

Pull requests should include:
- A clear description of what changed and why
- Screenshots or screen recordings for UI changes
- Reference to any related issue (e.g. `Closes #123`)

## Configuration & Environment

- **Private registry**: `.npmrc` points to an internal npm registry. Adding new dependencies requires them to be published there.
- **Tailwind v4 compatibility**: The project uses `@config '../../tailwind.config.js'` in the CSS entry to bridge Tailwind v3-style config with v4. Use `@theme` / `@plugin` / `@config` directives when customizing.
- **H5 platform notes**: The shared build config conditionally injects vConsole and WeChat JS-SDK when `platform === 'h5'`. Check `packages/rsbuild/src/config/config.ts` if mobile-specific behavior is needed.

## Architecture Overview

The app is a single-page React application built with Rsbuild (Rspack-based) and deployed to Cloudflare Pages. The monorepo structure via pnpm workspaces separates app code from shared build tooling (`@init-project/rsbuild`), which also supports Vue targets — React is the current focus. The build pipeline is configured through a layered approach: `@init-project/rsbuild` provides a base config factory, and `rsbuild.config.ts` applies project-specific overrides.
