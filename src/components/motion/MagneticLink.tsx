"use client";

import { m } from "motion/react";
import { useMagnetic } from "@/components/motion/hooks";

/** Anchor with a spring magnetic pull toward the pointer (fine pointers only, off for reduced motion). */
export function MagneticLink({
  href,
  external = false,
  strength = 0.3,
  className,
  children,
}: {
  href: string;
  external?: boolean;
  strength?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const magnetic = useMagnetic(strength);
  return (
    <m.a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener" : undefined}
      style={{ x: magnetic.x, y: magnetic.y }}
      onPointerMove={magnetic.onPointerMove}
      onPointerLeave={magnetic.onPointerLeave}
      whileTap={{ scale: 0.96 }}
      className={className}
    >
      {children}
    </m.a>
  );
}
