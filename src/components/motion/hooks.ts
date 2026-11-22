"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore, type PointerEvent as ReactPointerEvent } from "react";
import { useMotionValue, useSpring, type SpringOptions } from "motion/react";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeQuery(query: string) {
  return (callback: () => void) => {
    const list = window.matchMedia(query);
    list.addEventListener("change", callback);
    return () => list.removeEventListener("change", callback);
  };
}
const subscribeReducedMotion = subscribeQuery(REDUCED_MOTION);

/**
 * Hydration-safe reduced-motion preference: `false` during SSR and hydration, then the real value.
 * Use this (not Motion's useReducedMotion) whenever the value changes what is rendered.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(REDUCED_MOTION).matches, () => false);
}

const subscribeFinePointer = subscribeQuery(FINE_POINTER);

/** True only for precise, hover-capable pointers (mouse / trackpad). Always false during SSR. */
export function useFinePointer() {
  return useSyncExternalStore(
    subscribeFinePointer,
    () => window.matchMedia(FINE_POINTER).matches,
    () => false,
  );
}

/** Pointer-driven effects run only for fine pointers and when the user has not asked for reduced motion. */
export function usePointerEffects() {
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  return fine && !reduced;
}

/**
 * Rect cache for pointer-driven effects: an element is measured at most once per pointer entry /
 * scroll / resize instead of calling getBoundingClientRect() on every pointermove.
 */
export function useCachedRect() {
  const rect = useRef<DOMRect | null>(null);
  useEffect(() => {
    const invalidate = () => {
      rect.current = null;
    };
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    return () => {
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
    };
  }, []);
  const measure = useCallback((element: Element) => (rect.current ??= element.getBoundingClientRect()), []);
  const reset = useCallback(() => {
    rect.current = null;
  }, []);
  return { measure, reset };
}

export const SPRING_SOFT: SpringOptions = { stiffness: 180, damping: 18, mass: 0.4 };
export const SPRING_SNAPPY: SpringOptions = { stiffness: 380, damping: 30, mass: 0.6 };

/**
 * Magnetic pull: the element drifts toward the pointer (by `strength` of the offset from its centre)
 * and springs back on leave. Returns spring-smoothed x/y motion values plus pointer handlers.
 */
export function useMagnetic(strength = 0.28) {
  const enabled = usePointerEffects();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_SOFT);
  const y = useSpring(rawY, SPRING_SOFT);
  const { measure, reset } = useCachedRect();

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled) return;
      const rect = measure(event.currentTarget);
      rawX.set((event.clientX - (rect.left + rect.width / 2)) * strength);
      rawY.set((event.clientY - (rect.top + rect.height / 2)) * strength);
    },
    [enabled, rawX, rawY, strength, measure],
  );
  const onPointerLeave = useCallback(() => {
    reset();
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY, reset]);

  return { x, y, onPointerMove, onPointerLeave };
}
