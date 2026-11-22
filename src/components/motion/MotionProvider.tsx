"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import { SmoothScroll } from "@/components/motion/SmoothScroll";

// Feature bundle is code-split so the initial JS only carries the lightweight `m` renderer.
const loadFeatures = () => import("@/components/motion/features").then((module) => module.default);

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user" transition={{ type: "spring", stiffness: 260, damping: 30 }}>
        <SmoothScroll>{children}</SmoothScroll>
      </MotionConfig>
    </LazyMotion>
  );
}
