"use client";
import { useEffect } from "react";
import { accLabel, naira } from "@/lib/catalog";
import type { PaidOrder } from "@/lib/client/payment";
import { useBag } from "@/store/bag";
import { useShop } from "@/store/shop";
import { useUi } from "@/store/ui";

export function DoneStep({ order }: { order: PaidOrder }) {
  const clear = useBag((b) => b.clear);
  const closeSheet = useUi((u) => u.closeSheet);
  const deselect = useShop((s) => s.deselect);

  useEffect(() => { clear(); }, [clear]);

  return (
    <div className="step">
      <div className="tag">
        <div className="hole" />
        <div className="no">ORDER {order.ref}</div>
        <h5 id="sheet-title">{order.confirming ? "Payment received." : <>It&apos;s yours.</>}</h5>
        <p className="small">
          {order.confirming
            ? "We're confirming it with Paystack. It will show as paid in My orders in a moment."
            : <>Your pieces are being pressed and packed. We&apos;ll text you when they leave.</>}
        </p>
        <div className="totals tagtotals">
          {order.items.map((l, i) => <div className="row" key={i}><span>{l.name} · {l.size}{l.acc ? ` · ${accLabel(l.id, l.acc)}` : ""}{l.qty > 1 ? ` × ${l.qty}` : ""}</span><span>{naira(l.total)}</span></div>)}
          <div className="row"><span>Delivery</span><span>{naira(order.delivery)}</span></div>
          <div className="row big"><span>Paid</span><span>{naira(order.total)}</span></div>
        </div>
      </div>
      <button className="primary" type="button" onClick={() => { closeSheet(); deselect(); }}>Back to the rail</button>
      {!order.demo && <a className="secondary" href="/orders">View my orders</a>}
    </div>
  );
}
