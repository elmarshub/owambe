import { z } from "zod";
import { AREAS, DELIVERY, SIZES, findPiece } from "./catalog";

/** What the browser sends when you press Pay. Prices are NOT accepted from the browser. */
export const CheckoutInput = z.object({
  items: z.array(z.object({
    id: z.string(),
    size: z.enum(SIZES),
    qty: z.number().int().min(1).max(10),
    acc: z.boolean(),
  })).min(1).max(20),
  delivery: z.object({
    name: z.string().trim().min(2).max(80),
    phone: z.string().regex(/^\d{10}$/, "10-digit phone number"),
    address: z.string().trim().min(4).max(200),
    area: z.enum(AREAS),
    speed: z.enum(["std", "exp"]),
  }),
});
export type CheckoutInput = z.infer<typeof CheckoutInput>;

export interface PricedLine {
  id: string;
  name: string;
  colour: string;
  size: string;
  qty: number;
  acc: boolean;
  unit: number;
  total: number;
}

/** Re-prices the bag from the catalogue. Throws if a piece doesn't exist. Amounts in naira. */
export function priceOrder(input: CheckoutInput) {
  const lines: PricedLine[] = input.items.map((it) => {
    const p = findPiece(it.id);
    if (!p) throw new Error(`Unknown piece: ${it.id}`);
    return { id: p.id, name: p.name, colour: p.colour, size: it.size, qty: it.qty, acc: it.acc, unit: p.price, total: p.price * it.qty };
  });
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const delivery = DELIVERY[input.delivery.speed].fee;
  return { lines, subtotal, delivery, total: subtotal + delivery };
}

/** A short, readable, unique order reference, also used as the Paystack reference. */
export function orderRef() {
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `OW-${t}${r}`;
}
