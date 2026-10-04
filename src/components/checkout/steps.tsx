"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AREAS, DELIVERY, accLabel, findPiece, naira, unitPrice, type Speed } from "@/lib/catalog";
import { AUTH_LIVE, PAY_LIVE } from "@/lib/config";
import { PaymentCancelled, pay, sendCode, signInWithGoogle, verifyCode, type DeliveryDetails, type PaidOrder } from "@/lib/shop-client";
import { bagSubtotal, useBag } from "@/store/bag";
import { useShop } from "@/store/shop";
import { useUi } from "@/store/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RESEND_SECONDS = AUTH_LIVE ? 60 : 30; // Supabase allows one code per email per minute by default

function Busy({ label }: { label: string }) {
  return <><span className="spin" aria-hidden="true" />{label}</>;
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z" /><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" /><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z" /><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z" /></svg>
);

/* ── 1. Email ─────────────────────────────────────────────── */
export function EmailStep({ email, setEmail, onSent, onGoogle }: { email: string; setEmail: (v: string) => void; onSent: () => void; onGoogle: () => void }) {
  const setUser = useUi((u) => u.setUser);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState<"" | "code" | "google">("");

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const v = email.trim();
    if (!EMAIL_RE.test(v)) { setErr(v ? "That email looks incomplete. Check it and try again." : "Enter your email to get a code."); return; }
    setErr(""); setBusy("code");
    try { await sendCode(v); setEmail(v); onSent(); }
    catch (e) { setErr((e as Error).message); }
    finally { setBusy(""); }
  };
  const google = async () => {
    setBusy("google"); setErr("");
    try {
      const u = await signInWithGoogle();
      if (u) { setUser(u); onGoogle(); }
    } catch (e) { setErr((e as Error).message); setBusy(""); }
    if (!AUTH_LIVE) setBusy("");
  };

  return (
    <form className="step" noValidate onSubmit={submit}>
      <h4 id="sheet-title">Sign in to check out.</h4>
      <p className="small">Your bag is saved. We&apos;ll email you a 6-digit code, so there&apos;s no password to remember.</p>
      <label className="f">Email
        <input className={err ? "inp bad" : "inp"} type="email" autoComplete="email" placeholder="ada@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} />
      </label>
      <p className="err" role="alert">{err}</p>
      <button className="primary" type="submit" disabled={!!busy}>{busy === "code" ? <Busy label="Sending code…" /> : "Send code"}</button>
      <div className="or">or</div>
      <button className="secondary" type="button" disabled={!!busy} onClick={google}>{busy === "google" ? <Busy label="Opening Google…" /> : <><GoogleIcon />Continue with Google</>}</button>
      <p className="small center">New here? Your first code creates your account.</p>
    </form>
  );
}

/* ── 2. Code ──────────────────────────────────────────────── */
export function CodeStep({ email, onVerified, onChangeEmail }: { email: string; onVerified: () => void; onChangeEmail: () => void }) {
  const setUser = useUi((u) => u.setUser);
  const showToast = useUi((u) => u.showToast);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);
  const [checking, setChecking] = useState(false);
  const [left, setLeft] = useState(RESEND_SECONDS);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const code = digits.join("");

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const check = async (c: string) => {
    if (checking || c.length !== 6) return;
    setChecking(true);
    try {
      const u = await verifyCode(email, c);
      setUser(u);
      onVerified();
    } catch (e) {
      setErr((e as Error).message);
      setShake(true); setTimeout(() => setShake(false), 400);
      refs.current[5]?.focus();
    } finally { setChecking(false); }
  };

  const put = (i: number, raw: string) => {
    const v = raw.replace(/\D/g, "");
    setErr("");
    if (v.length > 1) { // pasted or autofilled
      const next = v.slice(0, 6).split("");
      const d = [...digits]; next.forEach((c, k) => { if (k < 6) d[k] = c; });
      setDigits(d);
      refs.current[Math.min(5, next.length)]?.focus();
      if (d.join("").length === 6) setTimeout(() => check(d.join("")), 250);
      return;
    }
    const d = [...digits]; d[i] = v.slice(-1); setDigits(d);
    if (v && i < 5) refs.current[i + 1]?.focus();
    if (d.join("").length === 6) setTimeout(() => check(d.join("")), 250);
  };
  const key = (i: number, ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === "Backspace" && !digits[i] && i > 0) { const d = [...digits]; d[i - 1] = ""; setDigits(d); refs.current[i - 1]?.focus(); ev.preventDefault(); }
    if (ev.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (ev.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
  };
  const resend = async () => {
    setDigits(["", "", "", "", "", ""]); setErr("");
    try { await sendCode(email); showToast("A new code is on its way"); setLeft(RESEND_SECONDS); }
    catch (e) { setErr((e as Error).message); }
    refs.current[0]?.focus();
  };

  return (
    <form className="step" noValidate onSubmit={(e) => { e.preventDefault(); check(code); }}>
      <h4 id="sheet-title">Check your email.</h4>
      <p className="small">We sent a 6-digit code to <b className="ink">{email}</b>. It works for 10 minutes.</p>
      <div className={`otp${err ? " bad" : ""}${shake ? " shake" : ""}`} role="group" aria-label="6-digit code">
        {digits.map((d, i) => (
          <input key={i} ref={(el) => { refs.current[i] = el; }} inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"} aria-label={`Digit ${i + 1}`}
            value={d} onChange={(e) => put(i, e.target.value)} onKeyDown={(e) => key(i, e)} />
        ))}
      </div>
      <p className="err" role="alert">{err}</p>
      <div className="linkrow">
        <button className="link" type="button" disabled={left > 0} onClick={resend}>{left > 0 ? `Resend in 0:${String(left).padStart(2, "0")}` : "Resend code"}</button>
        <button className="link" type="button" onClick={onChangeEmail}>Use a different email</button>
      </div>
      <button className="primary" type="submit" disabled={checking || code.length !== 6}>{checking ? <Busy label="Checking…" /> : "Verify"}</button>
      {!AUTH_LIVE && <p className="small center">Demo mode: any 6 digits sign you in, except 000000.</p>}
    </form>
  );
}

/* ── 3. Delivery ──────────────────────────────────────────── */
export function DetailsStep({ details, setDetails, onNext }: { details: DeliveryDetails; setDetails: (d: DeliveryDetails) => void; onNext: () => void }) {
  const user = useUi((u) => u.user);
  const [err, setErr] = useState<{ field: keyof DeliveryDetails; text: string } | null>(null);
  const set = (k: keyof DeliveryDetails, v: string) => { setDetails({ ...details, [k]: v }); setErr(null); };

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const phone = details.phone.replace(/\D/g, "");
    const need: [keyof DeliveryDetails, string][] = [["name", "your name"], ["phone", "a phone number for the rider"], ["address", "your street address"]];
    for (const [k, what] of need) if (!String(details[k]).trim()) { setErr({ field: k, text: `Add ${what} so we can deliver.` }); return; }
    const local = phone.length === 11 && phone.startsWith("0") ? phone.slice(1) : phone;
    if (local.length !== 10) { setErr({ field: "phone", text: "Add a full 10-digit phone number so we can deliver." }); return; }
    setDetails({ ...details, phone: local, name: details.name.trim(), address: details.address.trim() });
    onNext();
  };
  const cls = (k: keyof DeliveryDetails) => (err?.field === k ? "inp bad" : "inp");

  return (
    <form className="step" noValidate onSubmit={submit}>
      <h4 id="sheet-title">Where should it go?</h4>
      <p className="small">{user ? `Signed in${user.google ? " with Google" : ""} as ${user.email}.` : "Signed in."}</p>
      <div className="grid2">
        <label className="f">Full name<input className={cls("name")} autoComplete="name" placeholder="Ada Okafor" value={details.name} onChange={(e) => set("name", e.target.value)} /></label>
        <label className="f">Phone<span className="phone"><span>+234</span><input className={cls("phone")} inputMode="tel" autoComplete="tel-national" placeholder="803 000 0000" value={details.phone} onChange={(e) => set("phone", e.target.value)} /></span></label>
      </div>
      <label className="f">Address<input className={cls("address")} autoComplete="street-address" placeholder="House number and street" value={details.address} onChange={(e) => set("address", e.target.value)} /></label>
      <label className="f">Area in Lagos
        <select className="inp" value={details.area} onChange={(e) => set("area", e.target.value)}>
          {AREAS.map((a) => <option key={a}>{a}</option>)}
        </select>
      </label>
      <div className="opts">
        {(Object.keys(DELIVERY) as Speed[]).map((k) => (
          <label className="opt" key={k}>
            <input type="radio" name="speed" checked={details.speed === k} onChange={() => set("speed", k)} />
            <span><b>{DELIVERY[k].label}</b> · {DELIVERY[k].note}</span><b>{naira(DELIVERY[k].fee)}</b>
          </label>
        ))}
      </div>
      <p className="err" role="alert">{err?.text}</p>
      <button className="primary" type="submit">Continue to payment</button>
    </form>
  );
}

/* ── 4. Review and pay ────────────────────────────────────── */
export function PayStep({ details, onPaid }: { details: DeliveryDetails; onPaid: (o: PaidOrder) => void }) {
  const items = useBag((b) => b.items);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const sub = bagSubtotal(items);
  const fee = DELIVERY[details.speed].fee;

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setBusy(true); setErr("");
    try { onPaid(await pay(items, details)); }
    catch (e) { setErr(e instanceof PaymentCancelled ? e.message : (e as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <form className="step" noValidate onSubmit={submit}>
      <h4 id="sheet-title">One last look.</h4>
      <div>
        {items.map((b) => {
          const p = findPiece(b.id)!;
          return (
            <div className="row payline" key={`${b.id}-${b.size}-${b.acc}`}>
              <span><b>{p.name}</b><br /><span className="muted">{p.colour} · {b.size}{b.acc ? ` · ${accLabel(b.id, b.acc)}` : ""} · Qty {b.qty}</span></span>
              <b>{naira(unitPrice(p, b.acc) * b.qty)}</b>
            </div>
          );
        })}
      </div>
      <div className="totals">
        <div className="row"><span>Subtotal</span><span>{naira(sub)}</span></div>
        <div className="row"><span>Delivery</span><span>{naira(fee)}</span></div>
        <div className="row big"><span>Total</span><span>{naira(sub + fee)}</span></div>
      </div>
      <p className="small">Delivering to {details.name}, {details.address}, {details.area}. {details.speed === "exp" ? "Express, next day." : "Standard, 2 to 4 days."}</p>
      <p className="err" role="alert">{err}</p>
      <button className="primary" type="submit" disabled={busy || !items.length}>{busy ? <Busy label="Opening Paystack…" /> : `Pay ${naira(sub + fee)} with Paystack`}</button>
      <p className="small center">{PAY_LIVE ? "Paystack opens its own secure window. Test mode: use Paystack's test card, no money is taken." : "Demo mode: payment is simulated, no money is taken."}</p>
    </form>
  );
}

/* ── 5. Done ──────────────────────────────────────────────── */
export function DoneStep({ order }: { order: PaidOrder }) {
  const clear = useBag((b) => b.clear);
  const closeSheet = useUi((u) => u.closeSheet);
  const deselect = useShop((s) => s.deselect);

  // The order is placed, so the bag empties now (not only when the button is pressed).
  useEffect(() => { clear(); }, [clear]);

  return (
    <div className="step">
      <div className="tag">
        <div className="hole" />
        <div className="no">ORDER {order.ref}</div>
        <h5 id="sheet-title">It&apos;s yours.</h5>
        <p className="small">Your pieces are being pressed and packed. We&apos;ll text you when they leave.</p>
        <div className="totals tagtotals">
          {order.items.map((l, i) => <div className="row" key={i}><span>{l.name} · {l.size}{l.acc ? ` · ${accLabel(l.id, l.acc)}` : ""}{l.qty > 1 ? ` × ${l.qty}` : ""}</span><span>{naira(l.total)}</span></div>)}
          <div className="row"><span>Delivery</span><span>{naira(order.delivery)}</span></div>
          <div className="row big"><span>Paid (test)</span><span>{naira(order.total)}</span></div>
        </div>
      </div>
      <button className="primary" type="button" onClick={() => { closeSheet(); deselect(); }}>Back to the rail</button>
      {!order.demo && <a className="secondary" href="/orders">View my orders</a>}
    </div>
  );
}
