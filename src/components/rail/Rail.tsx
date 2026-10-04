"use client";
// React renders the pieces once; a requestAnimationFrame loop moves them with springs.
// A turn is 2D: width follows cos(angle) and the face swaps edge-on, so "Back" shows the real back.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { SIZES, naira } from "@/lib/catalog";
import { dummySVG, garmentSVG } from "@/lib/garments";
import { motionBus, useShop } from "@/store/shop";

interface Sim { x: number; vx: number; a: number; va: number; s: number; vs: number; sw: number; vsw: number; o: number }
interface Geo { W: number; H: number; railY: number; stageW: number; stageH: number; mobile: boolean; pitch: number; railW: number; selS: number }
interface Target { x: number; a: number; s: number; o: number; z: number }
interface Drag { x0: number; moved: boolean; i: number | null; f0: number; spin: boolean }

const MOBILE = 760;

export function Rail() {
  const list = useShop((s) => s.list);
  const selected = useShop((s) => s.selected);
  const view = useShop((s) => s.view);
  const build = useShop((s) => s.build);
  const height = useShop((s) => s.height);
  const acc = useShop((s) => s.acc);
  const sizes = useShop((s) => s.sizes);

  const stageRef = useRef<HTMLElement>(null);
  const pieceEls = useRef<(HTMLDivElement | null)[]>([]);
  const cardEls = useRef<(HTMLDivElement | null)[]>([]);
  const shadowEls = useRef<(HTMLDivElement | null)[]>([]);
  const sim = useRef<Sim[]>([]);
  const geo = useRef<Geo>({ W: 180, H: 279, railY: 44, stageW: 1000, stageH: 500, mobile: false, pitch: 120, railW: 800, selS: 1.4 });
  const drag = useRef<Drag | null>(null);
  const spinDrag = useRef(0);
  const railOffset = useRef(0);
  const prevSelected = useRef<number | null>(null);

  const faces = useMemo(
    () => list.map((p, i) => ({ front: garmentSVG(p, "front", p.id, i + 1), back: garmentSVG(p, "back", p.id) })),
    [list],
  );

  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const { list: l, selected: sel } = useShop.getState();
    const w = stage.clientWidth;
    const mobile = window.innerWidth <= MOBILE;
    const railY = 44;
    const n = l.length || 7;
    const railW = w * (mobile ? 0.96 : 0.84);
    const W = mobile ? 148 : Math.min(240, railW / (n * 0.6 + 0.9));
    const H = (W * 310) / 200;
    const selS = mobile ? 1.22 : 1.45;
    const stageH = Math.round(railY + H * (sel !== null ? selS : mobile ? 1.2 : 1.3) + (mobile ? 40 : 36));
    stage.style.setProperty("--stageH", stageH + "px");
    stage.style.setProperty("--railY", railY + "px");
    stage.style.setProperty("--postH", Math.round(Math.min(90, stageH * 0.16)) + "px");
    geo.current = { W, H, railY, stageW: w, stageH, mobile, pitch: W * 0.6, railW, selS };
    pieceEls.current.forEach((el) => {
      if (!el) return;
      el.style.width = W + "px";
      el.style.height = H + "px";
      el.style.top = railY - H * (10 / 310) - 2 + "px";
    });
  }, []);

  // A new rail (Men/Women): the pieces slide in from the left.
  useLayoutEffect(() => {
    const enter = -window.innerWidth * 0.7;
    sim.current = list.map((_, i) => ({ x: enter - (list.length - i) * 40, vx: 0, a: -40, va: 0, s: 1, vs: 0, sw: 0, vsw: 0, o: 0 }));
    pieceEls.current.length = list.length;
    prevSelected.current = null;
    measure();
  }, [list, measure]);

  useLayoutEffect(() => {
    const prev = prevSelected.current;
    const G = geo.current;
    if (prev !== null && selected === null) {
      sim.current.forEach((q, k) => {
        if (k !== prev) q.x = -G.stageW * 0.55 - G.W - (list.length - k) * 30;
      });
    } else if (prev !== null && selected !== null && prev !== selected) {
      const q = sim.current[selected];
      if (q) { q.x = G.mobile ? 0 : -G.stageW * 0.2; q.o = 1; }
    }
    prevSelected.current = selected;
    spinDrag.current = 0;
    measure();
  }, [selected, list, measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const targets = (): Target[] => {
      const st = useShop.getState();
      const { W, pitch, stageW, mobile, railW, selS } = geo.current;
      const n = st.list.length;
      const e = st.hover ?? st.focus;
      if (st.selected !== null) {
        const s = st.selected;
        return st.list.map((_, i) => (i === s
          ? { x: mobile ? 0 : -stageW * 0.2, a: st.spinBase + spinDrag.current, s: selS, o: 1, z: 1000 }
          : { x: -stageW * 0.5 - W * 1.6 - (n - i) * 26, a: -40, s: 0.9, o: 0, z: i }));
      }
      let base = 0;
      const total = (n - 1) * pitch;
      if (total > railW - W) {
        const c = e ?? (n - 1) / 2;
        const max = (total - (railW - W)) / 2;
        base = Math.max(-max, Math.min(max, -(c - (n - 1) / 2) * pitch));
      }
      const grow = mobile ? 1.18 : 1.3;
      const push = e === null ? 0 : (W * grow - pitch) * 0.55;
      return st.list.map((_, i) => {
        let x = base + (i - (n - 1) / 2) * pitch + railOffset.current;
        if (e !== null && i !== e) x += Math.sign(i - e) * push * (Math.abs(i - e) === 1 ? 1 : 0.92);
        const isE = i === e;
        return { x, a: isE ? 0 : -42, s: isE ? grow : 1, o: 1, z: isE ? 500 : i };
      });
    };

    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const st = useShop.getState();
      const G = geo.current;
      const T = targets();
      if (motionBus.kick && st.selected !== null && sim.current[st.selected] && st.motion) sim.current[st.selected].vsw += motionBus.kick;
      motionBus.kick = 0;

      sim.current.forEach((q, i) => {
        const t = T[i];
        const el = pieceEls.current[i];
        const card = cardEls.current[i];
        const sh = shadowEls.current[i];
        if (!t || !el || !card || !sh) return;
        if (st.motion) {
          const ax = 190 * (t.x - q.x) - 24 * q.vx;
          q.vx += ax * dt; q.x += q.vx * dt;
          const grab = st.selected === i && drag.current?.spin && drag.current.moved;
          const ka = grab ? 900 : 120, ca = grab ? 60 : 15;
          q.va += (ka * (t.a - q.a) - ca * q.va) * dt; q.a += q.va * dt;
          q.vs += (220 * (t.s - q.s) - 26 * q.vs) * dt; q.s += q.vs * dt;
          // The pendulum: sideways acceleration makes the piece swing on its hook.
          q.vsw += (-55 * q.sw - 3.2 * q.vsw - ax * 0.012) * dt; q.sw += q.vsw * dt;
          q.sw = Math.max(-9, Math.min(9, q.sw));
          q.o += (t.o - q.o) * Math.min(1, dt * 9);
        } else {
          q.x = t.x; q.a = t.a; q.s = t.s; q.sw = 0; q.o = t.o; q.vx = q.va = q.vs = q.vsw = 0;
        }
        const r = (q.a * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
        const onDummy = st.selected === i && st.view === "dummy";
        const want = onDummy ? (c >= 0 ? "dummy" : "dummyback") : c >= 0 ? "front" : "back";
        if (el.dataset.show !== want) el.dataset.show = want;
        el.style.transform = `translate3d(${(q.x - G.W / 2).toFixed(2)}px,0,0) rotate(${q.sw.toFixed(2)}deg) scale(${q.s.toFixed(4)})`;
        card.style.transform = `skewY(${(-sn * c * 7).toFixed(2)}deg) scaleX(${Math.max(0.04, Math.abs(c)).toFixed(4)})`;
        card.style.filter = `brightness(${(0.86 + 0.14 * Math.abs(c)).toFixed(3)})`;
        el.style.opacity = q.o.toFixed(3);
        el.style.zIndex = String(t.z);
        const sw = G.W * q.s * (0.45 + 0.5 * Math.abs(c));
        sh.style.width = sw + "px";
        sh.style.transform = `translate(${(q.x - sw / 2).toFixed(1)}px, ${(G.railY + G.H * q.s * 0.95 + 6).toFixed(1)}px)`;
        sh.style.opacity = (q.o * 0.9).toFixed(2);
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame((t) => { last = t; frame(t); });
    stageRef.current?.setAttribute("data-ready", ""); // lets tests know the rail is live
    return () => cancelAnimationFrame(raf);
  }, []);

  // Pointer: hover on desktop, drag to browse, drag the open piece to spin it, tap to open.
  const hitIndex = (target: EventTarget | null) => {
    const hit = (target as HTMLElement | null)?.closest?.(".hit") as HTMLElement | null;
    return hit ? Number(hit.dataset.i) : null;
  };
  const onPointerDown = (ev: React.PointerEvent<HTMLElement>) => {
    if (ev.button !== 0) return;
    const st = useShop.getState();
    const i = hitIndex(ev.target);
    drag.current = { x0: ev.clientX, moved: false, i, f0: st.focus ?? Math.floor((st.list.length - 1) / 2), spin: st.selected !== null && i !== null && i === st.selected };
    ev.currentTarget.setPointerCapture(ev.pointerId);
  };
  const onPointerMove = (ev: React.PointerEvent<HTMLElement>) => {
    const st = useShop.getState();
    const d = drag.current;
    if (d) {
      const dx = ev.clientX - d.x0;
      if (!d.moved && Math.abs(dx) > 6) {
        d.moved = true;
        stageRef.current?.classList.add("dragging");
        if (st.selected === null) st.setHover(null);
      }
      if (!d.moved) return;
      if (st.selected !== null) { if (d.spin) spinDrag.current = dx * 0.6; return; }
      const per = geo.current.pitch * 0.9;
      railOffset.current = Math.max(-geo.current.pitch, Math.min(geo.current.pitch, (dx - Math.round(dx / per) * per) * 0.5));
      const nf = Math.max(0, Math.min(st.list.length - 1, d.f0 - Math.round(dx / per)));
      if (nf !== st.focus) st.setFocus(nf);
      return;
    }
    if (ev.pointerType !== "mouse" || st.selected !== null) return;
    const i = hitIndex(ev.target);
    if (i !== st.hover) st.setHover(i);
  };
  const onPointerEnd = () => {
    const d = drag.current;
    if (!d) return;
    const st = useShop.getState();
    stageRef.current?.classList.remove("dragging");
    drag.current = null;
    railOffset.current = 0;
    if (st.selected !== null) {
      if (d.spin && d.moved) {
        const deg = Math.round((st.spinBase + spinDrag.current) / 180) * 180;
        spinDrag.current = 0;
        st.setSpin(deg);
      } else if (d.spin) {
        motionBus.kick += 14;
      }
      return;
    }
    if (!d.moved && d.i !== null) st.select(d.i);
  };
  const onPointerLeave = () => {
    const st = useShop.getState();
    if (!drag.current && st.hover !== null) st.setHover(null);
  };
  const onKeyDown = (ev: React.KeyboardEvent) => {
    const st = useShop.getState();
    if (ev.key === "ArrowRight") { st.step(1); ev.preventDefault(); }
    else if (ev.key === "ArrowLeft") { st.step(-1); ev.preventDefault(); }
    else if (ev.key === "Enter" && st.selected === null && st.focus !== null) st.select(st.focus);
  };

  const sel = selected !== null ? list[selected] : null;
  const dummyOpts = {
    build, height, acc,
    size: sel && sizes[sel.id] !== undefined ? SIZES.indexOf(sizes[sel.id]) : undefined,
  };

  return (
    <section
      ref={stageRef}
      className="stage"
      tabIndex={0}
      aria-label="Clothes rail. Drag or use the arrow keys to browse, Enter to open a piece."
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onPointerLeave={onPointerLeave}
      onKeyDown={onKeyDown}
    >
      <div className={selected !== null ? "rail open" : "rail"} />
      <div>
        {list.map((p, i) => (
          <div key={p.id} className="shadow" ref={(el) => { shadowEls.current[i] = el; }} />
        ))}
      </div>
      <div className="pieces">
        {list.map((p, i) => (
          <div key={p.id} className="piece" ref={(el) => { pieceEls.current[i] = el; }}>
            <div className="card" ref={(el) => { cardEls.current[i] = el; }}>
              <div className="face f-front" dangerouslySetInnerHTML={{ __html: faces[i]?.front ?? "" }} />
              <div className="face f-back" dangerouslySetInnerHTML={{ __html: faces[i]?.back ?? "" }} />
              {i === selected && view === "dummy" && (
                <>
                  <div className="face f-dummy" dangerouslySetInnerHTML={{ __html: dummySVG(p, "front", p.id, dummyOpts) }} />
                  <div className="face f-dummyback" dangerouslySetInnerHTML={{ __html: dummySVG(p, "back", p.id, dummyOpts) }} />
                </>
              )}
            </div>
            <div className="hit" data-i={i} role="button" tabIndex={-1} aria-label={`${p.name}, ${naira(p.price)}`} />
          </div>
        ))}
      </div>
    </section>
  );
}
