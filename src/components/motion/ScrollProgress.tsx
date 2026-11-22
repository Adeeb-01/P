"use client";

import { m, useScroll, useSpring } from "motion/react";

/** 2px violet reading-progress bar pinned to the top edge of the viewport (scaleX only). */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 34, restDelta: 0.001 });
  return (
    <m.div
      aria-hidden="true"
      style={{ scaleX }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-violet"
    />
  );
}
