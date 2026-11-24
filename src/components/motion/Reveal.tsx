"use client";

import { m } from "motion/react";
import { usePrefersReducedMotion } from "./hooks";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fades and lifts its content into place the first time it scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "article" | "header";
}) {
  const Component = m[as];
  const reduced = usePrefersReducedMotion();
  return (
    <Component
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: reduced ? 0 : 0.8, ease: EASE, delay: reduced ? 0 : delay }}
    >
      {children}
    </Component>
  );
}
