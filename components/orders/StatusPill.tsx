import type { OrderView } from "@/lib/server/orders";

const LABEL: Record<OrderView["status"], string> = { paid: "Paid", pending: "Awaiting payment", failed: "Payment failed" };

export function StatusPill({ status }: { status: OrderView["status"] }) {
  return <span className={`pill ${status}`}>{LABEL[status]}</span>;
}
