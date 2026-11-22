"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { usePrefersReducedMotion } from "@/components/motion/hooks";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>";
const SWAP_MS = 32;

/**
 * Kinetic "decode" on hover/focus: characters cycle through glyphs and settle left → right.
 * The real text stays in flow (transparent) so width never shifts and assistive tech reads it;
 * the scramble is an aria-hidden overlay. Disabled for reduced motion.
 *
 * Trigger: the closest link/button/[data-scramble-root] ancestor, or the text itself (`self`).
 */
export function ScrambleText({ text, className, self = false, duration = 250 }: { text: string; className?: string; self?: boolean; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState<string | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || reduced) return;
    const host: HTMLElement = (self ? element : element.closest<HTMLElement>("a, button, [data-scramble-root]")) ?? element;
    let frame = 0;

    const run = () => {
      cancelAnimationFrame(frame);
      const start = performance.now();
      let lastSwap = 0;
      const step = (now: number) => {
        const progress = (now - start) / duration;
        if (progress >= 1) {
          setDisplay(null);
          frame = 0;
          return;
        }
        if (now - lastSwap >= SWAP_MS) {
          lastSwap = now;
          setDisplay(
            Array.from(text)
              .map((char, index) => {
                if (char === " ") return " ";
                const settleAt = 0.2 + 0.8 * (index / Math.max(1, text.length));
                return progress >= settleAt ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
              })
              .join(""),
          );
        }
        frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };

    host.addEventListener("pointerenter", run);
    host.addEventListener("focusin", run);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointerenter", run);
      host.removeEventListener("focusin", run);
    };
  }, [text, self, duration, reduced]);

  return (
    <span ref={ref} data-scramble-root={self ? "" : undefined} className={clsx("relative inline-block whitespace-nowrap", className)}>
      <span className={display ? "opacity-0" : undefined}>{text}</span>
      {display && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 whitespace-nowrap">
          {display}
        </span>
      )}
    </span>
  );
}
