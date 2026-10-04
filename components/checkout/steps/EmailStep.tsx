"use client";
import { useState, type FormEvent } from "react";
import { AUTH_LIVE } from "@/lib/config";
import { sendCode, signInWithGoogle } from "@/lib/client/auth";
import { useUi } from "@/store/ui";
import { Busy } from "@/components/ui/Busy";
import { GoogleIcon } from "@/components/ui/GoogleIcon";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
