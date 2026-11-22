"use client";

import { createContext, useContext, useEffect, useMemo, useRef, type RefObject } from "react";
import { m, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { usePointerEffects } from "@/components/motion/hooks";

export type ProximityOptions = {
  /** Influence radius in CSS px. */
  radius?: number;
  /** Max upward lift in px at the pointer. */
  lift?: number;
  /** Max extra scale at the pointer. */
  scale?: number;
  /** Max tilt in degrees (sign follows the side the pointer is on). */
  rotate?: number;
};

type Field = {
  enabled: boolean;
  px: MotionValue<number>;
  py: MotionValue<number>;
  centers: RefObject<Float32Array>;
  options: Required<ProximityOptions>;
};

const FieldContext = createContext<Field | null>(null);
const OFF = -99999;
const SPRING = { stiffness: 260, damping: 20, mass: 0.6 };

/**
 * Sets up a proximity field over `containerRef` (which must be `position: relative` and the
 * offsetParent of its [data-pchar] children). Character centres are measured with offsetLeft/Top on
 * mount, after fonts load and on resize — never on pointer move. The pointer is tracked on
 * `pointerRoot` relative to the container's cached rect.
 */
export function useProximityField(
  containerRef: RefObject<HTMLElement | null>,
  pointerRoot: RefObject<HTMLElement | null>,
  options: ProximityOptions = {},
): Field {
  const enabled = usePointerEffects();
  const px = useMotionValue(OFF);
  const py = useMotionValue(OFF);
  const centers = useRef<Float32Array>(new Float32Array(0));
  const { radius = 160, lift = 10, scale = 0.12, rotate = 6 } = options;

  useEffect(() => {
    const container = containerRef.current;
    const root = pointerRoot.current ?? container;
    if (!enabled || !container || !root) return;

    // Layout-space offset of `element` within `container`. Walks the offsetParent chain because
    // intermediate wrappers (e.g. `will-change: transform` reveal spans) become offsetParents.
    // offsetLeft/Top ignore transforms, so reveal/lift animations never skew the measurement.
    const offsetWithin = (element: HTMLElement) => {
      let x = 0;
      let y = 0;
      let node: HTMLElement | null = element;
      while (node && node !== container) {
        x += node.offsetLeft;
        y += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return [x, y] as const;
    };
    const measure = () => {
      const chars = container.querySelectorAll<HTMLElement>("[data-pchar]");
      const next = new Float32Array(chars.length * 2);
      chars.forEach((char, index) => {
        const [x, y] = offsetWithin(char);
        next[index * 2] = x + char.offsetWidth / 2;
        next[index * 2 + 1] = y + char.offsetHeight / 2;
      });
      centers.current = next;
    };
    measure();
    void document.fonts?.ready.then(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(container);

    let rect: DOMRect | null = null;
    const invalidate = () => {
      rect = null;
    };
    const onMove = (event: PointerEvent) => {
      rect ??= container.getBoundingClientRect(); // cached; invalidated on scroll/resize/leave
      px.set(event.clientX - rect.left);
      py.set(event.clientY - rect.top);
    };
    const onLeave = () => {
      invalidate();
      px.set(OFF);
      py.set(OFF);
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    return () => {
      observer.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
    };
  }, [enabled, containerRef, pointerRoot, px, py]);

  return useMemo(() => ({ enabled, px, py, centers, options: { radius, lift, scale, rotate } }), [enabled, px, py, radius, lift, scale, rotate]);
}

export function ProximityProvider({ field, children }: { field: Field; children: React.ReactNode }) {
  return <FieldContext.Provider value={field}>{children}</FieldContext.Provider>;
}

/** Smoothstep falloff 1 → 0 across the radius. */
function influence(dx: number, dy: number, radius: number) {
  const t = Math.max(0, 1 - Math.hypot(dx, dy) / radius);
  return t * t * (3 - 2 * t);
}

function ActiveChar({ char, index, field, className }: { char: string; index: number; field: Field; className?: string }) {
  const { px, py, centers, options } = field;
  const sample = (x: number, y: number) => {
    const c = centers.current;
    if (x === OFF || c.length < index * 2 + 2) return { t: 0, dx: 0 };
    const dx = x - c[index * 2];
    return { t: influence(dx, y - c[index * 2 + 1], options.radius), dx };
  };
  const y = useSpring(useTransform([px, py], ([x, yy]: number[]) => -options.lift * sample(x, yy).t), SPRING);
  const s = useSpring(useTransform([px, py], ([x, yy]: number[]) => 1 + options.scale * sample(x, yy).t), SPRING);
  const r = useSpring(
    useTransform([px, py], ([x, yy]: number[]) => {
      const { t, dx } = sample(x, yy);
      return -Math.sign(dx) * options.rotate * t * Math.min(1, Math.abs(dx) / 40);
    }),
    SPRING,
  );
  return (
    <m.span data-pchar aria-hidden="true" style={{ y, scale: s, rotate: r }} className={className ?? "inline-block"}>
      {char}
    </m.span>
  );
}

/**
 * One character of a proximity field. Inside a disabled field (touch / reduced motion) it renders
 * a plain inline-block span with no motion values at all.
 */
export function ProximityChar({ char, index, className }: { char: string; index: number; className?: string }) {
  const field = useContext(FieldContext);
  if (!field?.enabled) {
    return (
      <span data-pchar aria-hidden="true" className={className ?? "inline-block"}>
        {char}
      </span>
    );
  }
  return <ActiveChar char={char} index={index} field={field} className={className} />;
}
