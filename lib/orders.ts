import { z } from "zod";
import { AREAS, DELIVERY, MAX_QTY, SIZES, findPiece, unitPrice } from "@/lib/catalog";

export const CheckoutInput = z.object({
  items: z.array(z.object({
    id: z.string(),
    size: z.enum(SIZES),
    qty: z.number().int().min(1).max(MAX_QTY),
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

export function priceOrder(input: CheckoutInput) {
  const lines: PricedLine[] = input.items.map((it) => {
    const p = findPiece(it.id);
    if (!p) throw new Error(`Unknown piece: ${it.id}`);
    const unit = unitPrice(p, it.acc);
    return { id: p.id, name: p.name, colour: p.colour, size: it.size, qty: it.qty, acc: it.acc, unit, total: unit * it.qty };
  });
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const delivery = DELIVERY[input.delivery.speed].fee;
  return { lines, subtotal, delivery, total: subtotal + delivery };
}

export function orderRef() {
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `OW-${t}${r}`;
}
