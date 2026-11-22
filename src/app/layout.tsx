import type { Metadata } from "next";
import localFont from "next/font/local";
import { Navbar } from "@/components/Navbar";
import { RouteTransition } from "@/components/RouteTransition";
import { FramerBadge } from "@/components/FramerBadge";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { Grain } from "@/components/Grain";
import { SpatialDock } from "@/components/dock/SpatialDock";
import { SoundEngine } from "@/components/sound/SoundEngine";
import { QuickJumpPalette } from "@/components/works/ProjectQuickJump";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
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
  title: "Michael Carter — Digital Product Designer",
  description:
    "Michael Carter is a digital product designer focused on visual design and Framer websites, crafting seamless, user-centered experiences.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${instrumentSans.variable} max-tab:overflow-y-auto`}>
      <head>
        {/* Sets data-theme before first paint (stored choice → OS preference): no theme flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-[901px] font-sans">
        <MotionProvider>
          <ScrollProgress />
          <Navbar />
          <RouteTransition>{children}</RouteTransition>
          <FramerBadge />
          <SpatialDock />
          <QuickJumpPalette />
          <SoundEngine />
          <Grain />
          <CustomCursor />
        </MotionProvider>
      </body>
    </html>
  );
}
