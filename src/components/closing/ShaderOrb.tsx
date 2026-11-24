"use client";

import { useEffect } from "react";
import { m, useMotionValue, useSpring, useTransform } from "motion/react";
import { ShaderObject } from "@/components/ShaderObject";
import { useClosingStage } from "@/components/closing/ClosingStage";
import { usePrefersReducedMotion } from "@/components/motion/hooks";
import type { RefObject } from "react";
import type { ShaderParams } from "@/lib/shader-params";

const TILT = 14;
const SPRING = { stiffness: 120, damping: 16, mass: 0.6 };

/**
 * The WebGL object with an ambient breathing glow and a spring tilt toward the pointer.
 * Pointer tracking spans the whole closing section, and is forwarded to the shader's own
 * mouse uniforms so the surface reacts as the cursor approaches (not only when directly over it).
 */
export function ShaderOrb({ className, params }: { className?: string; params?: RefObject<ShaderParams | null> }) {
  const stage = useClosingStage();
  const enabled = !usePrefersReducedMotion();
  const nx = useMotionValue(0);
  const ny = useMotionValue(0);
  const rotateY = useSpring(useTransform(nx, [-1, 1], [-TILT, TILT]), SPRING);
  const rotateX = useSpring(useTransform(ny, [-1, 1], [TILT, -TILT]), SPRING);
  const glowX = useSpring(useTransform(nx, [-1, 1], [-30, 30]), SPRING);
  const glowY = useSpring(useTransform(ny, [-1, 1], [-30, 30]), SPRING);

  useEffect(() => {
    const element = stage?.current;
    if (!element || !enabled) return;
    let rect: DOMRect | null = null;
    const invalidate = () => {
      rect = null;
    };
    const onMove = (event: PointerEvent) => {
      rect ??= element.getBoundingClientRect(); // cached; invalidated on scroll/resize/leave
      nx.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
      ny.set(Math.max(-1, Math.min(1, ((event.clientY - rect.top) / Math.min(rect.height, 900)) * 2 - 1)));
    };
    const onLeave = () => {
      invalidate();
      nx.set(0);
      ny.set(0);
    };
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerdown", onMove);
    element.addEventListener("pointerup", onLeave);
    element.addEventListener("pointercancel", onLeave);
    element.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    return () => {
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerdown", onMove);
      element.removeEventListener("pointerup", onLeave);
      element.removeEventListener("pointercancel", onLeave);
      element.removeEventListener("pointerleave", onLeave);
    };
  }, [stage, enabled, nx, ny]);

  return (
    <div className="relative grid place-items-center">
      <m.div
        aria-hidden="true"
        style={{ x: glowX, y: glowY }}
        className="pointer-events-none absolute h-[320px] w-[320px] max-[640.98px]:h-[240px] max-[640.98px]:w-[240px]"
      >
        <m.div
          className="h-full w-full rounded-full bg-[radial-gradient(closest-side,rgba(116,48,247,0.45),rgba(116,48,247,0.12)_55%,transparent)]"
          animate={enabled ? { scale: [0.92, 1.08, 0.92], opacity: [0.7, 1, 0.7] } : { scale: 1, opacity: 0.7 }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </m.div>
      <m.div style={enabled ? { rotateX, rotateY, transformPerspective: 600 } : undefined} className="relative">
        <ShaderObject className={className} trackingRoot={stage} params={params} />
      </m.div>
    </div>
  );
}
