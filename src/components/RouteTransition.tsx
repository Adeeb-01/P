"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { m, type TargetAndTransition } from "motion/react";
import clsx from "clsx";
import { sound } from "@/lib/sound";
import { Portal } from "@/components/Portal";
import { usePrefersReducedMotion } from "@/components/motion/hooks";

type Curtain = "idle" | "covering" | "covered" | "revealing";

const COVER_MS = 460;
/** If a navigation never lands (failed push / same route), uncover and unlock after this long. */
const NAVIGATION_TIMEOUT_MS = 1500;
const EASE_CURTAIN = [0.76, 0, 0.24, 1] as const;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** One key per page: "/", "/works", "/works/easy-learning", "/contact" (trailing slashes ignored). */
function routeKey(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "");
  return normalized === "" ? "home" : normalized;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Route transitions: intercept internal cross-route clicks, sweep a theme-aware curtain up over the
 * page (synced with the procedural whoosh), navigate while covered, then wipe the curtain away
 * upward. Back/forward navigation starts covered and only reveals. Reduced motion: a short fade.
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const reduced = usePrefersReducedMotion();
  const [curtain, setCurtain] = useState<Curtain>("idle");
  const [faded, setFaded] = useState(false);
  const busy = useRef(false);
  const watchdog = useRef(0);
  const renderedPath = useRef(pathname);
  const isHome = routeKey(pathname) === "home";

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      if (event.detail > 0 && link.closest('[data-swipe-blocked="true"]')) { event.preventDefault(); return; }
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(href)) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (routeKey(url.pathname) === routeKey(window.location.pathname)) return;

      event.preventDefault();
      if (busy.current) return;
      busy.current = true;
      sound.whoosh();
      const instant = prefersReducedMotion();
      if (instant) setFaded(true);
      else setCurtain("covering");
      window.setTimeout(() => router.push(url.pathname + url.search + url.hash), instant ? 120 : COVER_MS);
      // Watchdog: never leave the page covered / locked if the route doesn't change.
      window.clearTimeout(watchdog.current);
      watchdog.current = window.setTimeout(() => {
        busy.current = false;
        setFaded(false);
        setCurtain((current) => (current === "idle" ? current : "revealing"));
      }, (instant ? 120 : COVER_MS) + NAVIGATION_TIMEOUT_MS);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // New route rendered: reveal (from covered, or instantly covered first for back/forward).
  useEffect(() => {
    if (renderedPath.current === pathname) return;
    renderedPath.current = pathname;
    // Navigation has landed: unlock immediately so the next link click is never swallowed.
    busy.current = false;
    window.clearTimeout(watchdog.current);
    let frame = 0;
    if (prefersReducedMotion()) {
      frame = requestAnimationFrame(() => setFaded(false));
    } else {
      frame = requestAnimationFrame(() => {
        setCurtain((current) => (current === "idle" ? "covered" : current));
        frame = requestAnimationFrame(() => {
          frame = requestAnimationFrame(() => setCurtain("revealing"));
        });
      });
    }
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => () => window.clearTimeout(watchdog.current), []);

  // Two stacked panels: a violet leading edge followed by the theme's inverse colour.
  const panel = (delay: number): Record<Curtain, TargetAndTransition> => ({
    idle: { scaleY: 0, originY: 1, transition: { duration: 0 } },
    covering: { scaleY: 1, originY: 1, transition: { duration: COVER_MS / 1000 - 0.06, ease: EASE_CURTAIN, delay } },
    covered: { scaleY: 1, originY: 0, transition: { duration: 0 } },
    revealing: { scaleY: 0, originY: 0, transition: { duration: 0.62, ease: EASE_CURTAIN, delay: 0.06 - delay } },
  });

  return (
    <>
      <m.div
        data-route-content
        initial={false}
        animate={{ opacity: faded ? 0 : 1, transition: { duration: faded ? 0.12 : 0.3, ease: EASE_OUT } }}
        className={clsx(
          curtain === "idle" && !isHome && !faded && "animate-route-enter",
          // Only block input while the old page is being covered — the new page is live as it reveals.
          (curtain === "covering" || curtain === "covered") && "pointer-events-none",
        )}
      >
        {children}
      </m.div>
      {!reduced && (
        <Portal>
          <div aria-hidden="true" data-route-curtain={curtain} className="pointer-events-none fixed inset-0 z-[110]">
            <m.div
              initial={false}
              animate={curtain}
              variants={panel(0)}
              onAnimationComplete={(definition) => {
                // The violet panel finishes last on reveal.
                if (definition === "revealing") setCurtain("idle");
              }}
              className="absolute inset-0 bg-violet"
              style={{ scaleY: 0 }}
            />
            <m.div initial={false} animate={curtain} variants={panel(0.06)} className="absolute inset-0 bg-inverse" style={{ scaleY: 0 }} />
          </div>
        </Portal>
      )}
    </>
  );
}
