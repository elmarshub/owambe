-- Owambe orders. Run this once in the Supabase SQL editor (or with `supabase db push`).
-- Amounts are whole naira. Paystack amounts (kobo) are converted in the app.

create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  ref           text not null unique,               -- OW-XXXXXXXXX, also the Paystack reference
  user_id       uuid references auth.users (id) on delete set null,
  email         text not null,
  items         jsonb not null,                     -- [{id, name, colour, size, qty, acc, unit, total}]
  subtotal      integer not null check (subtotal >= 0),
  delivery_fee  integer not null check (delivery_fee >= 0),
  total         integer not null check (total >= 0),
  delivery      jsonb not null,                     -- {name, phone, address, area, speed}
  status        text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  paystack      jsonb,                              -- what Paystack said when it verified the payment
  paid_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id, created_at desc);

-- Row-level security: a signed-in shopper can read only their own orders.
-- There are no insert/update policies, so only the server (service-role key) can write orders.
alter table public.orders enable row level security;

drop policy if exists "Shoppers read their own orders" on public.orders;
create policy "Shoppers read their own orders"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);
