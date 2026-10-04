import type { Metadata } from "next";
import Link from "next/link";
import { HomeLogo } from "@/components/ui/HomeLogo";
import { EmptyHanger } from "@/components/ui/EmptyHanger";

export const metadata: Metadata = { title: "Not on the rail", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="wrap">
      <header className="top">
        <HomeLogo />
      </header>
      <main className="notfound">
        <EmptyHanger />
        <h1>This piece isn&apos;t on the rail.</h1>
        <p className="small">The link may be wrong, or the piece has moved on. Everything else is still hanging where you left it.</p>
        <Link className="primary" href="/">Back to the rail</Link>
      </main>
    </div>
  );
}
