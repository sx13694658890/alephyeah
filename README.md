# alephyeah

A React 19 + TypeScript application built with Rsbuild, styled with Tailwind CSS v4, and deployed to Cloudflare Pages.

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 10 (current: pnpm@10.20.0)

## Quick Start

```bash
pnpm install
pnpm dev
```

The dev server starts at `http://0.0.0.0:3076` with hot reload. All `/api/*` requests are proxied to `http://localhost:3000`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies (uses the private registry configured in `.npmrc`) |
| `pnpm dev` | Start development server with hot module replacement |
| `pnpm build` | Production build, outputs static files to `dist/` |
| `pnpm deploy:cloudflare` | Run `build` then deploy `dist/` to Cloudflare Pages |

## Project Structure

```
src/                          # Application source code
├── index.tsx                 # Entry point
├── App.tsx                   # Root component
├── env.d.ts                  # Type declarations
├── lib/
│   └── cn.ts                 # CSS class merge utility (clsx + tailwind-merge)
└── styles/
    └── index.css             # Global styles — imports Tailwind and registers icon sets

packages/rsbuild/             # Shared build configuration (@init-project/rsbuild)
├── src/config/               # Plugin configurations and type definitions
├── src/rspack/index.ts       # Core config factory
└── src/index.ts              # Package entry

rsbuild.config.ts             # Project-level Rsbuild configuration (port, proxy, entry)
wrangler.toml                 # Cloudflare Pages deployment configuration
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 |
| **Language** | TypeScript (strict mode) |
| **Bundler** | Rsbuild 2.x (Rspack-based) |
| **Styling** | Tailwind CSS v4 + PostCSS |
| **Icons** | @init-project/iconsvg + @iconify/tailwind4 |
| **Package Manager** | pnpm (workspace monorepo) |
| **Deployment** | Cloudflare Pages |

## Styling & Icons

This project uses Tailwind CSS v4 utility classes for styling. The import order in `src/styles/index.css` is:

```css
@import 'tailwindcss';
@config '../../tailwind.config.js';
```

Icons use the `icon-[svgicon--xxx]` classname pattern:

```tsx
<span className="icon-[svgicon--one] inline-block h-4 w-4" />
```

Use the `cn()` utility from `src/lib/cn.ts` to merge Tailwind classes conditionally:

```tsx
<div className={cn('base-class', isActive && 'text-red-500')} />
```

## Environment Variables

Variables with the following prefixes are automatically injected at build time:

- `PUBLIC_`
- `TANSTACK_`
- `CLERK_`
- `API_`
- `MCP_`
- `COMMIT_`

## Developer Guidelines

See [AGENTS.md](./AGENTS.md) for detailed contributor conventions including coding style, commit message format, and architecture notes.
