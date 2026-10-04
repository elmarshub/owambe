"use client";
import { useEffect, useRef, useState } from "react";
import { AUTH_LIVE } from "@/lib/config";
import { sendCode, verifyCode } from "@/lib/client/auth";
import { useUi } from "@/store/ui";
import { Busy } from "@/components/ui/Busy";

const RESEND_SECONDS = AUTH_LIVE ? 60 : 30;

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
    if (v.length > 1) {
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
