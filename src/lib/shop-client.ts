"use client";
// Sign-in and payment from the browser. Each function has a live path (Supabase / Paystack)
// and a demo path that behaves like the prototype, chosen by which keys are set.
import { AUTH_LIVE, PAY_LIVE } from "./config";
import { DELIVERY, findPiece, unitPrice, type Speed } from "./catalog";
import type { BagItem } from "@/store/bag";
import { supabaseBrowser } from "./supabase/client";

export interface ShopUser { email: string; google?: boolean }
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function currentUser(): Promise<ShopUser | null> {
  if (!AUTH_LIVE) return null;
  const { data } = await supabaseBrowser().auth.getUser();
  const u = data.user;
  return u?.email ? { email: u.email, google: u.app_metadata?.provider === "google" } : null;
}

export function onUserChange(cb: (u: ShopUser | null) => void) {
  if (!AUTH_LIVE) return () => {};
  const { data } = supabaseBrowser().auth.onAuthStateChange((_e, session) => {
    const u = session?.user;
    cb(u?.email ? { email: u.email, google: u.app_metadata?.provider === "google" } : null);
  });
  return () => data.subscription.unsubscribe();
}

/** Emails a 6-digit code. New emails get an account on first sign-in. */
export async function sendCode(email: string): Promise<void> {
  if (!AUTH_LIVE) return wait(900);
  const { error } = await supabaseBrowser().auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) throw new Error(error.status === 429 ? "Too many codes requested. Wait a minute and try again." : error.message);
}

export async function verifyCode(email: string, token: string): Promise<ShopUser> {
  if (!AUTH_LIVE) {
    await wait(800);
    if (token === "000000") throw new Error("That code doesn't match. Check the latest email or resend it.");
    return { email };
  }
  const { data, error } = await supabaseBrowser().auth.verifyOtp({ email, token, type: "email" });
  if (error || !data.user?.email) throw new Error("That code doesn't match or has expired. Check the latest email or resend it.");
  return { email: data.user.email };
}

/** Live: redirects to Google and back to /?checkout=1. Demo: pretends. */
export async function signInWithGoogle(): Promise<ShopUser | null> {
  if (!AUTH_LIVE) {
    await wait(1000);
    return { email: "you@gmail.com", google: true };
  }
  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/?checkout=1")}`;
  const { error } = await supabaseBrowser().auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
  if (error) throw new Error(error.message);
  return null; // the browser is leaving for Google
}

export async function signOut() {
  if (AUTH_LIVE) await supabaseBrowser().auth.signOut();
}

export interface DeliveryDetails { name: string; phone: string; address: string; area: string; speed: Speed }
export interface PaidOrder {
  ref: string;
  items: { id: string; name: string; size: string; qty: number; acc: boolean; total: number }[];
  subtotal: number;
  delivery: number;
  total: number;
  demo: boolean;
}

export class PaymentCancelled extends Error {}

/** The bag priced in the browser, for display only. The server re-prices anything that gets charged. */
function summarise(items: BagItem[], speed: Speed) {
  const lines = items.flatMap((b) => {
    const p = findPiece(b.id);
    return p ? [{ id: b.id, name: p.name, size: b.size, qty: b.qty, acc: b.acc, total: unitPrice(p, b.acc) * b.qty }] : [];
  });
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const delivery = DELIVERY[speed].fee;
  return { items: lines, subtotal, delivery, total: subtotal + delivery };
}

/**
 * Live: the server saves the order and starts the transaction, Paystack's popup takes the card,
 * then the server verifies with Paystack before we show "It's yours".
 */
export async function pay(items: BagItem[], delivery: DeliveryDetails): Promise<PaidOrder> {
  if (!PAY_LIVE) {
    await wait(1300);
    return { ref: "OW-DEMO" + String(Math.floor(1000 + Math.random() * 9000)), ...summarise(items, delivery.speed), demo: true };
  }

  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: items.map(({ id, size, qty, acc }) => ({ id, size, qty, acc })), delivery }),
  });
  const start = await res.json();
  if (!res.ok) throw new Error(start.error ?? "Couldn't start the payment.");

  const { default: PaystackPop } = await import("@paystack/inline-js");
  await new Promise<void>((resolve, reject) => {
    new PaystackPop().resumeTransaction(start.accessCode, {
      onSuccess: () => resolve(),
      onCancel: () => reject(new PaymentCancelled("Payment cancelled. Your bag is still here.")),
      onError: (e) => reject(new Error(e.message || "Paystack couldn't load.")),
    });
  });

  const v = await fetch("/api/paystack/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference: start.reference }),
  });
  const done = await v.json();
  if (!v.ok) throw new Error(done.error ?? "Couldn't confirm the payment.");
  const o = done.order;
  return { ref: o.ref, items: o.items, subtotal: o.subtotal, delivery: o.delivery, total: o.total, demo: false };
}
