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

export const ORDERS_PER_PAGE = 4;

export async function listOrders(userId: string, page: number) {
  const where = { userId };
  const [total, orders] = await Promise.all([
    db().order.count({ where }),
    db().order.findMany({ where, include: withItems, orderBy: { createdAt: "desc" }, skip: (page - 1) * ORDERS_PER_PAGE, take: ORDERS_PER_PAGE }),
  ]);
  return { total, pages: Math.max(1, Math.ceil(total / ORDERS_PER_PAGE)), orders };
}

const lagosTime = (d: Date) => d.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" });

export interface OrderView {
  ref: string;
  status: OrderWithItems["status"];
  placedAt: string;
  paidAt: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  delivery: { name: string; phone: string; address: string; area: string; speed: OrderWithItems["speed"] };
  items: { id: string; pieceId: string; name: string; colour: string; size: string; qty: number; addOn: boolean; unitPrice: number; total: number }[];
}

export const toOrderView = (o: OrderWithItems): OrderView => ({
  ref: o.ref,
  status: o.status,
  placedAt: lagosTime(o.createdAt),
  paidAt: o.paidAt ? lagosTime(o.paidAt) : null,
  subtotal: o.subtotal,
  deliveryFee: o.deliveryFee,
  total: o.total,
  delivery: { name: o.deliveryName, phone: o.phone, address: o.address, area: o.area, speed: o.speed },
  items: o.items.map((l) => ({ id: l.id, pieceId: l.pieceId, name: l.name, colour: l.colour, size: l.size, qty: l.qty, addOn: l.addOn, unitPrice: l.unitPrice, total: l.total })),
});

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
  const fresh = await getOrder(order.ref);
  if (fresh?.status !== "paid") return { ok: false as const, reason: `Order is ${fresh?.status ?? "missing"}` };
  return { ok: true as const, order: fresh };
}

export const publicOrder = (o: OrderWithItems) => ({
  ref: o.ref,
  status: o.status,
  items: o.items.map((l) => ({ id: l.pieceId, name: l.name, size: l.size, qty: l.qty, acc: l.addOn, total: l.total })),
  subtotal: o.subtotal,
  delivery: o.deliveryFee,
  total: o.total,
  paid_at: o.paidAt?.toISOString() ?? null,
});
