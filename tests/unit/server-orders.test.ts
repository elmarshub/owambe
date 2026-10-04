import { describe, expect, it } from "vitest";
import { publicOrder, type OrderWithItems } from "@/lib/server/orders";

const order: OrderWithItems = {
  id: "0b4f2c1e-0000-4000-8000-000000000001", ref: "OW-TEST12345", userId: "u1", email: "ada@example.com", status: "paid",
  subtotal: 193000, deliveryFee: 4500, total: 197500, deliveryName: "Ada Okafor", phone: "8030000000", address: "12 Admiralty Way",
  area: "Lekki", speed: "std", paystack: { channel: "card" }, paidAt: new Date("2026-10-04T12:00:00Z"),
  createdAt: new Date("2026-10-04T11:59:00Z"), updatedAt: new Date("2026-10-04T12:00:00Z"),
  items: [{ id: "i1", orderId: "0b4f2c1e-0000-4000-8000-000000000001", pieceId: "royal", name: "Royal Agbada", colour: "Royal blue aso-oke", size: "L", qty: 1, addOn: true, unitPrice: 193000, total: 193000 }],
};

describe("publicOrder", () => {
  it("sends the shopper their lines and totals in the shape the browser expects", () => {
    expect(publicOrder(order)).toEqual({
      ref: "OW-TEST12345", status: "paid",
      items: [{ id: "royal", name: "Royal Agbada", size: "L", qty: 1, acc: true, total: 193000 }],
      subtotal: 193000, delivery: 4500, total: 197500, paid_at: "2026-10-04T12:00:00.000Z",
    });
  });
  it("leaves out delivery details, contact info and Paystack internals", () => {
    const json = JSON.stringify(publicOrder(order));
    for (const secret of ["Admiralty", "8030000000", "ada@example.com", "card", "u1"]) expect(json).not.toContain(secret);
  });
});
