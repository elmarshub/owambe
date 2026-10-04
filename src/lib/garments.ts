// Garments are drawn as SVG strings from shape paths, a woven fabric pattern and shading layers.
// Everything is generated from our own code (no user input), so injecting the markup is safe.
import { shortNaira, type Fabric, type Piece } from "./catalog";
import { REC, type Build, type Height } from "./fit";

export type Side = "front" | "back";

export function fabric(f: Fabric, id: string): string {
  const { k, base, a, b, c } = f;
  if (k === "asooke") return `<pattern id="${id}" width="12" height="9" patternUnits="userSpaceOnUse"><rect width="12" height="9" fill="${base}"/><rect width="12" height="2" fill="${a}" opacity=".7"/><rect y="5" width="12" height="1" fill="${a}" opacity=".45"/><rect x="2" y="2.6" width="3" height="1.4" fill="${b}"/><rect x="8" y="6.6" width="3" height="1.2" fill="${b}" opacity=".8"/></pattern>`;
  if (k === "brocade") return `<pattern id="${id}" width="34" height="40" patternUnits="userSpaceOnUse"><rect width="34" height="40" fill="${base}"/><path d="M17 4 C 24 12 24 20 17 28 C 10 20 10 12 17 4 Z" fill="${a}"/><path d="M0 24 C 6 30 6 36 0 42 M34 24 C 28 30 28 36 34 42" fill="none" stroke="${a}" stroke-width="2"/><circle cx="17" cy="34" r="2" fill="${a}"/><circle cx="0" cy="8" r="2.4" fill="${a}"/><circle cx="34" cy="8" r="2.4" fill="${a}"/></pattern>`;
  if (k === "plain") return `<pattern id="${id}" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="${base}"/><rect width="4" height="1" fill="${a}" opacity=".5"/><rect width="1" height="4" fill="${a}" opacity=".35"/></pattern>`;
  if (k === "adire") return `<pattern id="${id}" width="38" height="38" patternUnits="userSpaceOnUse"><rect width="38" height="38" fill="${base}"/><circle cx="19" cy="19" r="12" fill="none" stroke="${a}" stroke-width="1.6" stroke-dasharray="2.2 2.4" opacity=".85"/><circle cx="19" cy="19" r="6.5" fill="none" stroke="${a}" stroke-width="1.4" opacity=".8"/><circle cx="19" cy="19" r="2.2" fill="${a}" opacity=".9"/><circle cx="0" cy="0" r="3" fill="${a}" opacity=".7"/><circle cx="38" cy="0" r="3" fill="${a}" opacity=".7"/><circle cx="0" cy="38" r="3" fill="${a}" opacity=".7"/><circle cx="38" cy="38" r="3" fill="${a}" opacity=".7"/></pattern>`;
  if (k === "lace") return `<pattern id="${id}" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="${base}"/><circle cx="9" cy="9" r="5.5" fill="none" stroke="${a}" stroke-width="1.2"/><circle cx="9" cy="9" r="1.8" fill="${a}"/><circle cx="0" cy="0" r="2.6" fill="none" stroke="${a}" stroke-width="1"/><circle cx="18" cy="0" r="2.6" fill="none" stroke="${a}" stroke-width="1"/><circle cx="0" cy="18" r="2.6" fill="none" stroke="${a}" stroke-width="1"/><circle cx="18" cy="18" r="2.6" fill="none" stroke="${a}" stroke-width="1"/></pattern>`;
  return `<pattern id="${id}" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="${base}"/><circle cx="22" cy="22" r="15" fill="${a}"/><circle cx="22" cy="22" r="10" fill="${b}"/><circle cx="22" cy="22" r="5" fill="${c}"/><path d="M0 0 L8 0 L0 8 Z M44 0 L36 0 L44 8 Z M0 44 L8 44 L0 36 Z M44 44 L36 44 L44 36 Z" fill="${c}"/><circle cx="0" cy="22" r="4" fill="${b}"/><circle cx="44" cy="22" r="4" fill="${b}"/></pattern>`;
}

interface Shape {
  body: string;
  folds: string[];
  neck: string;
  neckBack: string;
  emb: (c: string) => string;
  embBack: (c: string) => string;
  under?: string;
  underBand?: string;
  underFold?: string;
  wornUnder?: string;
  wornFold?: string;
}

/* Garment shapes in a 200 x 300 box; shoulders sit at y 44-47 where the hanger bar is. */
const SHAPES: Record<Piece["type"], Shape> = {
  agbada: {
    body: "M100 30 C 86 30 72 33 62 38 L 40 44 C 22 54 12 74 10 100 C 6 150 6 200 12 244 C 28 252 44 250 56 244 L 54 290 L 146 290 L 144 244 C 156 250 172 252 188 244 C 194 200 194 150 190 100 C 188 74 178 54 160 44 L 138 38 C 128 33 114 30 100 30 Z",
    folds: ["M40 48 C 33 110 29 180 33 246", "M160 48 C 167 110 171 180 167 246", "M64 64 C 68 140 63 220 66 288", "M136 64 C 132 140 137 220 134 288", "M100 140 C 102 200 98 250 100 288"],
    neck: "M86 33 Q100 62 114 33 Q100 39 86 33 Z",
    neckBack: "M90 32 Q100 37 110 32 Q100 34 90 32 Z",
    emb: (c) => `<path d="M83 34 Q100 68 117 34" fill="none" stroke="${c}" stroke-width="2.6"/><path d="M78 36 Q100 78 122 36" fill="none" stroke="${c}" stroke-width="1.2" stroke-dasharray="3 2"/><path d="M60 92 L 84 92 L 84 132 Q 72 142 60 132 Z" fill="none" stroke="${c}" stroke-width="1.6"/><path d="M64 104 q8 -9 16 0 q-8 9 -16 0 M64 120 q8 -9 16 0 q-8 9 -16 0" fill="none" stroke="${c}" stroke-width="1.2"/>`,
    embBack: (c) => `<path d="M80 44 Q100 58 120 44" fill="none" stroke="${c}" stroke-width="1.6"/><path d="M86 48 q14 22 28 0" fill="none" stroke="${c}" stroke-width="1" stroke-dasharray="2 2"/>`,
  },
  kaftan: {
    body: "M100 30 C 88 30 76 33 68 38 L 46 46 C 38 50 34 58 30 70 L 20 126 L 40 132 L 54 86 L 56 292 L 144 292 L 146 86 L 160 132 L 180 126 L 170 70 C 166 58 162 50 154 46 L 132 38 C 124 33 112 30 100 30 Z",
    folds: ["M70 92 C 74 170 69 240 73 292", "M130 92 C 126 170 131 240 127 292", "M38 64 C 33 90 28 110 26 126", "M162 64 C 167 90 172 110 174 126"],
    neck: "M88 33 Q100 48 112 33 Q100 37 88 33 Z",
    neckBack: "M91 32 Q100 36 109 32 Q100 34 91 32 Z",
    emb: (c) => `<path d="M86 35 Q100 52 114 35" fill="none" stroke="${c}" stroke-width="2"/><path d="M100 46 L100 140" stroke="${c}" stroke-width="1.4"/><path d="M93 50 L93 136 M107 50 L107 136" stroke="${c}" stroke-width="1" stroke-dasharray="2 2"/><circle cx="100" cy="64" r="1.8" fill="${c}"/><circle cx="100" cy="84" r="1.8" fill="${c}"/><circle cx="100" cy="104" r="1.8" fill="${c}"/><path d="M56 262 L60 292 M144 262 L140 292" stroke="${c}" stroke-width="1.2"/>`,
    embBack: (c) => `<path d="M56 262 L60 292 M144 262 L140 292" stroke="${c}" stroke-width="1.2"/>`,
  },
  buba: {
    under: "M60 42 L 140 42 L 145 266 L 104 266 L 100 150 L 96 266 L 55 266 Z",
    underBand: "M60 42 L140 42 L140 52 L60 52 Z",
    wornUnder: "M62 0 L 138 0 L 142 150 L 104 150 L 100 40 L 96 150 L 58 150 Z",
    body: "M100 30 C 88 30 76 33 68 38 L 48 46 C 40 50 36 58 32 70 L 22 118 L 42 124 L 56 84 L 58 208 L 142 208 L 144 84 L 158 124 L 178 118 L 168 70 C 164 58 160 50 152 46 L 132 38 C 124 33 112 30 100 30 Z",
    folds: ["M72 90 C 75 140 71 180 74 208", "M128 90 C 125 140 129 180 126 208"],
    neck: "M88 33 Q100 50 112 33 Q100 37 88 33 Z",
    neckBack: "M91 32 Q100 36 109 32 Q100 34 91 32 Z",
    emb: (c) => `<path d="M85 35 Q100 54 115 35" fill="none" stroke="${c}" stroke-width="2"/><path d="M100 48 L100 92" stroke="${c}" stroke-width="1.2"/>`,
    embBack: () => "",
  },
  iro: {
    under: "M38 42 L 162 42 L 172 284 C 132 296 68 296 28 284 Z",
    underBand: "M38 42 L162 42 L162 54 L38 54 Z",
    underFold: "M150 60 C 132 160 110 230 82 292",
    wornUnder: "M44 0 L 156 0 L 166 150 C 128 160 72 160 34 150 Z",
    wornFold: "M150 6 C 134 70 118 110 96 156",
    body: "M100 30 C 88 30 76 33 68 38 L 46 46 C 36 50 28 60 22 72 L 6 114 L 36 128 L 58 90 L 60 184 C 80 192 120 192 140 184 L 142 90 L 164 128 L 194 114 L 178 72 C 172 60 164 50 154 46 L 132 38 C 124 33 112 30 100 30 Z",
    folds: ["M74 96 C 76 140 72 170 76 188", "M126 96 C 124 140 128 170 124 188", "M30 76 C 24 92 16 104 12 114", "M170 76 C 176 92 184 104 188 114"],
    neck: "M84 34 Q100 58 116 34 Q100 40 84 34 Z",
    neckBack: "M88 33 Q100 38 112 33 Q100 35 88 33 Z",
    emb: (c) => `<path d="M82 35 Q100 62 118 35" fill="none" stroke="${c}" stroke-width="2.2"/><path d="M8 112 L 36 126 M192 112 L 164 126" stroke="${c}" stroke-width="2.4"/>`,
    embBack: (c) => `<path d="M8 112 L 36 126 M192 112 L 164 126" stroke="${c}" stroke-width="2.4"/>`,
  },
};

const NOISE = "/noise.png";
const noiseImg = (o: number) => `<image href="${NOISE}" x="0" y="0" width="200" height="300" preserveAspectRatio="none" opacity="${o}" style="mix-blend-mode:multiply"/>`;

function garmentDefs(p: Piece, P: string, back: boolean) {
  const s = SHAPES[p.type];
  const shadeX = back
    ? '<stop offset="0" stop-color="#000" stop-opacity=".24"/><stop offset=".18" stop-color="#000" stop-opacity=".03"/><stop offset=".5" stop-color="#fff" stop-opacity=".05"/><stop offset=".82" stop-color="#000" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".28"/>'
    : '<stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset=".14" stop-color="#000" stop-opacity=".05"/><stop offset=".38" stop-color="#fff" stop-opacity=".09"/><stop offset=".62" stop-color="#000" stop-opacity=".03"/><stop offset=".86" stop-color="#000" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".32"/>';
  return `${fabric(p.fab, "f" + P)}
    <linearGradient id="sx${P}" x1="0" x2="1" y1="0" y2="0">${shadeX}</linearGradient>
    <linearGradient id="sy${P}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".22" stop-color="#fff" stop-opacity="0"/><stop offset=".85" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
    <clipPath id="cb${P}"><path d="${s.body}"/></clipPath>
    ${s.under ? `<clipPath id="cu${P}"><path d="${s.under}"/></clipPath>` : ""}
    ${s.wornUnder ? `<clipPath id="cw${P}"><path d="${s.wornUnder}"/></clipPath>` : ""}
    <filter id="soft${P}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.4"/></filter>`;
}

function underLayer(p: Piece, P: string, worn: boolean) {
  const s = SHAPES[p.type];
  if (!s.under) return "";
  if (worn) return `<g clip-path="url(#cw${P})"><rect width="200" height="300" fill="url(#f${P})"/><rect width="200" height="300" fill="#000" opacity=".12"/>${noiseImg(0.45)}<rect width="200" height="300" fill="url(#sx${P})"/>${s.wornFold ? `<path d="${s.wornFold}" stroke="#000" stroke-opacity=".18" stroke-width="5" fill="none"/>` : ""}</g>`;
  return `<g clip-path="url(#cu${P})"><rect width="200" height="300" fill="url(#f${P})"/><rect width="200" height="300" fill="#000" opacity=".16"/>${noiseImg(0.45)}<rect width="200" height="300" fill="url(#sx${P})"/><path d="${s.underBand}" fill="#000" opacity=".22"/>${s.underFold ? `<path d="${s.underFold}" stroke="#000" stroke-opacity=".18" stroke-width="5" fill="none"/>` : ""}</g>`;
}

function bodyLayer(p: Piece, P: string, back: boolean) {
  const s = SHAPES[p.type];
  const backDetail = back
    ? `<path d="M100 40 L100 290" stroke="#000" stroke-opacity=".14" stroke-width="1.2"/><path d="M44 72 Q100 86 156 72" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="1.2"/><path d="M44 74 Q100 88 156 74" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="1"/>`
    : "";
  const folds = s.folds.map((d) => `<path d="${d}" stroke="#000" stroke-opacity=".2" stroke-width="7" fill="none"/>`).join("")
    + s.folds.map((d) => `<path d="${d}" transform="translate(5 0)" stroke="#fff" stroke-opacity=".12" stroke-width="4" fill="none"/>`).join("");
  return `<g clip-path="url(#cb${P})">
    <rect width="200" height="300" fill="url(#f${P})"/>
    ${noiseImg(0.5)}
    <g filter="url(#soft${P})">${folds}</g>
    <rect width="200" height="300" fill="url(#sx${P})"/>
    <rect width="200" height="300" fill="url(#sy${P})"/>
    ${backDetail}
    ${back ? s.embBack(p.emb) : s.emb(p.emb)}
  </g>
  <path d="${back ? s.neckBack : s.neck}" fill="#000" opacity="${back ? 0.3 : 0.55}"/>
  ${back ? `<g transform="translate(91 36)"><rect width="18" height="8" rx="1" fill="#151514"/><text x="9" y="5.6" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="700" font-size="3.6" fill="#E9D49A">owambe.</text></g>` : ""}
  <path d="${s.body}" fill="none" stroke="#000" stroke-opacity=".14" stroke-width="1"/>`;
}

function hanger() {
  return `<path d="M100 26 L 100 12 C 100 6 107 4 107 -2 C 107 -8 96 -9 95 -3" fill="none" stroke="#9A7B3A" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M41 48 Q100 18 159 48" fill="none" stroke="#7A5230" stroke-width="6" stroke-linecap="round"/>
  <path d="M43 46 Q100 17 157 46" fill="none" stroke="#C49162" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>`;
}

function priceTag(p: Piece, n: number) {
  return `<path d="M108 28 C 120 34 128 44 132 54" fill="none" stroke="#6A6963" stroke-width=".8"/>
  <g transform="translate(124 52) rotate(10)">
    <path d="M0 4 L7 0 L36 0 L36 42 L0 42 Z" fill="#FFFFFF" stroke="#151514" stroke-width=".9"/>
    <circle cx="6" cy="5" r="1.8" fill="none" stroke="#151514" stroke-width=".7"/>
    <text x="5" y="18" font-family="Manrope, sans-serif" font-size="6" font-weight="700" fill="#6A6963">No. ${String(n).padStart(2, "0")}</text>
    <text x="5" y="33" font-family="Bricolage Grotesque, sans-serif" font-size="10" font-weight="700" fill="#151514">${shortNaira(p.price)}</text>
  </g>`;
}

/** A piece on its wooden hanger. `n` adds the numbered price tag (front only). */
export function garmentSVG(p: Piece, side: Side, uid: string, n?: number): string {
  const back = side === "back";
  const P = `${uid}${side}`;
  return `<svg viewBox="0 -10 200 310" aria-hidden="true"><defs>${garmentDefs(p, P, back)}</defs>
  ${hanger()}${underLayer(p, P, false)}${bodyLayer(p, P, back)}${!back && n ? priceTag(p, n) : ""}</svg>`;
}

export interface DummyOptions {
  build: Build;
  height: Height;
  /** Index into SIZES; undefined means the suggested size. */
  size?: number;
  acc: boolean;
}

/* The dress-form dummy: build widens the form, height moves the shoulders, size changes how the cloth sits. */
export function dummySVG(p: Piece, side: Side, uid: string, o: DummyOptions): string {
  const back = side === "back";
  const P = `${uid}d${side}`;
  const s = SHAPES[p.type];
  const k = [0.9, 1, 1.13][o.build];
  const shY = [80, 72, 64][o.height];
  const sz = o.size ?? REC[o.build];
  const diff = sz - REC[o.build];
  const hk = [1.04, 1, 0.96][o.height];
  const sx = 0.86 * k * (1 + diff * 0.06);
  const sy = 0.8 * (1 + diff * 0.025) * hk;
  const tw = 44 * k, ww = 30 * k, hw = 38 * k;
  const neckY = shY - 16, headY = neckY - 22;
  const waistY = shY + 92, hipY = shY + 128;
  const torso = `M${100 - tw} ${shY} C ${100 - tw - 4} ${shY + 30} ${100 - ww} ${waistY - 30} ${100 - ww} ${waistY} C ${100 - ww} ${waistY + 18} ${100 - hw} ${hipY - 14} ${100 - hw + 4} ${hipY} L ${100 + hw - 4} ${hipY} C ${100 + hw} ${hipY - 14} ${100 + ww} ${waistY + 18} ${100 + ww} ${waistY} C ${100 + ww} ${waistY - 30} ${100 + tw + 4} ${shY + 30} ${100 + tw} ${shY} C 120 ${shY - 8} 80 ${shY - 8} ${100 - tw} ${shY} Z`;
  const garmentT = `translate(100 ${shY - 4}) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(-100 -44)`;
  const tight = Math.max(0, -diff), loose = Math.max(0, diff);
  const strain = tight
    ? Array.from({ length: 2 + tight }, (_, i) => `<path d="M${72 - i * 2} ${66 + i * 16} Q100 ${74 + i * 16} ${128 + i * 2} ${66 + i * 16}" fill="none" stroke="#000" stroke-opacity="${0.1 + tight * 0.06}" stroke-width="1.6"/>`).join("")
    : "";
  const drape = loose
    ? Array.from({ length: loose * 2 }, (_, i) => `<path d="M${60 + i * 26} 120 C ${58 + i * 26} 180 ${64 + i * 26} 230 ${60 + i * 26} 286" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="5" filter="url(#soft${P})"/>`).join("")
    : "";
  const underT = s.wornUnder
    ? `<g transform="translate(100 ${waistY - 4}) scale(${(k * 0.82 * (1 + diff * 0.05)).toFixed(3)} ${((296 - waistY) / 158).toFixed(3)}) translate(-100 0)">${underLayer(p, P, true)}</g>`
    : "";
  let acc = "";
  if (o.acc) {
    const fillA = `url(#f${P})`;
    acc = p.acc === "gele"
      ? `<g transform="translate(0 ${headY - 34})"><path d="M66 46 C 54 14 92 -6 100 12 C 110 -8 152 8 136 46 C 120 36 82 36 66 46 Z" fill="${fillA}"/><path d="M128 20 C 152 4 168 20 156 42 C 148 36 140 34 134 34 Z" fill="${fillA}"/><path d="M66 46 C 54 14 92 -6 100 12 C 110 -8 152 8 136 46 C 120 36 82 36 66 46 Z" fill="#000" opacity=".1"/><path d="M80 40 C 84 24 96 18 100 14" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="2"/></g>`
      : `<g transform="translate(0 ${headY - 26})"><path d="M80 30 C 80 10 120 10 120 30 L 118 36 L 82 36 Z" fill="${fillA}"/><path d="M80 30 C 80 10 120 10 120 30 L 118 36 L 82 36 Z" fill="url(#sx${P})"/><path d="M114 14 C 130 16 136 26 128 34 L 118 32 Z" fill="${fillA}"/><path d="M114 14 C 130 16 136 26 128 34 L 118 32 Z" fill="#000" opacity=".18"/></g>`;
  }
  return `<svg viewBox="0 -10 200 310" aria-hidden="true"><defs>${garmentDefs(p, P, back)}
    <radialGradient id="fg${P}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#EFEAE0"/><stop offset=".7" stop-color="#DCD4C5"/><stop offset="1" stop-color="#C2B8A5"/></radialGradient></defs>
  <rect x="98" y="${hipY - 4}" width="4" height="${296 - hipY}" fill="#9A7B3A"/>
  <path d="M100 296 L 70 304 M100 296 L 130 304 M100 296 L 100 306" stroke="#5B3E24" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="100" cy="${headY}" rx="15" ry="19" fill="url(#fg${P})"/>
  <rect x="93" y="${headY + 16}" width="14" height="${neckY - headY - 8}" rx="4" fill="#D3CABA"/>
  <path d="${torso}" fill="url(#fg${P})"/>
  <path d="M100 ${shY - 6} L100 ${hipY}" stroke="#B4A993" stroke-width="1" stroke-dasharray="3 3"/>
  ${underT}
  <g transform="${garmentT}">${bodyLayer(p, P, back)}${strain}${drape}</g>
  ${acc}
  </svg>`;
}

/** A small square of the piece's fabric, for the swatch row. */
export function swatchSVG(p: Piece): string {
  return `<svg viewBox="0 0 40 40" aria-hidden="true"><defs>${fabric(p.fab, "sw" + p.id)}</defs><rect width="40" height="40" fill="url(#sw${p.id})"/></svg>`;
}
