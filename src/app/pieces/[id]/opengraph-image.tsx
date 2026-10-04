import { findPiece } from "@/lib/catalog";
import { pieceImage } from "@/lib/server/piece-image";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateImageMetadata({ params }: { params: Promise<{ id: string }> }) {
  const p = findPiece((await params).id);
  return [{ id: "card", size, contentType, alt: p ? `${p.name}, ${p.colour}, on a wooden hanger on the owambe. brass rail` : "owambe." }];
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  return pieceImage((await params).id);
}
