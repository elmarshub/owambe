"use client";
// The fitting room: name and price, hanger or dummy, front or back, build and height, size, add to bag.
import { useEffect, useRef, useState } from "react";
import { SIZES, naira } from "@/lib/catalog";
import { BUILDS, HEIGHTS, REC, fitAdvice, type Build, type Height } from "@/lib/fit";
import { isBack, kick, useShop } from "@/store/shop";
import { useBag } from "@/store/bag";
import { useUi } from "@/store/ui";
import { Segment } from "@/components/ui/Segment";

export function PiecePanel() {
  const s = useShop();
  const add = useBag((b) => b.add);
  const showToast = useUi((u) => u.showToast);
  const [err, setErr] = useState("");
  const ref = useRef<HTMLElement>(null);

  // On desktop the panel floats beside the rail; grow the scene so a tall panel (fit box open)
  // never covers the arrows and swatches underneath.
  useEffect(() => {
    const panel = ref.current;
    const scene = panel?.parentElement;
    if (!panel || !scene) return;
    const fit = () => {
      const desktop = window.innerWidth > 760;
      scene.style.minHeight = desktop && panel.classList.contains("show") ? `${panel.offsetTop + panel.offsetHeight + 12}px` : "";
    };
    const ro = new ResizeObserver(fit);
    ro.observe(panel);
    window.addEventListener("resize", fit);
    fit();
    return () => { ro.disconnect(); window.removeEventListener("resize", fit); };
  }, []);
  const p = s.selected !== null ? s.list[s.selected] : null;
  const back = isBack(s.spinBase);
  const rec = REC[s.build];
  const size = p ? s.sizes[p.id] : undefined;
  const advice = fitAdvice(s.build, s.height, size);

  const addToBag = () => {
    if (!p) return;
    if (!size) {
      setErr(`Pick a size first. We suggest ${SIZES[rec]}.`);
      document.querySelectorAll<HTMLButtonElement>(".size")[rec]?.focus();
      return;
    }
    setErr("");
    add({ id: p.id, size, acc: s.view === "dummy" && s.acc });
    showToast(`${p.name}, size ${size}, is in your bag`);
    kick(18);
  };

  return (
    <aside ref={ref} className={p ? "panel show" : "panel"} aria-live="polite" aria-hidden={!p}>
      {p && (
        <>
          <div>
            <div className="series">{p.series}</div>
            <h2>{p.name}</h2>
          </div>
          <div className="price">{naira(p.price)}</div>
          <div className="row2">
            <Segment label="Show" value={s.view} onChange={s.setView} options={[["hanger", "On hanger"], ["dummy", "On dummy"]]} />
            <Segment label="Side" value={back ? "back" : "front"} onChange={(v) => (v === "back" ? s.showBack() : s.showFront())} options={[["front", "Front"], ["back", "Back"]]} />
          </div>

          {s.view === "dummy" && (
            <div className="fitbox">
              <div className="label">Body build <span>{BUILDS[s.build]}</span></div>
              <Segment label="Body build" value={String(s.build)} onChange={(v) => s.setBuild(Number(v) as Build)} options={BUILDS.map((b, i) => [String(i), b])} />
              <div className="label">Height <span>{HEIGHTS[s.height]}</span></div>
              <Segment label="Height" value={String(s.height)} onChange={(v) => s.setHeight(Number(v) as Height)} options={[["0", "Shorter"], ["1", "Average"], ["2", "Taller"]]} />
              <label className="check">
                <input type="checkbox" checked={s.acc} onChange={(e) => s.setAcc(e.target.checked)} />
                <span>{p.acc === "gele" ? "Add a matching gele" : "Add a matching fila"}</span>
              </label>
              <div className={advice.tone === "ok" ? "fitmsg" : `fitmsg ${advice.tone}`}><i /><span>{advice.text}</span></div>
            </div>
          )}

          <div className="label">Size <span>Gold dot = our suggestion</span></div>
          <div className="sizes" role="group" aria-label="Size">
            {SIZES.map((z, k) => (
              <button
                key={z}
                className={k === rec ? "size rec" : "size"}
                aria-pressed={size === z}
                aria-label={`${z}${k === rec ? ", suggested" : ""}`}
                onClick={() => { s.setSize(p.id, z); setErr(""); }}
              >
                {z}
              </button>
            ))}
          </div>
          <p className="err">{err}</p>
          <button className="primary" onClick={addToBag}>Add to bag</button>
          <p className="small">{p.desc}</p>
        </>
      )}
    </aside>
  );
}
