import "server-only";
import { db } from "@/lib/server/db";
import type { CheckoutInput, PricedLine } from "@/lib/orders";
import type { VerifiedTransaction } from "@/lib/server/paystack";
import type { Prisma } from "@/generated/prisma/client";

const withItems = { items: { orderBy: { id: "asc" } } } satisfies Prisma.OrderInclude;
export type OrderWithItems = Prisma.OrderGetPayload<{ include: typeof withItems }>;

interface NewOrder {
  ref: string;
  userId: string;
  email: string;
  lines: PricedLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  delivery: CheckoutInput["delivery"];
}

/** Saves a pending order and its lines in one write. */
export function createOrder(o: NewOrder) {
  return db().order.create({
    data: {
      ref: o.ref,
      userId: o.userId,
      email: o.email,
      subtotal: o.subtotal,
      deliveryFee: o.deliveryFee,
      total: o.total,
      deliveryName: o.delivery.name,
      phone: o.delivery.phone,
      address: o.delivery.address,
      area: o.delivery.area,
      speed: o.delivery.speed,
      items: {
        create: o.lines.map((l) => ({
          pieceId: l.id, name: l.name, colour: l.colour, size: l.size, qty: l.qty, addOn: l.acc, unitPrice: l.unit, total: l.total,
        })),
      },
    },
  });
}

export function markFailed(ref: string) {
  return db().order.updateMany({ where: { ref, status: "pending" }, data: { status: "failed" } });
}

export function getOrder(ref: string) {
  return db().order.findUnique({ where: { ref }, include: withItems });
}

export function listOrders(userId: string) {
  return db().order.findMany({ where: { userId }, include: withItems, orderBy: { createdAt: "desc" }, take: 50 });
}

/**
 * Marks an order paid if Paystack's verified transaction matches it exactly (status, currency, amount).
 * Safe to call twice (from the browser's verify call and from the webhook): it only moves pending → paid.
 */
export async function settleOrder(order: OrderWithItems, tx: VerifiedTransaction) {
  const matches = tx.status === "success" && tx.currency === "NGN" && tx.amount === order.total * 100;
  if (!matches) return { ok: false as const, reason: tx.status === "success" ? "Amount mismatch" : `Payment ${tx.status}` };
  if (order.status === "paid") return { ok: true as const, order };
  await db().order.updateMany({
    where: { ref: order.ref, status: "pending" },
    data: {
      status: "paid",
      paidAt: tx.paid_at ? new Date(tx.paid_at) : new Date(),
      paystack: { reference: tx.reference, channel: tx.channel, amount: tx.amount, paid_at: tx.paid_at },
    },
  });
  // Read it back rather than assume: the other caller may have settled it, or it may not have been pending.
  const fresh = await getOrder(order.ref);
  if (fresh?.status !== "paid") return { ok: false as const, reason: `Order is ${fresh?.status ?? "missing"}` };
  return { ok: true as const, order: fresh };
}

/** The slice of an order that's safe to send back to the shopper's browser. */
export const publicOrder = (o: OrderWithItems) => ({
  ref: o.ref,
  status: o.status,
  items: o.items.map((l) => ({ id: l.pieceId, name: l.name, size: l.size, qty: l.qty, acc: l.addOn, total: l.total })),
  subtotal: o.subtotal,
  delivery: o.deliveryFee,
  total: o.total,
  paid_at: o.paidAt?.toISOString() ?? null,
});
