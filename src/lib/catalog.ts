// The Drop 01 catalogue. Prices are in naira; Paystack amounts are converted to kobo on the server.
// The server always re-prices from this file, so the client can never set its own price.

export type Line = "men" | "women";
export type GarmentType = "agbada" | "kaftan" | "buba" | "iro";
export type FabricKind = "asooke" | "brocade" | "plain" | "adire" | "lace" | "ankara";

export interface Fabric {
  k: FabricKind;
  base: string;
  a: string;
  b?: string;
  c?: string;
}

export interface Piece {
  id: string;
  line: Line;
  type: GarmentType;
  name: string;
  series: string;
  colour: string;
  price: number;
  fab: Fabric;
  emb: string;
  acc: "fila" | "gele";
  desc: string;
}

export const PIECES: Piece[] = [
  { id: "royal", line: "men", type: "agbada", name: "Royal Agbada", series: "Agbada · three pieces", colour: "Royal blue aso-oke", price: 185000,
    fab: { k: "asooke", base: "#2A4597", a: "#1B2F6E", b: "#C9A54A" }, emb: "#D9B65A", acc: "fila", desc: "Robe, buba, sokoto and fila. Gold embroidery around the neck and pocket." },
  { id: "snow", line: "men", type: "agbada", name: "Snow Agbada", series: "Agbada · three pieces", colour: "White brocade", price: 210000,
    fab: { k: "brocade", base: "#F1F0EA", a: "#DEDCD3" }, emb: "#A9ADB3", acc: "fila", desc: "Robe, buba, sokoto and fila in white brocade with silver thread at the neck." },
  { id: "wine", line: "men", type: "agbada", name: "Wine Agbada", series: "Agbada · three pieces", colour: "Wine damask", price: 195000,
    fab: { k: "brocade", base: "#6E1F2E", a: "#83303F" }, emb: "#E2C27A", acc: "fila", desc: "A deep wine damask with tone-on-tone leaves and gold embroidery." },
  { id: "emerald", line: "men", type: "kaftan", name: "Emerald Kaftan", series: "Kaftan · long", colour: "Emerald cotton", price: 85000,
    fab: { k: "plain", base: "#1F6E4A", a: "#185C3D" }, emb: "#101A14", acc: "fila", desc: "A long kaftan with fine black embroidery down the placket and side slits." },
  { id: "sand", line: "men", type: "kaftan", name: "Sand Kaftan", series: "Kaftan · long", colour: "Sand linen", price: 78000,
    fab: { k: "plain", base: "#D3C09E", a: "#C4AF8B" }, emb: "#6B4F32", acc: "fila", desc: "Light linen in sand with brown piping at the collar and cuffs." },
  { id: "adire", line: "men", type: "buba", name: "Adire Buba & Sokoto", series: "Buba and sokoto · two pieces", colour: "Indigo adire", price: 95000,
    fab: { k: "adire", base: "#22325F", a: "#E9EEF7" }, emb: "#E9EEF7", acc: "fila", desc: "Hand-dyed indigo adire. Buba and matching sokoto, trousers folded on the hanger." },
  { id: "ankara", line: "men", type: "buba", name: "Ankara Buba & Sokoto", series: "Buba and sokoto · two pieces", colour: "Orange and navy wax print", price: 88000,
    fab: { k: "ankara", base: "#E2691B", a: "#1D2B57", b: "#F3D8A0", c: "#2D8C6B" }, emb: "#1D2B57", acc: "fila", desc: "A bold wax print in orange and navy, cut as a relaxed buba and sokoto." },
  { id: "coral", line: "women", type: "iro", name: "Coral Lace Iro & Buba", series: "Iro and buba · two pieces", colour: "Coral lace", price: 120000,
    fab: { k: "lace", base: "#E8705E", a: "#F7B3A6" }, emb: "#F7C7BD", acc: "gele", desc: "Coral lace buba with a matching iro, folded over the hanger bar." },
  { id: "gold", line: "women", type: "iro", name: "Gold Aso-oke Iro & Buba", series: "Iro and buba · two pieces", colour: "Gold and green aso-oke", price: 145000,
    fab: { k: "asooke", base: "#C9A23E", a: "#9C7B27", b: "#2F6B4A" }, emb: "#2F6B4A", acc: "gele", desc: "Woven aso-oke in gold with green stripes, for the big day." },
  { id: "wax", line: "women", type: "iro", name: "Ankara Iro & Buba", series: "Iro and buba · two pieces", colour: "Yellow, red and teal wax print", price: 98000,
    fab: { k: "ankara", base: "#F0B92E", a: "#C7322B", b: "#FFF3DA", c: "#18877F" }, emb: "#C7322B", acc: "gele", desc: "A bright wax print in yellow, red and teal." },
  { id: "indigo", line: "women", type: "iro", name: "Adire Iro & Buba", series: "Iro and buba · two pieces", colour: "Indigo adire", price: 110000,
    fab: { k: "adire", base: "#2B3E73", a: "#EEF2F9" }, emb: "#EEF2F9", acc: "gele", desc: "Indigo adire with white resist circles, buba and iro." },
  { id: "plum", line: "women", type: "iro", name: "Plum Brocade Iro & Buba", series: "Iro and buba · two pieces", colour: "Plum brocade", price: 135000,
    fab: { k: "brocade", base: "#5B2A4E", a: "#6F3961" }, emb: "#E3C27C", acc: "gele", desc: "Plum brocade with gold trim at the neck and sleeves." },
];

export const SIZES = ["S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof SIZES)[number];
export const MAX_QTY = 10;

export const DELIVERY = {
  std: { label: "Standard", note: "2 to 4 days", fee: 4500 },
  exp: { label: "Express", note: "next day", fee: 9000 },
} as const;
export type Speed = keyof typeof DELIVERY;

export const AREAS = ["Lekki", "Ikoyi", "Victoria Island", "Ikeja", "Yaba", "Surulere", "Ajah"] as const;

export const findPiece = (id: string) => PIECES.find((p) => p.id === id);

export interface BagLine {
  id: string;
  size: Size;
  qty: number;
  acc: boolean;
}

/** Keeps only bag lines that still match the catalogue, so a bag saved before a drop changed can't break the page. */
export function cleanBag(raw: unknown): BagLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((x) => {
    if (!x || typeof x !== "object") return [];
    const { id, size, qty, acc } = x as Record<string, unknown>;
    if (typeof id !== "string" || !findPiece(id)) return [];
    if (!SIZES.includes(size as Size)) return [];
    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1) return [];
    return [{ id, size: size as Size, qty: Math.min(qty, MAX_QTY), acc: acc === true }];
  });
}
export const linePieces = (line: Line) => PIECES.filter((p) => p.line === line);

export const naira = (n: number) => "₦" + n.toLocaleString("en-NG");
export const shortNaira = (n: number) => "₦" + Math.round(n / 1000) + "k";
