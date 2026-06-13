# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single static-site product: a personal portfolio/blog built with **Astro** (with React islands, Tailwind v4, MDX). There is no backend, database, or required secrets. The Cloudflare adapter (`@astrojs/cloudflare`) is only used for production deploy.

### Toolchain
- Package manager is **Bun** (see `bun.lock` and `mise.toml` pins `bun = "latest"`). The README mentions `npm`, but use Bun.
- Bun is preinstalled in the VM snapshot at `~/.bun/bin/bun` and symlinked to `/usr/local/bin/bun`, so it is on `PATH` for non-interactive shells.

### Commands (run from repo root)
- Install deps: `bun install`
- Dev server: `bun run dev` — serves at `http://localhost:4321/` (note: not port 3000 as the README claims; Astro's default is 4321).
- Type/lint check: `bunx astro check` (uses `@astrojs/check`). Existing tree reports 0 errors / 0 warnings (only a few hints).
- Production build: `bun run build` → outputs `./dist` (also generates Open Graph images via `@resvg/resvg-js`).
- Preview built site: `bun run preview` (requires a prior `bun run build`).

### Notes / gotchas
- `bun run build` logs `(file not created, response body was empty)` for routes that are pure redirects (e.g. `/tools/*`, `/gsoc-2020-appinventor-project-vce`). This is expected — those are configured `redirects` in `astro.config.mjs`, not real pages.
- OG image generation reads font `.woff` files from `node_modules/@fontsource/*`, so a full `bun install` must complete before building.
