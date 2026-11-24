import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Navbar } from "@/components/Navbar";
import { RouteTransition } from "@/components/RouteTransition";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { Grain } from "@/components/Grain";
import { SpatialDock } from "@/components/dock/SpatialDock";
import { MobileQuickBar } from "@/components/dock/MobileQuickBar";
import { SoundEngine } from "@/components/sound/SoundEngine";
import { QuickJumpPalette } from "@/components/works/ProjectQuickJump";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { PRELOADER_INIT_SCRIPT } from "@/lib/preloader";
import { Preloader } from "@/components/transition/Preloader";
import { ScrollTelemetry } from "@/components/telemetry/ScrollTelemetry";
import { ParallaxController } from "@/components/motion/ParallaxController";
import { SITE_URL } from "@/lib/site";
import "lenis/dist/lenis.css";
import "./globals.css";

const instrumentSans = localFont({
  src: [
    { path: "./fonts/InstrumentSans-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/InstrumentSans-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/InstrumentSans-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/InstrumentSans-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/InstrumentSans-500-italic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/InstrumentSans-700-italic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };
const title = "Mohammad Adeeb Alsaleh — Software Engineer & AI Developer";
const description = "Software Engineer based in Damascus building full-stack web, mobile, and AI systems. Selected work: easy:learning, Tawsela Vendor, Sarafy, and Zad Souq.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: "./" },
  keywords: ["Mohammad Adeeb Alsaleh", "Software Engineer", "Full-Stack MERN", "Next.js", "Flutter", "AI & RAG"],
  authors: [{ name: "Mohammad Adeeb Alsaleh", url: "https://github.com/Adeeb-01" }],
  creator: "Mohammad Adeeb Alsaleh",
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    type: "website",
    url: "./",
    locale: "en_US",
    siteName: "Mohammad Adeeb Alsaleh",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Mohammad Adeeb Alsaleh — Software Engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${instrumentSans.variable} max-tab:overflow-y-auto`}>
      <head>
        {/* Sets data-theme before first paint (stored choice → OS preference): no theme flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT + PRELOADER_INIT_SCRIPT }} />
        <noscript>
          <style>{"[data-preloader]{display:none!important}"}</style>
        </noscript>
      </head>
      <body className="min-h-dvh font-sans">
        <MotionProvider>
          <Preloader />
          <ScrollProgress />
          <ScrollTelemetry />
          <ParallaxController />
          <Navbar />
          <RouteTransition>{children}</RouteTransition>
          <SpatialDock />
          <MobileQuickBar />
          <QuickJumpPalette />
          <SoundEngine />
          <Grain />
          {/* After Grain: same z-40, so the badge paints above the texture. */}
          <AvailabilityBadge />
          <CustomCursor />
        </MotionProvider>
      </body>
    </html>
  );
}
