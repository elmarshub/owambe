"use client";
import { naira } from "@/lib/catalog";
import type { OrderView } from "@/lib/server/orders";
import { GarmentThumb } from "@/components/orders/GarmentThumb";
import { StatusPill } from "@/components/orders/StatusPill";

const SHOWN = 3;

export function OrderCard({ order, onOpen }: { order: OrderView; onOpen: () => void }) {
  const pieces = order.items.reduce((n, l) => n + l.qty, 0);
  const extra = order.items.length - SHOWN;
  return (
    <button type="button" className="order-card" onClick={onOpen} aria-label={`View order ${order.ref}`}>
      <span className="order-card__head">
        <b>{order.ref}</b>
        <StatusPill status={order.status} />
      </span>
      <span className="small">{order.placedAt} · to {order.delivery.area}</span>
      <span className="order-card__thumbs">
        {order.items.slice(0, SHOWN).map((l) => <GarmentThumb key={l.id} pieceId={l.pieceId} uid={`oc${l.id}`} />)}
        {extra > 0 && <span className="thumb thumb--more">+{extra}</span>}
      </span>
      <span className="order-card__foot">
        <span>
          <span className="small">{pieces} {pieces === 1 ? "piece" : "pieces"}</span>
          <b className="order-card__total">{naira(order.total)}</b>
        </span>
        <span className="order-card__view">View order ›</span>
      </span>
    </button>
  );
}
