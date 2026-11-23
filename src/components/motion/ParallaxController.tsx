"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { usePrefersReducedMotion } from "@/components/motion/hooks";

const MIN_WIDTH = 810;

/**
 * Global parallax depth for elements marked `data-parallax-speed="0.06"` (positive = drifts slower
 * than the page). Element centres are cached (re-measured when the document height changes) and
 * each scroll frame only writes transforms. Use on dedicated wrapper elements so it never fights
 * other transform animations. Disabled for reduced motion and below 810px.
 */
export function ParallaxController() {
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let items: { element: HTMLElement; center: number; speed: number }[] = [];
    let frame = 0;

    const apply = () => {
      frame = 0;
      const active = window.innerWidth >= MIN_WIDTH;
      const middle = window.scrollY + window.innerHeight / 2;
      for (const item of items) {
        item.element.style.transform = active ? `translate3d(0, ${((middle - item.center) * item.speed).toFixed(1)}px, 0)` : "";
      }
    };
    const measure = () => {
      items = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax-speed]")).map((element) => {
        const previous = element.style.transform;
        element.style.transform = "";
        const rect = element.getBoundingClientRect();
        element.style.transform = previous;
        return { element, center: rect.top + window.scrollY + rect.height / 2, speed: Number(element.dataset.parallaxSpeed) || 0 };
      });
      apply();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const start = requestAnimationFrame(measure);
    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(start);
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      items.forEach((item) => (item.element.style.transform = ""));
    };
  }, [pathname, reduced]);

  return null;
}
