"use client";

import Link from "next/link";
import { useRef } from "react";
import { m, useScroll, useTransform } from "motion/react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SoundToggle } from "@/components/sound/SoundToggle";
import { openQuickJump } from "@/components/works/ProjectQuickJump";
import { usePrefersReducedMotion } from "@/components/motion/hooks";
import { useLenis } from "@/components/motion/SmoothScroll";
import { useControlsHidden } from "./useControlsHidden";

const CIRCUMFERENCE = Math.PI * 30;

export function MobileQuickBar() {
  const ref = useRef<HTMLDivElement>(null);
  const hidden = useControlsHidden(ref);
  const reduced = usePrefersReducedMotion();
  const lenis = useLenis();
  const { scrollYProgress } = useScroll();
  const dash = useTransform(scrollYProgress, (p) => CIRCUMFERENCE * (1 - p));
  return (
    <m.div ref={ref} data-mobile-bar role="toolbar" aria-label="Mobile quick controls"
      initial={false} animate={{ scale: hidden ? 0.96 : 1, opacity: hidden ? 0 : 1 }}
      transition={{ duration: reduced ? 0 : 0.16 }}
      inert={hidden} aria-hidden={hidden}
      className="mobile-quick-bar">
      <Link href="/contact" aria-label="Available for projects — get in touch" className="quick-control quick-availability">
        <span aria-hidden="true" className="flex items-center gap-2 text-[11px] font-medium">
          <span className="h-2 w-2 rounded-full bg-green" />
          Available
        </span>
      </Link>
      <span aria-hidden="true" className="h-6 w-px bg-fg/15" />
      <ThemeToggle className="quick-control" />
      <SoundToggle className="quick-control" />
      <button type="button" aria-label="Open quick jump" aria-keyshortcuts="Meta+K Control+K" className="quick-control" onClick={(e) => openQuickJump(e.currentTarget)}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" strokeLinecap="round" /></svg>
      </button>
      <button type="button" aria-label="Back to top" className="quick-control relative" onClick={() => {
        if (lenis && !reduced) lenis.scrollTo(0, { duration: 1 });
        else window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
      }}>
        <svg viewBox="0 0 36 36" aria-hidden="true" className="absolute h-9 w-9 -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
          <m.circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-violet)" strokeWidth="2" strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} style={{ strokeDashoffset: dash }} />
        </svg>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 19V5m-6 6 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </m.div>
  );
}
