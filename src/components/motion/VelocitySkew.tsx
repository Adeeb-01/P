"use client";

import { m, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { usePointerEffects } from "@/components/motion/hooks";

/** Applies a spring-damped skewY proportional to scroll velocity (±3° max) so fast scrolling feels physical. */
export function VelocitySkew({ children, className }: { children: React.ReactNode; className?: string }) {
  const enabled = usePointerEffects();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { stiffness: 120, damping: 30, mass: 0.6 });
  const skewY = useTransform(smooth, [-3000, 0, 3000], [3, 0, -3], { clamp: true });

  return (
    <m.div style={enabled ? { skewY } : undefined} className={className}>
      {children}
    </m.div>
  );
}
