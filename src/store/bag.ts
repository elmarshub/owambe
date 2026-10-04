"use client";
// The bag lives in localStorage, so it survives a refresh and the Google sign-in redirect.
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { findPiece, type Size } from "@/lib/catalog";

export interface BagItem {
  id: string;
  size: Size;
  qty: number;
  acc: boolean;
}

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
        if (ex >= 0) items[ex] = { ...items[ex], qty: items[ex].qty + 1 };
        else items.push({ ...it, qty: 1 });
        set({ items });
      },
      change: (index, delta) => {
        const items = [...get().items];
        const qty = items[index].qty + delta;
        if (qty <= 0) items.splice(index, 1);
        else items[index] = { ...items[index], qty };
        set({ items });
      },
      clear: () => set({ items: [] }),
    }),
    { name: "owambe-bag", skipHydration: true },
  ),
);

export const bagCount = (items: BagItem[]) => items.reduce((s, b) => s + b.qty, 0);
export const bagSubtotal = (items: BagItem[]) => items.reduce((s, b) => s + (findPiece(b.id)?.price ?? 0) * b.qty, 0);
