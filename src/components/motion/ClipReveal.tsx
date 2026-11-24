"use client";

import { useRef } from "react";
import { m, useScroll, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "./hooks";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Masked entrance: content wipes open with an inset clip-path the first time it enters view, and
 * scales from `fromScale` to 1 as it travels up the viewport (scroll-linked depth).
 */
export function ClipReveal({
  children,
  className,
  delay = 0,
  fromScale = 0.94,
  radius = 40,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  fromScale?: number;
  radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 55%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [fromScale, 1]);

  return (
    <m.div
      ref={ref}
      style={{ scale: reduced ? 1 : scale }}
      className={className}
      initial={reduced ? false : { clipPath: `inset(14% 8% 14% 8% round ${radius}px)`, opacity: 0.4 }}
      // Ends with negative insets so the settled element (tilt, shadows) is never clipped.
      whileInView={{ clipPath: "inset(-12% -12% -12% -12% round 0px)", opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: reduced ? 0 : 1.1, ease: EASE, delay: reduced ? 0 : delay }}
    >
      {children}
    </m.div>
  );
}
