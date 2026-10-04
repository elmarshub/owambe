import Link from "next/link";

export type OrdersState = "demo" | "signed-out" | "failed" | "empty" | "ready";

export function OrdersNotice({ state }: { state: OrdersState }) {
  if (state === "demo") return <p className="small">Sign-in isn&apos;t switched on yet, so there are no saved orders. Demo orders aren&apos;t stored.</p>;
  if (state === "signed-out") return <p className="small">Sign in at checkout to see your orders here. <Link className="link" href="/">Back to the rail</Link></p>;
  if (state === "failed") return <p className="err">We couldn&apos;t load your orders just now. Refresh to try again.</p>;
  if (state === "empty") {
    return (
      <div className="orders__empty">
        <p className="emptyt">No orders yet.</p>
        <Link className="primary" href="/">Find something on the rail</Link>
      </div>
    );
  }
  return null;
}
