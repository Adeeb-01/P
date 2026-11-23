"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { animate } from "motion/react";
import { PRELOADER_STORAGE_KEY, preloaderStore } from "@/lib/preloader";
import { useLenis } from "@/components/motion/SmoothScroll";

const MIN_MS = 650;
const MAX_MS = 1400;

/** True once the opening curtain has started lifting (or was skipped). False during SSR/hydration. */
export function usePreloaderDone() {
  return useSyncExternalStore(preloaderStore.subscribe, preloaderStore.isDone, () => false);
}

/**
 * First-visit preloader: an architectural 000 → 100 counter tied to real readiness (fonts loaded +
 * hero portrait decoded), at least 650ms and at most 1.4s, then a curtain lift that hands over to
 * the Hero entrance. Runs once per browser session; skipped entirely for reduced motion.
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const html = document.documentElement;
    const overlay = rootRef.current;
    if (html.dataset.preloaded || !overlay) {
      preloaderStore.markDone();
      return;
    }

    let ready = false;
    const portrait = document.querySelector<HTMLImageElement>("img[data-hero-portrait]");
    void Promise.all([document.fonts?.ready, portrait?.decode?.().catch(() => undefined)]).then(() => {
      ready = true;
    });

    const start = performance.now();
    let shown = 0;
    let frame = 0;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      try {
        sessionStorage.setItem(PRELOADER_STORAGE_KEY, "1");
      } catch {
        /* storage unavailable: preloader may show again next visit */
      }
      preloaderStore.markDone(); // Hero entrance starts while the curtain lifts
      void animate(overlay, { clipPath: ["inset(0% 0% 0% 0%)", "inset(0% 0% 100% 0%)"] }, { duration: 0.8, ease: [0.76, 0, 0.24, 1] }).then(() => {
        html.dataset.preloaded = "1";
      });
    };

    const step = (now: number) => {
      const elapsed = now - start;
      // Time drives toward 100 but holds at 90 until real readiness (fonts + portrait) arrives.
      const target = Math.min((elapsed / MIN_MS) * 100, ready || elapsed >= MAX_MS ? 100 : 90);
      shown += (target - shown) * 0.18;
      const value = elapsed >= MAX_MS ? 100 : Math.round(shown);
      if (counterRef.current) counterRef.current.textContent = String(value).padStart(3, "0");
      if (barRef.current) barRef.current.style.transform = `scaleX(${value / 100})`;
      if ((value >= 100 && elapsed >= MIN_MS) || elapsed >= MAX_MS + 120) {
        finish();
        return;
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, []);

  // Freeze scrolling while the curtain is down.
  useEffect(() => {
    if (!lenis || document.documentElement.dataset.preloaded) return;
    lenis.stop();
    return preloaderStore.subscribe(() => lenis.start());
  }, [lenis]);

  return (
    <div
      ref={rootRef}
      data-preloader
      aria-hidden="true"
      className="fixed inset-0 z-[120] flex flex-col justify-between bg-ink p-10 text-white [clip-path:inset(0%_0%_0%_0%)] preloaded:hidden max-md:p-5"
    >
      <div className="flex items-center justify-between text-small text-white/55">
        <span>Adeeb Alsaleh</span>
        <span>Portfolio © 2026</span>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-6">
          <span ref={counterRef} className="text-[min(24vw,260px)] leading-[0.78] font-medium tracking-[-0.06em] tabular-nums">
            000
          </span>
          <span className="pb-3 text-small text-white/55 max-md:hidden">Loading experience</span>
        </div>
        <span className="relative block h-px w-full overflow-hidden bg-white/15">
          <span ref={barRef} className="absolute inset-0 origin-left bg-violet [transform:scaleX(0)]" />
        </span>
      </div>
    </div>
  );
}
