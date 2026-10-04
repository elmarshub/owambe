"use client";
import { useMemo } from "react";
import { MAX_QTY, accLabel, findPiece, naira, unitPrice } from "@/lib/catalog";
import { garmentSVG } from "@/lib/garments";
import { bagSubtotal, useBag } from "@/store/bag";
import { useUi } from "@/store/ui";
import { EmptyHanger } from "@/components/ui/EmptyHanger";

export function BagDrawer() {
  const { items, change } = useBag();
  const { bagOpen, closeBag, openSheet } = useUi();
  const thumbs = useMemo(() => items.map((b, i) => garmentSVG(findPiece(b.id)!, "front", `bag${i}${b.id}`)), [items]);

  return (
    <aside className={bagOpen ? "drawer show" : "drawer"} aria-label="Your bag" aria-hidden={!bagOpen} inert={!bagOpen}>
      <div className="dhead">
        <h3>Your bag</h3>
        <button className="x" aria-label="Close bag" onClick={closeBag}>✕</button>
      </div>
      <div className="bagitems">
        {items.length === 0 ? (
          <div className="empty">
            <EmptyHanger key={bagOpen ? "open" : "closed"} />
            <p className="emptyt">Your bag is empty.</p>
            <p className="small">Pick a piece off the rail to start.</p>
          </div>
        ) : (
          items.map((b, i) => {
            const p = findPiece(b.id);
            if (!p) return null;
            return (
              <div className="bi" key={`${b.id}-${b.size}-${b.acc}`}>
                <div className="thumb" dangerouslySetInnerHTML={{ __html: thumbs[i] }} />
                <div>
                  <b>{p.name}</b>
                  <span className="meta">{p.colour} · {b.size}{b.acc ? ` · ${accLabel(b.id, b.acc)}` : ""}</span>
                  <br />
                  <span className="lineprice">{naira(unitPrice(p, b.acc) * b.qty)}</span>
                </div>
                <div className="qty">
                  <button aria-label="One fewer" onClick={() => change(i, -1)}>−</button>
                  <span>{b.qty}</span>
                  <button aria-label="One more" disabled={b.qty >= MAX_QTY} onClick={() => change(i, 1)}>+</button>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="totals">
        <div className="row"><span>Subtotal</span><span>{naira(bagSubtotal(items))}</span></div>
        <p className="small">Delivery is added at checkout.</p>
        <button className="primary" disabled={!items.length} onClick={openSheet}>Check out</button>
      </div>
    </aside>
  );
}
