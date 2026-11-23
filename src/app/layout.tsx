import type { Metadata } from "next";
import localFont from "next/font/local";
import { Navbar } from "@/components/Navbar";
import { RouteTransition } from "@/components/RouteTransition";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { Grain } from "@/components/Grain";
import { SpatialDock } from "@/components/dock/SpatialDock";
import { SoundEngine } from "@/components/sound/SoundEngine";
import { QuickJumpPalette } from "@/components/works/ProjectQuickJump";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { PRELOADER_INIT_SCRIPT } from "@/lib/preloader";
import { Preloader } from "@/components/transition/Preloader";
import { ScrollTelemetry } from "@/components/telemetry/ScrollTelemetry";
import { ParallaxController } from "@/components/motion/ParallaxController";
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

export const metadata: Metadata = {
  title: "Mohammad Adeeb Alsaleh — Software Engineer & AI Developer",
  description: "Full-Stack MERN & Next.js developer based in Damascus, specializing in responsive interfaces, RESTful APIs, and RAG-driven intelligent platforms.",
  authors: [{ name: "Mohammad Adeeb Alsaleh", url: "https://github.com/Adeeb-01" }],
  openGraph: {
    title: "Mohammad Adeeb Alsaleh — Software Engineer & AI Developer",
    description: "Full-Stack MERN & Next.js developer based in Damascus, specializing in responsive interfaces, RESTful APIs, and RAG-driven intelligent platforms.",
    type: "website",
    siteName: "Mohammad Adeeb Alsaleh",
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
      <body className="min-h-[901px] font-sans">
        <MotionProvider>
          <Preloader />
          <ScrollProgress />
          <ScrollTelemetry />
          <ParallaxController />
          <Navbar />
          <RouteTransition>{children}</RouteTransition>
          <SpatialDock />
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
