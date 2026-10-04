import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const API = "https://api.paystack.co";

function secret() {
  const s = process.env.PAYSTACK_SECRET_KEY;
  if (!s) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return s;
}

interface PaystackResponse<T> { status: boolean; message: string; data: T }

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API + path, {
    ...init,
    headers: { Authorization: `Bearer ${secret()}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  const body = (await res.json()) as PaystackResponse<T>;
  if (!res.ok || !body.status) throw new Error(`Paystack: ${body.message || res.statusText}`);
  return body.data;
}

/** Starts a transaction. Amount in naira (converted to kobo here). Returns the access code for the popup. */
export function initializeTransaction(o: { email: string; amountNaira: number; reference: string; metadata?: Record<string, unknown> }) {
  return call<{ authorization_url: string; access_code: string; reference: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({ email: o.email, amount: Math.round(o.amountNaira * 100), reference: o.reference, currency: "NGN", metadata: o.metadata }),
  });
}

export interface VerifiedTransaction {
  status: "success" | "failed" | "abandoned" | string;
  reference: string;
  amount: number; // kobo
  currency: string;
  paid_at: string | null;
  channel: string;
  customer: { email: string };
}

/** Asks Paystack directly whether a payment went through. Never trust the browser's word for it. */
export function verifyTransaction(reference: string) {
  return call<VerifiedTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

/** Checks a webhook really came from Paystack: HMAC-SHA512 of the raw body with the secret key. */
export function validWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = createHmac("sha512", secret()).update(rawBody).digest("hex");
  const a = Buffer.from(expected), b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
