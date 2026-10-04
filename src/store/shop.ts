"use client";

import { create } from "zustand";
import { linePieces, type Line, type Piece, type Size } from "@/lib/catalog";
import type { Build, Height } from "@/lib/fit";

export type View = "hanger" | "dummy";

interface ShopState {
  line: Line;
  list: Piece[];
  focus: number | null;
  hover: number | null;
  selected: number | null;
  spinBase: number;
  view: View;
  build: Build;
  height: Height;
  acc: boolean;
  sizes: Record<string, Size>;
  motion: boolean;

  setLine: (l: Line) => void;
  setFocus: (i: number | null) => void;
  setHover: (i: number | null) => void;
  select: (i: number) => void;
  deselect: () => void;
  step: (d: number) => void;
  setSpin: (deg: number) => void;
  showFront: () => void;
  showBack: () => void;
  setView: (v: View) => void;
  setBuild: (b: Build) => void;
  setHeight: (h: Height) => void;
  setAcc: (a: boolean) => void;
  setSize: (id: string, s: Size) => void;
  setMotion: (m: boolean) => void;
}

export const isBack = (deg: number) => ((Math.round(deg / 180) % 2) + 2) % 2 === 1;

export const useShop = create<ShopState>((set, get) => ({
  line: "men",
  list: linePieces("men"),
  focus: null,
  hover: null,
  selected: null,
  spinBase: 0,
  view: "hanger",
  build: 1,
  height: 1,
  acc: false,
  sizes: {},
  motion: true,

  setLine: (line) => {
    if (line === get().line) return;
    set({ line, list: linePieces(line), focus: null, hover: null, selected: null, spinBase: 0 });
  },
  setFocus: (focus) => set({ focus }),
  setHover: (hover) => set({ hover }),
  select: (i) => set({ selected: i, hover: null, focus: i, spinBase: 0 }),
  deselect: () => {
    const { selected } = get();
    if (selected === null) return;
    set({ selected: null, focus: selected, spinBase: 0 });
  },
  step: (d) => {
    const { selected, focus, list } = get();
    const n = list.length;
    if (selected !== null) {
      const i = (selected + d + n) % n;
      set({ selected: i, focus: i, spinBase: 0 });
      return;
    }
    set({ focus: focus === null ? Math.floor((n - 1) / 2) : Math.max(0, Math.min(n - 1, focus + d)) });
  },
  setSpin: (spinBase) => set({ spinBase }),
  showFront: () => set({ spinBase: Math.round(get().spinBase / 360) * 360 }),
  showBack: () => {
    const b = get().spinBase;
    if (isBack(b)) return;
    set({ spinBase: Math.round(b / 360) * 360 + 180 });
  },
  setView: (view) => {
    set({ view });
    kick(10);
  },
  setBuild: (build) => set({ build }),
  setHeight: (height) => set({ height }),
  setAcc: (acc) => set({ acc }),
  setSize: (id, s) => {
    set({ sizes: { ...get().sizes, [id]: s } });
    kick(6);
  },
  setMotion: (motion) => set({ motion }),
}));

export const motionBus = { kick: 0 };
export function kick(amount: number) {
  motionBus.kick += amount;
}
