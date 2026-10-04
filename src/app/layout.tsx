import type { Metadata, Viewport } from "next";
import "@fontsource/bricolage-grotesque/500.css";
import "@fontsource/bricolage-grotesque/600.css";
import "@fontsource/bricolage-grotesque/700.css";
import "@fontsource/bricolage-grotesque/800.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "owambe. Ready for the party.",
  description: "A native-wear store you can touch. Swing the pieces on the rail, see the back, try them on the fitting-room dummy.",
  // Netlify sets URL to the site's primary address at build time, so share previews never point at localhost.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || "http://localhost:3000"),
  openGraph: { title: "owambe.", description: "A native-wear store you can touch.", type: "website" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#FFFFFF" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
