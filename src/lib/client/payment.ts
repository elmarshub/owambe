"use client";
import { PAY_LIVE } from "@/lib/config";
import { DELIVERY, findPiece, unitPrice, type Speed } from "@/lib/catalog";
import type { BagItem } from "@/store/bag";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface DeliveryDetails { name: string; phone: string; address: string; area: string; speed: Speed }
export interface PaidOrder {
  ref: string;
  items: { id: string; name: string; size: string; qty: number; acc: boolean; total: number }[];
  subtotal: number;
  delivery: number;
  total: number;
  demo: boolean;
  confirming?: boolean;
}

export class PaymentCancelled extends Error {}

function summarise(items: BagItem[], speed: Speed) {
  const lines = items.flatMap((b) => {
    const p = findPiece(b.id);
    return p ? [{ id: b.id, name: p.name, size: b.size, qty: b.qty, acc: b.acc, total: unitPrice(p, b.acc) * b.qty }] : [];
  });
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const delivery = DELIVERY[speed].fee;
  return { items: lines, subtotal, delivery, total: subtotal + delivery };
}


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
  const start = await res.json().catch(() => ({}));
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
  }).catch(() => null);
  const done = v ? await v.json().catch(() => ({})) : {};
  if (v?.ok) {
    const o = done.order;
    return { ref: o.ref, items: o.items, subtotal: o.subtotal, delivery: o.delivery, total: o.total, demo: false };
  }
  if (v?.status === 402) throw new Error(done.error ?? "Paystack didn't confirm the payment.");
  if (v && v.status >= 400 && v.status < 500) {
    throw new Error(
      `${done.error ?? "We couldn't check the payment."} Order ${start.reference}: your payment may have gone through, so please don't pay again until it shows in My orders.`,
    );
  }
  return { ref: start.reference, ...summarise(items, delivery.speed), demo: false, confirming: true };
}
