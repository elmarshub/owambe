import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Store } from "@/components/store/Store";
import { PIECES, findPiece, naira } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return PIECES.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = findPiece((await params).id);
  if (!p) return {};
  const description = `${p.desc} ${p.colour}, ${naira(p.price)}. Try it on the fitting-room dummy.`;
  return {
    title: p.name,
    description,
    alternates: { canonical: `/pieces/${p.id}` },
    openGraph: { title: `${p.name} · ${naira(p.price)}`, description, url: `/pieces/${p.id}` },
    twitter: { card: "summary_large_image", title: `${p.name} · ${naira(p.price)}`, description },
  };
}

export default async function PiecePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!findPiece(id)) notFound();
  return <Store initialPiece={id} />;
}
