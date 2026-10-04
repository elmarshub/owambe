"use client";
import { useEffect } from "react";
import { Header } from "./Header";
import { Rail } from "./rail/Rail";
import { UnderRail } from "./rail/UnderRail";
import { PiecePanel } from "./panel/PiecePanel";
import { BagDrawer } from "./bag/BagDrawer";
import { CheckoutSheet } from "./checkout/CheckoutSheet";
import { Toast } from "./ui/Toast";
import { AUTH_LIVE, PAY_LIVE } from "@/lib/config";
import { currentUser, onUserChange } from "@/lib/shop-client";
import { useBag } from "@/store/bag";
import { useShop } from "@/store/shop";
import { useUi } from "@/store/ui";

export function Store() {
  const selected = useShop((s) => s.selected);
  const deselect = useShop((s) => s.deselect);
  const motion = useShop((s) => s.motion);
  const setMotion = useShop((s) => s.setMotion);
  const { bagOpen, sheetOpen, closeBag, closeSheet } = useUi();

  useEffect(() => {
    // Bring back the saved bag, respect reduced motion, and pick up who's signed in.
    useBag.persist.rehydrate();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setMotion(false);
    const ui = useUi.getState();
    currentUser().then((u) => {
      ui.setUser(u);
      const params = new URLSearchParams(window.location.search);
      if (params.get("checkout") === "1" && u) ui.openSheet(); // back from Google
      if (params.get("signin") === "failed") ui.showToast("Google sign-in didn't finish. Try again.");
      if (params.has("checkout") || params.has("signin")) window.history.replaceState(null, "", "/");
    });
    return onUserChange((u) => useUi.getState().setUser(u));
  }, [setMotion]);

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
        <main>
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
