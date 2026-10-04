"use client";
import { useMemo } from "react";
import { findPiece } from "@/lib/catalog";
import { garmentSVG } from "@/lib/garments";

export function GarmentThumb({ pieceId, uid, className = "thumb" }: { pieceId: string; uid: string; className?: string }) {
  const svg = useMemo(() => {
    const p = findPiece(pieceId);
    return p ? garmentSVG(p, "front", uid) : "";
  }, [pieceId, uid]);
  return <div className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}
