"use client";
import { create } from "zustand";
import type { ShopUser } from "@/lib/shop-client";

interface UiState {
  user: ShopUser | null;
  setUser: (u: ShopUser | null) => void;
  bagOpen: boolean;
  sheetOpen: boolean;
  toast: { text: string; id: number } | null;
  openBag: () => void;
  closeBag: () => void;
  openSheet: () => void;
  closeSheet: () => void;
  showToast: (text: string) => void;
  hideToast: () => void;
}

export const useUi = create<UiState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  bagOpen: false,
  sheetOpen: false,
  toast: null,
  openBag: () => set({ bagOpen: true, toast: null }),
  closeBag: () => set({ bagOpen: false }),
  openSheet: () => set({ sheetOpen: true, bagOpen: false }),
  closeSheet: () => set({ sheetOpen: false }),
  showToast: (text) => set({ toast: { text, id: Date.now() } }),
  hideToast: () => set({ toast: null }),
}));
