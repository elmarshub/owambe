// My orders: the signed-in shopper's orders, read through row-level security (they only see their own).
import type { Metadata } from "next";
import Link from "next/link";
import { AUTH_LIVE } from "@/lib/config";
import { accLabel, naira } from "@/lib/catalog";
import { supabaseServer } from "@/lib/supabase/server";
import type { OrderRow } from "@/lib/orders-server";
import { SignOutButton } from "./SignOutButton";

export const metadata: Metadata = { title: "My orders · owambe." };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  let email: string | null = null;
  let orders: OrderRow[] = [];

  if (AUTH_LIVE) {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    email = user?.email ?? null;
    if (user) {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(50);
      orders = (data ?? []) as OrderRow[];
    }
  }

  return (
    <div className="wrap">
      <header className="top">
        <Link className="mark" href="/" aria-label="Owambe">owambe<i>.</i></Link>
        <span />
        <div className="tools">{email && <SignOutButton />}</div>
      </header>
      <main className="orders">
        <h1>My orders</h1>
        {!AUTH_LIVE && <p className="small">Sign-in isn&apos;t switched on yet, so there are no saved orders. Demo orders aren&apos;t stored.</p>}
        {AUTH_LIVE && !email && <p className="small">Sign in at checkout to see your orders here. <Link className="link" href="/">Back to the rail</Link></p>}
        {email && <p className="small">Signed in as {email}.</p>}
        {email && orders.length === 0 && <p className="small">No orders yet. <Link className="link" href="/">Find something on the rail</Link></p>}
        {orders.map((o) => (
          <article className="order" key={o.id}>
            <header>
              <b>{o.ref}</b>
              <span className={`pill ${o.status}`}>{o.status === "paid" ? "Paid (test)" : o.status === "pending" ? "Awaiting payment" : "Payment failed"}</span>
            </header>
            <span className="small">{new Date(o.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })} · to {o.delivery.area}</span>
            {o.items.map((l, i) => (
              <div className="row" key={i}><span>{l.name} · {l.size}{l.acc ? ` · ${accLabel(l.id, l.acc)}` : ""}{l.qty > 1 ? ` × ${l.qty}` : ""}</span><span>{naira(l.total)}</span></div>
            ))}
            <div className="row big"><span>Total</span><span>{naira(o.total)}</span></div>
          </article>
        ))}
      </main>
    </div>
  );
}
