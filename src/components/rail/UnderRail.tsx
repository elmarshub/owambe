"use client";
// Under the rail: which piece you're on, its caption, the ‹ › arrows and the fabric swatches.
import { naira } from "@/lib/catalog";
import { swatchSVG } from "@/lib/garments";
import { useShop } from "@/store/shop";

export function UnderRail() {
  const { list, selected, hover, focus, step, select, setFocus } = useShop();
  const e = selected ?? hover ?? focus;
  const n = list.length;
  const cur = e !== null ? list[e] : null;
  const title = cur ? cur.name : "Drop 01, on the rail";
  const sub = !cur
    ? "Swipe along the rail. Tap a piece to try it on."
    : selected !== null
      ? `${naira(cur.price)} · in the fitting room`
      : `${cur.colour} · ${naira(cur.price)}`;

  return (
    <>
      <div className="under">
        <div className="count">Piece <b>{(e ?? Math.floor((n - 1) / 2)) + 1}</b> of {n}</div>
        <div className="caption" aria-live="polite"><strong>{title}</strong><span>{sub}</span></div>
        <div className="arrows">
          <button className="round" aria-label="Previous piece" onClick={() => step(-1)}>‹</button>
          <button className="round" aria-label="Next piece" onClick={() => step(1)}>›</button>
        </div>
      </div>
      <div className="swatches" role="group" aria-label="Fabrics on the rail">
        {list.map((p, i) => (
          <button
            key={p.id}
            className="sw"
            aria-label={p.name}
            aria-current={i === e}
            onClick={() => (selected !== null ? select(i) : setFocus(i))}
            dangerouslySetInnerHTML={{ __html: swatchSVG(p) }}
          />
        ))}
      </div>
    </>
  );
}
