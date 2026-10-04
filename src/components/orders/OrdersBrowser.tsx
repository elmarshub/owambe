"use client";
import { useCallback, useState } from "react";
import type { OrderView } from "@/lib/server/orders";
import { OrderCard } from "@/components/orders/OrderCard";
import { OrderModal } from "@/components/orders/OrderModal";

export function OrdersBrowser({ orders }: { orders: OrderView[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const current = orders.find((o) => o.ref === open);

  return (
    <>
      <div className="order-grid">
        {orders.map((o) => <OrderCard key={o.ref} order={o} onOpen={() => setOpen(o.ref)} />)}
      </div>
      {current && <OrderModal order={current} onClose={close} />}
    </>
  );
}
