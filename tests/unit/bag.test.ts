import { describe, expect, it } from "vitest";
import { MAX_QTY, cleanBag } from "@/lib/catalog";

describe("cleanBag", () => {
  it("keeps lines that match the catalogue", () => {
    expect(cleanBag([{ id: "royal", size: "XL", qty: 2, acc: true }])).toEqual([{ id: "royal", size: "XL", qty: 2, acc: true }]);
  });
  it("drops pieces and sizes that no longer exist, and junk", () => {
    const saved = [
      { id: "retired-piece", size: "L", qty: 1, acc: false },
      { id: "royal", size: "XXXL", qty: 1, acc: false },
      { id: "royal", size: "L", qty: 0, acc: false },
      { id: "royal", size: "L", qty: 1.5, acc: false },
      null,
      "royal",
    ];
    expect(cleanBag(saved)).toEqual([]);
    expect(cleanBag(undefined)).toEqual([]);
    expect(cleanBag({ items: [] })).toEqual([]);
  });
  it("caps quantity and treats a missing add-on flag as no add-on", () => {
    expect(cleanBag([{ id: "sand", size: "M", qty: 99 }])).toEqual([{ id: "sand", size: "M", qty: MAX_QTY, acc: false }]);
  });
});
