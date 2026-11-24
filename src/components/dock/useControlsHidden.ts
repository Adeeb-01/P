"use client";

import { useEffect, useState, type RefObject } from "react";
import { usePathname } from "next/navigation";

/** Shared exclusion rules for floating controls: overlays, keyboard, and underlying actions. */
export function useControlsHidden(ref: RefObject<HTMLElement | null>, alignment: "center" | "right" = "center") {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let frame = 0;
    let settleUntil = 0;
    const viewport = window.visualViewport;
    const visible = new Set<Element>();
    const observed = new Set<Element>();
    const check = () => {
      frame = 0;
      const bar = ref.current;
      if (!bar || !bar.offsetWidth) return;
      const editing = document.activeElement?.matches("input,textarea,[contenteditable=true]");
      const keyboard = viewport && window.innerHeight - viewport.height > 140;
      const modal = document.querySelector('[aria-modal="true"], [aria-controls="mobile-navigation"][aria-expanded="true"]');
      // Use resting geometry: the show/hide transform must not feed back into collision detection.
      const width = bar.offsetWidth;
      const height = bar.offsetHeight;
      const style = getComputedStyle(bar);
      const left = alignment === "center" ? (window.innerWidth - width) / 2 : window.innerWidth - width - (parseFloat(style.right) || 20);
      const bottom = parseFloat(style.bottom) || 12;
      const top = window.innerHeight - bottom - height;
      const collision = [...visible].some((element) => {
        const r = element.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.right > left - 8 && r.left < left + width + 8 && r.bottom > top - 8 && r.top < top + height + 8;
      });
      setHidden(Boolean(modal || editing || keyboard || collision));
      if (performance.now() < settleUntil) frame = requestAnimationFrame(check);
    };
    const schedule = () => {
      // Entry transforms keep moving after the last scroll event.
      settleUntil = performance.now() + 800;
      if (!frame) frame = requestAnimationFrame(check);
    };
    const intersection = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      schedule();
    });
    const observeActions = () => {
      observed.forEach((el) => {
        if (!el.isConnected) { intersection.unobserve(el); observed.delete(el); visible.delete(el); }
      });
      document.querySelectorAll('[data-route-content] button,[data-route-content] input,[data-route-content] textarea,[data-route-content] [role="slider"],[data-route-content] a,footer p').forEach((el) => {
        if (!observed.has(el)) { observed.add(el); intersection.observe(el); }
      });
      schedule();
    };
    const mutation = new MutationObserver((records) => {
      if (records.some((r) => r.type === "childList" && [...r.addedNodes, ...r.removedNodes].some((node) => node.nodeType === Node.ELEMENT_NODE))) observeActions();
      else schedule();
    });
    mutation.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-expanded", "aria-modal"] });
    observeActions();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    viewport?.addEventListener("resize", schedule);
    viewport?.addEventListener("scroll", schedule);
    document.addEventListener("focusin", schedule);
    document.addEventListener("focusout", schedule);
    return () => {
      cancelAnimationFrame(frame);
      intersection.disconnect();
      mutation.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      viewport?.removeEventListener("resize", schedule);
      viewport?.removeEventListener("scroll", schedule);
      document.removeEventListener("focusin", schedule);
      document.removeEventListener("focusout", schedule);
    };
  }, [pathname, ref, alignment]);
  return hidden;
}
