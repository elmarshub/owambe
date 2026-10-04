import type { MetadataRoute } from "next";
import { PIECES } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...PIECES.map((p) => ({ url: `${SITE_URL}/pieces/${p.id}`, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
