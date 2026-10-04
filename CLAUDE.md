@AGENTS.md

# owambe. — project context

Read this first. It is the full context for anyone (or any AI assistant) working on this repo.

## What this is

**owambe.** is a native-wear store you can touch, built in public by Martin Ifeanyi (github: elmarshub, martinelmars.com) as Launch 1 of a "short beautiful projects" series. It sells **finished, sewn pieces** (agbada, kaftan, buba and sokoto, iro and buba), never fabric by the yard.

- Live target: **https://owambe.martinelmars.com** (Netlify; Martin's Vercel free limit is used up).
- Drop 01 is a concept store: example prices, Paystack **test mode** only. No real money moves.
- The hook (what the launch video shows): pieces hang on a brass rail and swing like real clothes; you can flip a piece to see its back, spin it on the hook, and try it on a dress-form dummy with fit advice for your build and height.

## Design rules (Martin's decisions, keep them)

- White page (`--paper: #FFFFFF`), ink `#151514`, brass accent `#B8954A`. Fonts: **Bricolage Grotesque** (display) and **Manrope** (body), self-hosted via @fontsource.
- Inspired by the feel of BOLAPSD's "The Rail", but **must not look copied**: our own brass rail, wooden hangers, paper price tags, fabric swatches, copy and layout. Don't reuse their wording or visuals.
- Garments are **our own SVG illustrations** (src/lib/garments.ts). Don't scrape or use product photos from other stores.
- Sign-in is asked for **only at checkout**. Browsing and the fitting room stay open to everyone.
- Copy is short, plain and warm ("Ready for the party.", "It's yours.").
- Web first, works on phones (≤760px layout). An Expo app may come later and reuse src/lib.

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 16 (App Router, `src/`), React 19, TypeScript |
| Styling | One global stylesheet ported from the prototype (src/app/globals.css), with design tokens on `:root` |
| State | Zustand: `useShop` (rail and fitting room), `useBag` (persisted to localStorage), `useUi` (overlays, signed-in user) |
| Auth | Supabase Auth: 6-digit email code (OTP) or Google, via @supabase/ssr cookies |
| Data | Supabase Postgres, one `orders` table with row-level security (supabase/migrations/0001_orders.sql) |
| Payments | Paystack: server initializes → Inline popup (`resumeTransaction`) → server verifies → webhook as backup |
| Validation | zod (checkout input) |
| Tests | Vitest (tests/unit), Playwright (tests/e2e) |
| Hosting | Netlify, netlify.toml |

Note: Next 16 renamed middleware to **proxy** (`src/proxy.ts`). Check `node_modules/next/dist/docs/` before using any Next API from memory.

## Demo mode vs live mode

`src/lib/config.ts` decides from env vars:
- No Supabase keys → **demo mode**: any 6-digit code signs you in except `000000`; Google pretends; payment is simulated. This is how the prototype behaved and keeps the site usable before keys exist.
- Supabase keys → real sign-in. Supabase + Paystack public key (and the server secrets) → real test payments and saved orders.

## How the rail works (src/components/rail/Rail.tsx)

- React renders each piece once; a `requestAnimationFrame` loop moves them with springs (position, angle, scale, plus a pendulum `sw` driven by sideways acceleration). The loop reads state with `useShop.getState()` so it never re-renders React.
- Turning is 2D: card `scaleX(|cos θ|)` + `skewY`, and the face swaps (front/back/dummy) when the piece passes edge-on. The loop sets `data-show` on the piece; CSS shows the matching `.face`. Don't control `style` or `data-show` on `.piece` from JSX, or React will fight the loop.
- `motionBus.kick` (src/store/shop.ts) nudges the open piece so it swings when something changes (size, add to bag, tap).
- The stage is its own stacking context (`isolation: isolate`) so pieces with high z-index never draw over the bag, sheet or toast. (That bug happened once; keep it fixed.)
- Reduced motion: respects the OS setting; the footer has a Motion on/off toggle.

## Checkout and money (security rules)

- The browser sends only piece ids, sizes, quantities and delivery details. **The server re-prices from src/lib/catalog.ts**; never trust a price from the browser.
- Amounts are stored in whole naira; Paystack gets kobo (`× 100`) in src/lib/paystack.ts.
- An order is marked paid only after the server calls Paystack's verify endpoint and status, currency and amount all match (`settleOrder` in src/lib/orders-server.ts). The webhook checks the `x-paystack-signature` HMAC-SHA512 before doing anything.
- `SUPABASE_SERVICE_ROLE_KEY` and `PAYSTACK_SECRET_KEY` are server-only. Never prefix them with `NEXT_PUBLIC_`, never log them, never paste them in chat.

## Files

```
src/
  app/            page.tsx (the store), layout.tsx (fonts, metadata), globals.css
    orders/       My orders (server component, RLS)
    auth/callback Google sign-in return
    api/checkout, api/paystack/verify, api/paystack/webhook
  components/     Store, Header, rail/ (Rail, UnderRail), panel/PiecePanel, bag/BagDrawer, checkout/ (sheet + steps), ui/
  lib/            catalog.ts (pieces, sizes, delivery), garments.ts (SVG drawing), fit.ts (fit advice),
                  orders.ts (zod + pricing), orders-server.ts, paystack.ts, shop-client.ts (browser auth + pay), supabase/
  store/          shop.ts, bag.ts, ui.ts
  proxy.ts        keeps the Supabase session fresh
supabase/migrations/0001_orders.sql
tests/unit, tests/e2e
```

## Commands

- Package manager is **pnpm** (pinned in `package.json` `packageManager`). Don't add a `package-lock.json`.
- `pnpm dev` · `pnpm build` · `pnpm start`
- `pnpm test` (Vitest) · `pnpm e2e` (Playwright; first run `pnpm exec playwright install chromium`) · `pnpm typecheck` · `pnpm lint`

## Roadmap

- **Launch 1 (now):** this store live at owambe.martinelmars.com with real Supabase sign-in and Paystack test payments.
- Next for the store: share link that opens an exact piece and colourway (`/?piece=royal`), Open Graph image, an orders view for the owner, custom SMTP (e.g. Resend) so sign-in emails aren't rate-limited, order confirmation emails.
- Later: Expo app with haptics on the rail; the aso-ebi coordinator could reuse this checkout.
- The original single-file prototype lives on as the "Owambe" artifact; the Figma-style flow designs are in the "Owambe designs" canvas.

## Working with Martin

Martin is a frontend and mobile engineer in Lagos (React, Next.js, TypeScript, React Native; backend with Express/NestJS/Postgres). He builds in public, so commits and the README should read well to other developers. Keep explanations practical and step by step.
