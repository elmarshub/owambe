"use client";
import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** False during the server render and the first client render, true after. Avoids hydration mismatches for localStorage data. */
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}
