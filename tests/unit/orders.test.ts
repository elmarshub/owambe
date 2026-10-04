import { describe, expect, it } from "vitest";
import { ACC_PRICE } from "@/lib/catalog";
import { CheckoutInput, orderRef, priceOrder } from "@/lib/orders";

const valid = {
  items: [{ id: "royal", size: "XL", qty: 2, acc: true }, { id: "sand", size: "L", qty: 1, acc: false }],
  delivery: { name: "Ada Okafor", phone: "8030000000", address: "12 Admiralty Way", area: "Lekki", speed: "exp" },
};

describe("checkout pricing", () => {
  it("prices from the catalogue, not the browser", () => {
    const o = priceOrder(CheckoutInput.parse(valid));
    expect(o.subtotal).toBe((185000 + 8000) * 2 + 78000);
    expect(o.delivery).toBe(9000);
    expect(o.total).toBe((185000 + 8000) * 2 + 78000 + 9000);
  });
  it("charges for the matching fila or gele", () => {
    const one = (id: string, acc: boolean) => priceOrder(CheckoutInput.parse({ ...valid, items: [{ id, size: "L", qty: 1, acc }] })).subtotal;
    expect(one("royal", true) - one("royal", false)).toBe(ACC_PRICE.fila);
    expect(one("coral", true) - one("coral", false)).toBe(ACC_PRICE.gele);
  });
  it("ignores a price sent by the browser", () => {
    const tampered = { ...valid, items: [{ ...valid.items[0], price: 1 }] };
    expect(priceOrder(CheckoutInput.parse(tampered)).subtotal).toBe((185000 + 8000) * 2);
  });
  it("rejects unknown pieces and bad phone numbers", () => {
    expect(() => priceOrder(CheckoutInput.parse({ ...valid, items: [{ id: "nope", size: "L", qty: 1, acc: false }] }))).toThrow();
    expect(CheckoutInput.safeParse({ ...valid, delivery: { ...valid.delivery, phone: "123" } }).success).toBe(false);
  });
  it("makes readable references", () => {
    expect(orderRef()).toMatch(/^OW-[A-Z0-9]{9}$/);
  });
});
