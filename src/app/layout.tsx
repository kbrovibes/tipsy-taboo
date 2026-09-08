import type { Metadata, Viewport } from "next";
import { Geist, Outfit } from "next/font/google";
import PwaSetup from "@/components/PwaSetup";
import { THEME_BOOT } from "@/lib/appearance";
import "./globals.css";

const display = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Geist({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/**
 * Absolute base for og:image URLs — WhatsApp and friends will not follow a
 * relative one. Vercel hands us the deployment host; the production domain is
 * the fallback so a local build still emits sane links.
 */
const site =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === "production"
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://tipsy-taboo.vercel.app");

const TITLE = "Tipsy Taboo — say anything, except that";
const DESCRIPTION =
  "The word game where the obvious clues are banned. One phone, two to four teams, thousands of cards. No accounts, no ads, no cards under the sofa.";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Tipsy Taboo",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tipsy Taboo",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  // the boot script rewrites this when the palette is not the device default
  themeColor: "#f7f6fb",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <head>
        {/* before first paint, or the first frame flashes the wrong palette */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <PwaSetup />
        {children}
      </body>
    </html>
  );
}
