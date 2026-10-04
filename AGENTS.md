<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# owambe.

A native-wear store you can touch, built in public by Martin Ifeanyi ([martinelmars.com](https://www.martinelmars.com), GitHub `elmarshub`). Launch 1 of a "short beautiful projects" series. Live at **https://owambe.martinelmars.com**.

It sells finished, sewn pieces (agbada, kaftan, buba and sokoto, iro and buba), never fabric by the yard. Pieces hang on a brass rail and swing like real clothes: flip one to see its back, spin it on the hook, try it on a dress-form dummy with fit advice for your build and height. Drop 01 is a concept store: example prices, Paystack **test mode** only.

## Design rules

- White page `#FFFFFF`, ink `#151514`, brass `#B8954A`. Bricolage Grotesque (display) and Manrope (body), self-hosted with `@fontsource`.
- Inspired by the feel of BOLAPSD's "The Rail" but must not look copied: our own rail, hangers, price tags, swatches, copy and layout.
- Garments are our own SVG drawings (`src/lib/garments.ts`). No product photos from other stores.
- Sign-in is asked for only at checkout. Browsing and the fitting room are open to everyone.
- Copy is short, plain and warm ("Ready for the party.", "It's yours.").
- Works from 360px phones to wide desktops. Below 900px the fitting room stacks under the rail (`src/lib/layout.ts`); below 760px the header and checkout sheet switch to their phone layouts.

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 16 (App Router, `src/`), React 19, TypeScript, pnpm |
| Styling | One global stylesheet with tokens on `:root` (`src/app/globals.css`) |
| State | Zustand: `useShop` (rail, fitting room), `useBag` (persisted, cleaned on load), `useUi` (overlays, signed-in user) |
| Auth | Supabase Auth, 6-digit email code (custom SMTP through Resend) or Google, via `@supabase/ssr` cookies |
| Data | Postgres on Supabase through Prisma 7 (`@prisma/adapter-pg`): `orders` and `order_items` |
| Payments | Paystack: server initialises → inline popup → server verifies → signed webhook as backup |
| Tests | Vitest (`tests/unit`), Playwright (`tests/e2e`, demo mode on port 3100) |
| Hosting | Netlify (Next.js Runtime; `proxy.ts` runs as an edge function), `main` deploys to production. DNS for martinelmars.com is on Cloudflare |

## Layout

```
src/
  app/                  routes only: page, pieces/[id], orders, api/*, auth/callback, metadata files
  components/           by feature: store, rail, fitting-room, bag, checkout (+ steps/), orders, ui
  lib/                  shared by server and browser: catalog, fit, garments, orders (zod + pricing),
                        redirect, config, layout, site
    server/             server-only: db (Prisma), orders, paystack, supabase, piece-image (OG images)
    client/             browser-only: auth, payment, supabase
  hooks/  store/  types/
  generated/prisma/     generated client (git-ignored; pnpm install / pnpm build regenerate it)
  proxy.ts              Next 16 "proxy" (was middleware): keeps the Supabase session fresh
prisma/                 schema.prisma, migrations/ (the first adds check constraints and RLS by hand)
```

## Conventions

- Import with the `@/` alias. Server-only code imports `server-only` and lives in `lib/server/`.
- No comments in components. Elsewhere, comment only what the code can't say.
- Don't set `style` or `data-show` on `.piece` from JSX: the rail's `requestAnimationFrame` loop owns them.
- The stage is its own stacking context (`isolation: isolate`), so pieces never draw over the bag, sheet or toast.
- Commits: plain messages, no AI co-author trailers. Work on `dev`, open PRs into `main`.

## Money and security

- The browser sends piece ids, sizes, quantities, add-on flags and delivery details only. The server re-prices from `src/lib/catalog.ts` (`unitPrice`, including the fila or gele).
- Amounts are whole naira; Paystack gets kobo (×100) in `lib/server/paystack.ts`.
- An order is paid only after the server's verify call matches status, currency and amount (`settleOrder`). The webhook checks `x-paystack-signature` (HMAC-SHA512) first.
- `orders` and `order_items` have RLS on with no policies, so Supabase's REST API can't reach them; the app goes through Prisma.
- `DATABASE_URL`, `DIRECT_URL` and `PAYSTACK_SECRET_KEY` are server-only: never `NEXT_PUBLIC_`, never logged.

## Demo mode

`src/lib/config.ts` decides from env vars. No Supabase keys: any 6-digit code except `000000` signs you in and payment is simulated. Supabase keys: real sign-in. Plus Paystack keys and `DATABASE_URL`: real test payments and saved orders.

## Deploy

Netlify builds `main` (`netlify.toml`, pnpm). Environment variables are the same as `.env.local` except `DIRECT_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SITE_URL`: leave the site URL unset so share links follow Netlify's `URL` (the primary domain, now `https://owambedrop.netlify.app`). DNS for martinelmars.com is on Cloudflare: CNAME `owambe` → `<site>.netlify.app`, proxy off. Supabase redirect URL: `https://owambe.martinelmars.com/auth/callback`. Paystack webhook: `https://owambe.martinelmars.com/api/paystack/webhook`. Run `pnpm db:migrate` yourself when the schema changes; deploys never touch the database.

## Commands

`pnpm dev` · `pnpm build` · `pnpm start` · `pnpm test` · `pnpm e2e` (first `pnpm exec playwright install chromium`) · `pnpm typecheck` · `pnpm lint` · `pnpm db:migrate` · `pnpm db:migrate:dev` · `pnpm db:studio`

## Roadmap

- Done for Launch 1: real sign-in, Paystack test payments, saved orders, per-piece share links with their own preview images.
- Next: an orders view for the owner and order confirmation emails.
- Later: an Expo app with haptics on the rail; the aso-ebi coordinator could reuse this checkout.
