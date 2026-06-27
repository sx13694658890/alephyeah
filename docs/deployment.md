# Deployment

The project is deployed to **Cloudflare Pages**.

## Deploy Command

```bash
pnpm deploy:cloudflare
```

This runs two steps:

1. `rsbuild build` — produces a production build in `dist/`
2. `wrangler pages deploy dist --project-name alephyeah` — uploads `dist/` to Cloudflare Pages

## Configuration

Deployment settings are in `wrangler.toml`:

```toml
name = "alephyeah"
compatibility_date = "2026-06-23"
pages_build_output_dir = "dist"
```

- `pages_build_output_dir` must match the output directory from `rsbuild build`.
- `compatibility_date` should be updated to the current date when deploying with newer Workers features.

## Manual Deployment

For full control, run the steps separately:

```bash
pnpm build
npx wrangler pages deploy dist --project-name alephyeah
```

## Preview Deployments

Cloudflare Pages automatically creates preview deployments for branches (when connected via Git). To deploy a preview manually:

```bash
npx wrangler pages deploy dist --project-name alephyeah --branch <branch-name>
```

## Environment Variables in Production

For production environment variables (API keys, etc.), set them in the Cloudflare Pages dashboard under:

**Workers & Pages > alephyeah > Settings > Environment variables**

Variables set there are injected at deploy time and are not client-accessible unless prefixed with `NEXT_PUBLIC_` or a similar convention — note that this project uses `PUBLIC_` / `API_` / `CLERK_` prefixes via the Rsbuild `loadEnv` mechanism, so the variable prefix convention must match between the dashboard and `rsbuild.config.ts`.

## Build Output

The production build produces a static site in `dist/`. Key output files:

```
dist/
├── static/          # Hashed JS and CSS bundles
├── index.html       # Entry HTML
└── ...              # Other static assets
```
