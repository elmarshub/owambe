# owambe.

**A native-wear store you can touch.** Pieces hang on a brass rail and swing as you browse. Flip one to see the back, spin it on the hook, then try it on a fitting-room dummy that tells you how it fits your build.

Drop 01 · sewn in Lagos (concept store, Paystack test mode).
Built in public by [Martin Ifeanyi](https://www.martinelmars.com).

## Stack

Next.js 16 · React 19 · TypeScript · Zustand · Supabase (Auth + Postgres) · Paystack · Netlify

- The rail is a hand-written spring simulation in a `requestAnimationFrame` loop. Pieces turn in 2D and swap faces edge-on, so "Back" shows the real back.
- Garments, hangers, price tags and the dummy are SVG drawn in code.
- Sign-in (email code or Google) only happens at checkout.
- The server re-prices every order and confirms each payment with Paystack before marking it paid.

## Run it

```bash
pnpm install
cp .env.example .env.local   # leave it empty for demo mode
pnpm dev                     # http://localhost:3000
```

With no keys, the store runs in **demo mode**: any 6-digit code signs you in (except `000000`) and payment is simulated.

## Switch on real sign-in and test payments

1. **Supabase**
   - Create a project.
   - Run `supabase/migrations/0001_orders.sql` in the SQL editor.
   - Copy the URL, the anon key and the service-role key into `.env.local`.
   - Authentication → Email: make sure the sign-in email includes `{{ .Token }}` so it sends the 6-digit code.
   - Authentication → URL configuration: add `http://localhost:3000/auth/callback` and your live `/auth/callback` URL.
   - Optional: Google provider.
2. **Paystack** (Test mode)
   - Copy `pk_test_…` and `sk_test_…` into `.env.local`.
   - After deploying, set the webhook URL to `https://<your-site>/api/paystack/webhook`.
3. Restart `pnpm dev`.

Paystack test card (no extra checks): `4084 0840 8408 4081`, expiry `09/27`, CVV `408`. More test cards: [Paystack test payments](https://paystack.com/docs/payments/test-payments/).

## Scripts

`pnpm test` (unit) · `pnpm e2e` (browser, run `pnpm exec playwright install chromium` first) · `pnpm typecheck` · `pnpm lint`

## Deploy

Netlify builds Next.js automatically: connect the repo, add the same environment variables, and deploy. For the subdomain, add a CNAME record `owambe` → `<site>.netlify.app` and add the domain in Netlify.
