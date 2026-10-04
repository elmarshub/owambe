// My orders: Supabase says who is signed in, then the server loads only that user's orders.
import type { Metadata } from "next";
import Link from "next/link";
import { AUTH_LIVE } from "@/lib/config";
import { accLabel, naira } from "@/lib/catalog";
import { supabaseServer } from "@/lib/server/supabase";
import { listOrders, type OrderWithItems } from "@/lib/server/orders";
import { SignOutButton } from "@/components/orders/SignOutButton";

export const metadata: Metadata = { title: "My orders", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  let email: string | null = null;
  let orders: OrderWithItems[] = [];
  let failed = false;

  if (AUTH_LIVE) {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    email = user?.email ?? null;
    if (user) {
      try {
        orders = await listOrders(user.id);
      } catch (error) {
        console.error("orders: load failed", error);
        failed = true;
      }
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
        <Link className="back" href="/">‹&nbsp; Return to the rail</Link>
        <h1>My orders</h1>
        {!AUTH_LIVE && <p className="small">Sign-in isn&apos;t switched on yet, so there are no saved orders. Demo orders aren&apos;t stored.</p>}
        {AUTH_LIVE && !email && <p className="small">Sign in at checkout to see your orders here. <Link className="link" href="/">Back to the rail</Link></p>}
        {email && <p className="small">Signed in as {email}.</p>}
        {failed && <p className="err">We couldn&apos;t load your orders just now. Refresh to try again.</p>}
        {email && !failed && orders.length === 0 && <p className="small">No orders yet. <Link className="link" href="/">Find something on the rail</Link></p>}
        {orders.map((o) => (
          <article className="order" key={o.id}>
            <header>
              <b>{o.ref}</b>
              <span className={`pill ${o.status}`}>{o.status === "paid" ? "Paid (test)" : o.status === "pending" ? "Awaiting payment" : "Payment failed"}</span>
            </header>
            <span className="small">{o.createdAt.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })} · to {o.area}</span>
            {o.items.map((l) => (
              <div className="row" key={l.id}><span>{l.name} · {l.size}{l.addOn ? ` · ${accLabel(l.pieceId, l.addOn)}` : ""}{l.qty > 1 ? ` × ${l.qty}` : ""}</span><span>{naira(l.total)}</span></div>
            ))}
            <div className="row big"><span>Total</span><span>{naira(o.total)}</span></div>
          </article>
        ))}
      </main>
    </div>
  );
}
