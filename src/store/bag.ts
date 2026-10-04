"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MAX_QTY, cleanBag, findPiece, unitPrice, type BagLine } from "@/lib/catalog";

export type BagItem = BagLine;

interface BagState {
  items: BagItem[];
  add: (item: Omit<BagItem, "qty">) => void;
  change: (index: number, delta: number) => void;
  clear: () => void;
}

export const useBag = create<BagState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (it) => {
        const items = [...get().items];
        const ex = items.findIndex((b) => b.id === it.id && b.size === it.size && b.acc === it.acc);
        if (ex >= 0) items[ex] = { ...items[ex], qty: Math.min(MAX_QTY, items[ex].qty + 1) };
        else items.push({ ...it, qty: 1 });
        set({ items });
      },
      change: (index, delta) => {
        const items = [...get().items];
        const qty = items[index].qty + delta;
        if (qty <= 0) items.splice(index, 1);
        else items[index] = { ...items[index], qty: Math.min(MAX_QTY, qty) };
        set({ items });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: "owambe-bag",
      skipHydration: true,
      merge: (saved, current) => ({ ...current, items: cleanBag((saved as Partial<BagState> | undefined)?.items) }),
    },
  ),
);

export const bagCount = (items: BagItem[]) => items.reduce((s, b) => s + b.qty, 0);
export const bagSubtotal = (items: BagItem[]) =>
  items.reduce((s, b) => {
    const p = findPiece(b.id);
    return s + (p ? unitPrice(p, b.acc) * b.qty : 0);
  }, 0);
