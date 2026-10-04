import { SIZES, type Size } from "@/lib/catalog";

export const BUILDS = ["Slim", "Regular", "Broad"] as const;
export const HEIGHTS = ["Under 1.70 m", "1.70 to 1.85 m", "Over 1.85 m"] as const;
export type Build = 0 | 1 | 2;
export type Height = 0 | 1 | 2;

/** Suggested size index for each build: Slim → M, Regular → L, Broad → XL. */
export const REC: Record<Build, number> = { 0: 1, 1: 2, 2: 3 };

interface FitAdvice {
  tone: "ok" | "warn" | "bad";
  text: string;
}

/** What the fitting room says about a chosen size for a build and height. */
export function fitAdvice(build: Build, height: Height, size: Size | undefined): FitAdvice {
  const rec = REC[build];
  const b = BUILDS[build].toLowerCase();
  if (!size) return { tone: "ok", text: `For a ${b} build we suggest ${SIZES[rec]}. Pick a size to see it on the dummy.` };
  const d = Math.max(-2, Math.min(2, SIZES.indexOf(size) - rec));
  const msg: Record<number, FitAdvice> = {
    [-2]: { tone: "bad", text: `Too tight. It pulls across the chest. Try ${SIZES[rec]}.` },
    [-1]: { tone: "warn", text: `Snug fit. Size up to ${SIZES[rec]} for the usual drape.` },
    0: { tone: "ok", text: `True fit. This is how it's cut to hang on a ${b} build.` },
    1: { tone: "ok", text: "Relaxed fit with a little extra drape." },
    2: { tone: "warn", text: `Very loose. Go back to ${SIZES[rec]} unless you want it oversized.` },
  };
  const out = { ...msg[d] };
  if (height === 2 && d <= 0) out.text += " On a taller frame the hem sits a little high.";
  if (height === 0 && d >= 1) out.text += " On a shorter frame the hem may need taking up.";
  return out;
}
