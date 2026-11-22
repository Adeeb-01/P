"use client";

import { useEffect, type RefObject } from "react";
import { m, useMotionValue, useSpring, useTransform } from "motion/react";
import { usePointerEffects } from "@/components/motion/hooks";

/**
 * Specular light sweep confined to the portrait's own silhouette (masked by the same cut-out image),
 * following the pointer horizontally. Transform + opacity only.
 */
export function PortraitSheen({ src, pointerRoot }: { src: string; pointerRoot: RefObject<HTMLElement | null> }) {
  const enabled = usePointerEffects();
  const nx = useMotionValue(0.5);
  const active = useMotionValue(0);
  const x = useSpring(useTransform(nx, [0, 1], ["-60%", "60%"]), { stiffness: 140, damping: 22 });
  const opacity = useSpring(active, { stiffness: 120, damping: 24 });

  useEffect(() => {
    const root = pointerRoot.current;
    if (!root || !enabled) return;
    let cachedRect: DOMRect | null = null;
    const invalidate = () => {
      cachedRect = null;
    };
    const onMove = (event: PointerEvent) => {
      const rect = (cachedRect ??= root.getBoundingClientRect()); // cached; invalidated on scroll/resize
      nx.set((event.clientX - rect.left) / rect.width);
      active.set(1);
    };
    const onLeave = () => active.set(0);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    return () => {
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, pointerRoot, nx, active]);

  if (!enabled) return null;
  return (
    <m.span
      aria-hidden="true"
      style={{ opacity, WebkitMaskImage: `url(${src})`, maskImage: `url(${src})`, WebkitMaskSize: "100% 100%", maskSize: "100% 100%", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat" }}
      className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-soft-light"
    >
      <m.span
        style={{ x }}
        className="absolute inset-y-0 left-1/4 w-1/2 bg-[linear-gradient(105deg,transparent_20%,rgba(255,255,255,0.85)_45%,rgba(200,180,255,0.6)_52%,transparent_75%)]"
      />
    </m.span>
  );
}
