"use client";
import { useEffect, useRef } from "react";
import { DELIVERY, accLabel, naira } from "@/lib/catalog";
import type { OrderView } from "@/lib/server/orders";
import { GarmentThumb } from "@/components/orders/GarmentThumb";
import { StatusPill } from "@/components/orders/StatusPill";

export function OrderModal({ order, onClose }: { order: OrderView; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  const speed = DELIVERY[order.delivery.speed];

  return (
    <dialog
      ref={dialogRef}
      className="sheet show order-modal"
      aria-labelledby="order-modal-title"
      closedby="any"
      onClose={onClose}
    >
        <div className="order-modal__head">
          <div className="order-modal__title">
            <span className="order-modal__label"><span className="small">Order</span><StatusPill status={order.status} /></span>
            <h2 id="order-modal-title">{order.ref}</h2>
          </div>
          <button type="button" className="x" aria-label="Close" autoFocus onClick={onClose}>✕</button>
        </div>
        <p className="small">
          Placed {order.placedAt}
          {order.paidAt && <> · paid {order.paidAt}</>}
        </p>

        <div className="order-modal__items">
          {order.items.map((l) => (
            <div className="bi" key={l.id}>
              <GarmentThumb pieceId={l.pieceId} uid={`om${l.id}`} />
              <div>
                <b>{l.name}</b>
                <span className="meta">{l.colour} · {l.size}{l.addOn ? ` · ${accLabel(l.pieceId, l.addOn)}` : ""}</span>
                <br />
                <span className="meta">{l.qty} × {naira(l.unitPrice)}</span>
              </div>
              <span className="lineprice">{naira(l.total)}</span>
            </div>
          ))}
        </div>

        <div className="totals">
          <div className="row"><span>Subtotal</span><span>{naira(order.subtotal)}</span></div>
          <div className="row"><span>Delivery · {speed.label}</span><span>{naira(order.deliveryFee)}</span></div>
          <div className="row big"><span>Total</span><span>{naira(order.total)}</span></div>
        </div>

        <div className="order-modal__delivery">
          <span className="label">Delivering to</span>
          <p>
            <b>{order.delivery.name}</b><br />
            {order.delivery.address}, {order.delivery.area}, Lagos<br />
            +234 {order.delivery.phone}<br />
            <span className="muted">{speed.label}, {speed.note}</span>
          </p>
        </div>

        <button type="button" className="secondary" onClick={onClose}>Back to my orders</button>
    </dialog>
  );
}
