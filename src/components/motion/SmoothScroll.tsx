"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { cancelFrame, frame, useReducedMotion } from "motion/react";

// Lenis lives outside React: a tiny external store publishes the active instance.
let activeLenis: Lenis | null = null;
const listeners = new Set<() => void>();
function publish(instance: Lenis | null) {
  activeLenis = instance;
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The active Lenis instance, or null when smooth scrolling is disabled (reduced motion / SSR). */
export function useLenis() {
  return useSyncExternalStore(subscribe, () => activeLenis, () => null);
}

const NAV_OFFSET = -80;

/**
 * Inertial smooth scrolling. Lenis is driven from Motion's frame loop so scroll position and
 * scroll-linked animations update in the same frame. Disabled entirely for reduced motion.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    if (reduced) return;
    const instance = new Lenis({ autoRaf: false, lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    const update = ({ timestamp }: { timestamp: number }) => instance.raf(timestamp);
    frame.update(update, true);
    publish(instance);
    return () => {
      cancelFrame(update);
      instance.destroy();
      publish(null);
    };
  }, [reduced]);

  // Same-page hash links (e.g. "About" while on Home) glide to their target instead of jumping.
  useEffect(() => {
    if (!lenis) return;
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank") return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: NAV_OFFSET, duration: 1.2 });
      window.history.pushState(window.history.state, "", url.hash);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [lenis]);

  // Route changes: drop any leftover inertia and land at the top (or the requested anchor) instantly.
  useEffect(() => {
    if (!lenis) return;
    const id = requestAnimationFrame(() => {
      const hash = window.location.hash ? document.getElementById(decodeURIComponent(window.location.hash.slice(1))) : null;
      lenis.resize();
      lenis.scrollTo(hash ?? 0, { immediate: true, force: true, offset: hash ? NAV_OFFSET : 0 });
    });
    return () => cancelAnimationFrame(id);
  }, [pathname, lenis]);

  return <>{children}</>;
}
