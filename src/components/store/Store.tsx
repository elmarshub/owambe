"use client";
import { useEffect } from "react";
import { Header } from "@/components/store/Header";
import { Rail } from "@/components/rail/Rail";
import { UnderRail } from "@/components/rail/UnderRail";
import { PiecePanel } from "@/components/fitting-room/PiecePanel";
import { BagDrawer } from "@/components/bag/BagDrawer";
import { CheckoutSheet } from "@/components/checkout/CheckoutSheet";
import { Toast } from "@/components/ui/Toast";
import { findPiece } from "@/lib/catalog";
import { AUTH_LIVE, PAY_LIVE } from "@/lib/config";
import { currentUser, onUserChange } from "@/lib/client/auth";
import { useBag } from "@/store/bag";
import { useShop } from "@/store/shop";
import { useUi } from "@/store/ui";

export function Store({ initialPiece }: { initialPiece?: string }) {
  const selected = useShop((s) => s.selected);
  const deselect = useShop((s) => s.deselect);
  const motion = useShop((s) => s.motion);
  const setMotion = useShop((s) => s.setMotion);
  const { bagOpen, sheetOpen, closeBag, closeSheet } = useUi();

  useEffect(() => {
    useBag.persist.rehydrate();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setMotion(false);
    const ui = useUi.getState();
    currentUser().then((u) => {
      ui.setUser(u);
      const params = new URLSearchParams(window.location.search);
      if (params.get("checkout") === "1" && u) ui.openSheet();
      if (params.get("signin") === "failed") ui.showToast("Google sign-in didn't finish. Try again.");
      if (params.has("checkout") || params.has("signin")) window.history.replaceState(null, "", window.location.pathname);
    });
    return onUserChange((u) => useUi.getState().setUser(u));
  }, [setMotion]);

  useEffect(() => {
    document.documentElement.dataset.motion = motion ? "on" : "off";
  }, [motion]);

  useEffect(() => {
    const piece = initialPiece ? findPiece(initialPiece) : undefined;
    if (!piece) return;
    const shop = useShop.getState();
    shop.setLine(piece.line);
    shop.select(useShop.getState().list.findIndex((p) => p.id === piece.id));
  }, [initialPiece]);

  useEffect(() => {
    return useShop.subscribe((s, prev) => {
      if (s.selected === prev.selected && s.list === prev.list) return;
      const path = s.selected !== null ? `/pieces/${s.list[s.selected].id}` : "/";
      if (window.location.pathname !== path) window.history.replaceState(null, "", path);
    });
  }, []);

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key !== "Escape") return;
      const ui = useUi.getState();
      if (ui.sheetOpen) ui.closeSheet();
      else if (ui.bagOpen) ui.closeBag();
      else useShop.getState().deselect();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="wrap">
        <Header />
        <main className="shop">
          <div className="titlebar">
            <h1>Ready for the <em>party.</em></h1>
            <div className="drop"><b>Drop 01</b> · sewn in Lagos. Every piece hangs with its price tag on.</div>
          </div>
          <button className="back" hidden={selected === null} onClick={deselect}>‹&nbsp; Return to the rail</button>
          <div className="scene">
            <Rail />
            <PiecePanel />
          </div>
          <UnderRail />
        </main>
        <footer>
          <span><b>owambe.</b> Concept store · example prices · {PAY_LIVE ? "Paystack test mode" : AUTH_LIVE ? "test payments only" : "demo mode"}</span>
          <button className="textbtn" aria-pressed={motion} onClick={() => setMotion(!motion)}>Motion: {motion ? "on" : "off"}</button>
        </footer>
      </div>
      <div className={bagOpen || sheetOpen ? "scrim show" : "scrim"} onClick={() => { closeBag(); closeSheet(); }} />
      <BagDrawer />
      <CheckoutSheet />
      <Toast />
    </>
  );
}
