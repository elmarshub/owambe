import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AUTH_LIVE } from "@/lib/config";
import { supabaseServer } from "@/lib/server/supabase";
import { listOrders, toOrderView, type OrderView } from "@/lib/server/orders";
import { OrdersBrowser } from "@/components/orders/OrdersBrowser";
import { Pagination } from "@/components/orders/Pagination";
import { SignOutButton } from "@/components/orders/SignOutButton";

export const metadata: Metadata = { title: "My orders", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const requested = Math.max(1, Number.parseInt((await searchParams).page ?? "1", 10) || 1);
  let email: string | null = null;
  let orders: OrderView[] = [];
  let total = 0;
  let pages = 1;
  let failed = false;

  if (AUTH_LIVE) {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    email = user?.email ?? null;
    if (user) {
      try {
        const result = await listOrders(user.id, requested);
        ({ total, pages } = result);
        orders = result.orders.map(toOrderView);
      } catch (error) {
        console.error("orders: load failed", error);
        failed = true;
      }
    }
  }

  if (!failed && total > 0 && requested > pages) redirect(pages === 1 ? "/orders" : `/orders?page=${pages}`);

  return (
    <div className="wrap">
      <header className="top">
        <Link className="mark" href="/" aria-label="Owambe">owambe<i>.</i></Link>
        <span />
        <div className="tools">{email && <SignOutButton />}</div>
      </header>
      <main className="orders">
        <Link className="back" href="/">‹&nbsp; Return to the rail</Link>
        <div className="orders__head">
          <h1>My orders</h1>
          {email && <p className="small">Signed in as {email}{total > 0 && <> · {total} {total === 1 ? "order" : "orders"}</>}</p>}
        </div>
        {!AUTH_LIVE && <p className="small">Sign-in isn&apos;t switched on yet, so there are no saved orders. Demo orders aren&apos;t stored.</p>}
        {AUTH_LIVE && !email && <p className="small">Sign in at checkout to see your orders here. <Link className="link" href="/">Back to the rail</Link></p>}
        {failed && <p className="err">We couldn&apos;t load your orders just now. Refresh to try again.</p>}
        {email && !failed && total === 0 && (
          <div className="orders__empty">
            <p className="emptyt">No orders yet.</p>
            <Link className="primary" href="/">Find something on the rail</Link>
          </div>
        )}
        {orders.length > 0 && <OrdersBrowser orders={orders} />}
        <Pagination page={Math.min(requested, pages)} pages={pages} />
      </main>
    </div>
  );
}
