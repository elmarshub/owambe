"use client";
import Link from "next/link";
import { useShop } from "@/store/shop";
import { useUi } from "@/store/ui";

export function HomeLogo() {
  return (
    <Link
      className="mark"
      href="/"
      aria-label="owambe. home"
      onClick={(ev) => {
        if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;
        const ui = useUi.getState();
        ui.closeBag();
        ui.closeSheet();
        useShop.getState().reset();
        if (!document.querySelector(".stage")) return;
        ev.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      owambe<i>.</i>
    </Link>
  );
}
