"use client";
import Link from "next/link";
import { PIECES } from "@/lib/catalog";
import { useShop } from "@/store/shop";
import { bagCount, useBag } from "@/store/bag";
import { useUi } from "@/store/ui";
import { useHydrated } from "@/hooks/useHydrated";
import { AUTH_LIVE } from "@/lib/config";

const counts = { men: PIECES.filter((p) => p.line === "men").length, women: PIECES.filter((p) => p.line === "women").length };

export function Header() {
  const line = useShop((s) => s.line);
  const setLine = useShop((s) => s.setLine);
  const items = useBag((b) => b.items);
  const openBag = useUi((u) => u.openBag);
  const user = useUi((u) => u.user);
  const hydrated = useHydrated();

  return (
    <header className="top">
      <Link className="mark" href="/" aria-label="Owambe">owambe<i>.</i></Link>
      <nav className="tabs" role="tablist" aria-label="Line">
        {(["men", "women"] as const).map((l) => (
          <button key={l} className="tab" role="tab" aria-selected={line === l} onClick={() => setLine(l)}>
            {l === "men" ? "Men" : "Women"} <small>{counts[l]}</small>
          </button>
        ))}
      </nav>
      <div className="tools">
        {AUTH_LIVE && user && <Link className="ghost" href="/orders">My orders</Link>}
        <button className="bag" aria-label="Open bag" onClick={openBag}>
          Bag <span className="bagcount">{hydrated ? bagCount(items) : 0}</span>
        </button>
      </div>
    </header>
  );
}
