# owambe.

**A native-wear store you can touch.** Pieces hang on a brass rail and swing as you browse. Flip one to see the back, spin it on the hook, then try it on a fitting-room dummy that tells you how it fits your build.

Drop 01 · sewn in Lagos (concept store, Paystack test mode).
Built in public by [Martin Ifeanyi](https://www.martinelmars.com).

## Stack

Next.js 16 · React 19 · TypeScript · Zustand · Supabase Auth · Postgres with Prisma · Paystack · Netlify

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
   - Copy the URL and the anon key into `.env.local`.
   - Connect → ORMs → Prisma: copy the pooled URL (port 6543) to `DATABASE_URL` and the direct URL (port 5432) to `DIRECT_URL`.
   - Run `pnpm db:migrate` to create the `orders` and `order_items` tables.
   - Authentication → Email: set the OTP length to 6, and make sure the sign-in email includes `{{ .Token }}` so it sends the code.
   - Authentication → URL configuration: add `http://localhost:3000/auth/callback` and your live `/auth/callback` URL.
   - Optional: Google provider.
2. **Paystack** (Test mode)
   - Copy `pk_test_…` and `sk_test_…` into `.env.local`.
   - After deploying, set the webhook URL to `https://<your-site>/api/paystack/webhook`.
3. Restart `pnpm dev`.

Paystack test card (no extra checks): `4084 0840 8408 4081`, expiry `09/27`, CVV `408`. More test cards: [Paystack test payments](https://paystack.com/docs/payments/test-payments/).

## Scripts

`pnpm test` (unit) · `pnpm e2e` (browser, run `pnpm exec playwright install chromium` first) · `pnpm typecheck` · `pnpm lint`

Database: `pnpm db:migrate` (apply migrations) · `pnpm db:migrate:dev` (create a new migration after editing `prisma/schema.prisma`) · `pnpm db:studio` (browse the data)

## Deploy

Hosted on Netlify, which builds Next.js automatically from `main`.

1. Netlify → Add new project → import this repo. Netlify picks up `netlify.toml` and pnpm.
2. Environment variables: the same as `.env.local`, except `DIRECT_URL` (only migrations use it). Set `NEXT_PUBLIC_SITE_URL=https://owambe.martinelmars.com`.
3. Domain management → add `owambe.martinelmars.com`. The DNS for martinelmars.com is on Cloudflare: add a CNAME `owambe` → `<site>.netlify.app` with the proxy off (grey cloud), so Netlify can issue the HTTPS certificate.
4. Supabase → Authentication → URL configuration: Site URL `https://owambe.martinelmars.com`, and add `https://owambe.martinelmars.com/auth/callback` to the redirect URLs.
5. Paystack → Settings → API Keys & Webhooks: webhook URL `https://owambe.martinelmars.com/api/paystack/webhook`.

Run `pnpm db:migrate` yourself when the schema changes; deploys never touch the database.
