import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { VerifiedTransaction } from "@/lib/paystack";

export interface OrderRow {
  id: string;
  ref: string;
  user_id: string | null;
  email: string;
  items: { id: string; name: string; colour: string; size: string; qty: number; acc: boolean; unit: number; total: number }[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery: { name: string; phone: string; address: string; area: string; speed: "std" | "exp" };
  status: "pending" | "paid" | "failed";
  paid_at: string | null;
  created_at: string;
}

export async function getOrder(ref: string) {
  const { data, error } = await supabaseAdmin().from("orders").select("*").eq("ref", ref).maybeSingle();
  if (error) throw error;
  return data as OrderRow | null;
}

/**
 * Marks an order paid if Paystack's verified transaction matches it exactly (status, currency, amount).
 * Safe to call twice (from the browser's verify call and from the webhook): it only moves pending → paid.
 */
export async function settleOrder(order: OrderRow, tx: VerifiedTransaction) {
  const matches = tx.status === "success" && tx.currency === "NGN" && tx.amount === order.total * 100;
  if (!matches) return { ok: false as const, reason: tx.status === "success" ? "Amount mismatch" : `Payment ${tx.status}` };
  if (order.status === "paid") return { ok: true as const, order };
  const { data, error } = await supabaseAdmin()
    .from("orders")
    .update({ status: "paid", paid_at: tx.paid_at ?? new Date().toISOString(), paystack: { reference: tx.reference, channel: tx.channel, amount: tx.amount, paid_at: tx.paid_at } })
    .eq("ref", order.ref)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return { ok: true as const, order: (data as OrderRow | null) ?? { ...order, status: "paid" as const } };
}

/** The slice of an order that's safe to send back to the shopper's browser. */
export const publicOrder = (o: OrderRow) => ({
  ref: o.ref, status: o.status, items: o.items, subtotal: o.subtotal, delivery: o.delivery_fee, total: o.total, paid_at: o.paid_at,
});
