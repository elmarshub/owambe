import type { Metadata } from "next";
import Link from "next/link";
import { HomeLogo } from "@/components/ui/HomeLogo";
import { redirect } from "next/navigation";
import { AUTH_LIVE } from "@/lib/config";
import { supabaseServer } from "@/lib/server/supabase";
import { listOrders, toOrderView, type OrderView } from "@/lib/server/orders";
import { OrdersBrowser } from "@/components/orders/OrdersBrowser";
import { OrdersNotice, type OrdersState } from "@/components/orders/OrdersNotice";
import { Pagination } from "@/components/orders/Pagination";
import { SignOutButton } from "@/components/orders/SignOutButton";

export const metadata: Metadata = { title: "My orders", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

interface OrdersPageData {
  state: OrdersState;
  email: string | null;
  orders: OrderView[];
  total: number;
  pages: number;
}

async function loadOrdersPage(page: number): Promise<OrdersPageData> {
  const none = { email: null, orders: [], total: 0, pages: 1 };
  if (!AUTH_LIVE) return { ...none, state: "demo" };
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ...none, state: "signed-out" };
  const email = user.email ?? null;
  try {
    const { total, pages, orders } = await listOrders(user.id, page);
    return { state: total === 0 ? "empty" : "ready", email, orders: orders.map(toOrderView), total, pages };
  } catch (error) {
    console.error("orders: load failed", error);
    return { ...none, email, state: "failed" };
  }
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const requested = Math.max(1, Number.parseInt((await searchParams).page ?? "1", 10) || 1);
  const { state, email, orders, total, pages } = await loadOrdersPage(requested);
  if (state === "ready" && requested > pages) redirect(pages === 1 ? "/orders" : `/orders?page=${pages}`);

  return (
    <div className="wrap">
      <header className="top">
        <HomeLogo />
        <span />
        <div className="tools">{email && <SignOutButton />}</div>
      </header>
      <main className="orders">
        <Link className="back" href="/">‹&nbsp; Return to the rail</Link>
        <div className="orders__head">
          <h1>My orders</h1>
          {email && <p className="small">Signed in as {email}{total > 0 && <> · {total} {total === 1 ? "order" : "orders"}</>}</p>}
        </div>
        <OrdersNotice state={state} />
        {state === "ready" && <OrdersBrowser orders={orders} />}
        <Pagination page={Math.min(requested, pages)} pages={pages} />
      </main>
    </div>
  );
}
