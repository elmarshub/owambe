import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { findPiece, linePieces, naira } from "@/lib/catalog";
import { garmentSVG } from "@/lib/garments";
import { SITE_URL } from "@/lib/site";

export const pieceImageSize = { width: 1200, height: 630 };

const font = (pkg: string, file: string) => readFile(join(process.cwd(), "node_modules/@fontsource", pkg, "files", file));

export async function pieceImage(id: string) {
  const p = findPiece(id);
  if (!p) return new Response("Not found", { status: 404 });

  const [display, displayExt, displayHeavy, body, bodyBold, noise] = await Promise.all([
    font("bricolage-grotesque", "bricolage-grotesque-latin-700-normal.woff"),
    font("bricolage-grotesque", "bricolage-grotesque-latin-ext-700-normal.woff"),
    font("bricolage-grotesque", "bricolage-grotesque-latin-800-normal.woff"),
    font("manrope", "manrope-latin-500-normal.woff"),
    font("manrope", "manrope-latin-700-normal.woff"),
    readFile(join(process.cwd(), "public/noise.png")),
  ]);

  const n = linePieces(p.line).findIndex((x) => x.id === p.id) + 1;
  const svg = garmentSVG(p, "front", "og", n).replaceAll('href="/noise.png"', `href="data:image/png;base64,${noise.toString("base64")}"`);
  const garment = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FFFFFF", color: "#151514", padding: "56px 64px", fontFamily: "Manrope" }}>
        <div style={{ display: "flex", flexDirection: "column", width: 560, justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontFamily: "Bricolage", fontWeight: 800, fontSize: 56, letterSpacing: -2 }}>
            owambe<span style={{ color: "#B8954A" }}>.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 26, color: "#6A6963" }}>{p.series}</div>
            <div style={{ fontFamily: "Bricolage", fontWeight: 700, fontSize: 76, letterSpacing: -3, lineHeight: 1 }}>{p.name}</div>
            <div style={{ fontSize: 28, color: "#6A6963" }}>{p.colour}</div>
            <div style={{ fontFamily: "Bricolage, BricolageExt", fontWeight: 700, fontSize: 48, color: "#B8954A", marginTop: 6 }}>{naira(p.price)}</div>
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ display: "flex", flexShrink: 0, border: "2px solid #151514", borderRadius: 999, padding: "10px 26px", fontSize: 24, fontWeight: 700 }}>
              {new URL(SITE_URL).host}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, position: "relative", justifyContent: "center" }}>
          <div style={{ position: "absolute", top: 28, left: 10, right: 10, height: 12, borderRadius: 6, background: "linear-gradient(180deg,#6E5424 0%,#E9D49A 30%,#B8954A 62%,#6E5424 100%)" }} />
          <img src={garment} width={330} height={512} alt="" style={{ marginTop: 2 }} />
        </div>
      </div>
    ),
    {
      ...pieceImageSize,
      fonts: [
        { name: "Bricolage", data: display, weight: 700, style: "normal" },
        { name: "BricolageExt", data: displayExt, weight: 700, style: "normal" },
        { name: "Bricolage", data: displayHeavy, weight: 800, style: "normal" },
        { name: "Manrope", data: body, weight: 500, style: "normal" },
        { name: "Manrope", data: bodyBold, weight: 700, style: "normal" },
      ],
    },
  );
}
