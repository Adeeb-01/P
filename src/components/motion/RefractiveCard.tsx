"use client";

import { useEffect, useRef, type PointerEvent, type RefObject } from "react";
import { useMotionValue, useMotionValueEvent, useSpring } from "motion/react";
import clsx from "clsx";
import { useCachedRect, useFinePointer, usePrefersReducedMotion } from "@/components/motion/hooks";

export type RefractionTone = "light" | "dark";

const FILL: Record<RefractionTone, string> = {
  light: "bg-[radial-gradient(420px_circle_at_var(--spot-x)_var(--spot-y),rgba(116,48,247,0.07),transparent_65%)]",
  dark: "bg-[radial-gradient(420px_circle_at_var(--spot-x)_var(--spot-y),rgba(255,255,255,0.07),transparent_65%)]",
};

// Conic "glass rim": a violet edge with a white specular core centred on the pointer angle,
// plus a faint counter-reflection on the opposite side of the card.
const RIM: Record<RefractionTone, string> = {
  light:
    "bg-[conic-gradient(from_calc(var(--rim-angle)_-_62deg),transparent_0deg,rgba(116,48,247,0)_12deg,rgba(116,48,247,0.85)_48deg,rgba(255,255,255,1)_62deg,rgba(116,48,247,0.85)_76deg,rgba(116,48,247,0)_112deg,transparent_200deg,rgba(116,48,247,0.35)_238deg,transparent_262deg)]",
  dark:
    "bg-[conic-gradient(from_calc(var(--rim-angle)_-_62deg),transparent_0deg,rgba(178,140,255,0)_12deg,rgba(178,140,255,0.8)_48deg,rgba(255,255,255,1)_62deg,rgba(178,140,255,0.8)_76deg,rgba(178,140,255,0)_112deg,transparent_200deg,rgba(255,255,255,0.3)_238deg,transparent_262deg)]",
};

/**
 * Angular specular rim lighting. The pointer's angle around the card centre (atan2, from a cached
 * rect — never measured per move) drives a conic-gradient reflection along a masked 1px border.
 * The angle is unwrapped (no 359°→0° spin) and spring-smoothed, then written straight to CSS
 * variables so pointer movement never re-renders React.
 */
export function useRefraction(ref: RefObject<HTMLElement | null>, tone: RefractionTone = "light") {
  const enabled = !usePrefersReducedMotion();
  const fine = useFinePointer();
  const { measure, reset } = useCachedRect();
  const target = useMotionValue(0);
  const angle = useSpring(target, { stiffness: 170, damping: 22, mass: 0.6 });
  const unwrapped = useRef(0);
  const previous = useRef<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled || fine) return;
    let visible = false;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!visible || document.hidden) return;
      const rect = element.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
      target.set(progress * 300 - 60);
      element.style.setProperty("--spot-y", `${progress * 100}%`);
      element.style.setProperty("--rim-strength", "0.5");
    };
    const schedule = () => { if (visible && !frame) frame = requestAnimationFrame(update); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); });
    observer.observe(element);
    const tap = () => { target.set(target.get() + 65); element.style.setProperty("--rim-strength", "1"); };
    element.addEventListener("pointerdown", tap, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      observer.disconnect(); cancelAnimationFrame(frame);
      element.removeEventListener("pointerdown", tap);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [enabled, fine, ref, target]);

  useMotionValueEvent(angle, "change", (value) => {
    ref.current?.style.setProperty("--rim-angle", `${value.toFixed(2)}deg`);
  });

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const element = ref.current;
    if (!enabled || !element) return;
    const rect = measure(element);
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const dx = x - rect.width / 2;
    const dy = y - rect.height / 2;
    element.style.setProperty("--spot-x", `${x}px`);
    element.style.setProperty("--spot-y", `${y}px`);
    // 0deg = top, clockwise — matches conic-gradient's angle convention.
    const raw = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (previous.current === null) {
      unwrapped.current = raw;
      angle.jump(raw);
    } else {
      const delta = ((((raw - previous.current) % 360) + 540) % 360) - 180;
      unwrapped.current += delta;
    }
    previous.current = raw;
    target.set(unwrapped.current);
    // Brighter as the pointer approaches the edge.
    const edge = Math.min(1, Math.hypot(dx / (rect.width / 2), dy / (rect.height / 2)));
    element.style.setProperty("--rim-strength", (0.35 + 0.65 * edge).toFixed(3));
  };
  const onPointerLeave = () => {
    reset();
    previous.current = null;
  };

  const layers = enabled ? (
    <>
      <span aria-hidden="true" className={clsx("pointer-events-none absolute inset-0 z-[3] rounded-[inherit] transition-opacity duration-500", fine ? "opacity-0 group-hover/spot:opacity-100" : "opacity-60", FILL[tone])} />
      <span aria-hidden="true" className={clsx("pointer-events-none absolute inset-0 z-[3] rounded-[inherit] transition-opacity duration-500", fine ? "opacity-0 group-hover/spot:opacity-100" : "opacity-70")}>
        <span
          className={clsx(
            "absolute inset-0 rounded-[inherit] p-px [opacity:var(--rim-strength,0.6)] [mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)]",
            RIM[tone],
          )}
        />
      </span>
    </>
  ) : null;

  return { onPointerMove, onPointerLeave, layers, rootClass: "group/spot [--rim-angle:0deg] [--spot-x:50%] [--spot-y:0%]" };
}

/** Card element with angular specular rim lighting (see useRefraction). */
export function RefractiveCard({
  as: Component = "article",
  tone = "light",
  className,
  children,
  ...rest
}: {
  as?: "article" | "aside" | "div";
  tone?: RefractionTone;
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "children">) {
  const ref = useRef<HTMLElement>(null);
  const { onPointerMove, onPointerLeave, layers, rootClass } = useRefraction(ref, tone);

  return (
    <Component
      {...rest}
      ref={ref as React.Ref<never>}
      onPointerMove={(event: PointerEvent<HTMLElement>) => {
        rest.onPointerMove?.(event);
        onPointerMove(event);
      }}
      onPointerLeave={(event: PointerEvent<HTMLElement>) => {
        onPointerLeave();
        rest.onPointerLeave?.(event);
      }}
      className={clsx(rootClass, className)}
    >
      {children}
      {layers}
    </Component>
  );
}
