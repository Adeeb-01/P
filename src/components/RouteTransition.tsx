"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { m, type TargetAndTransition } from "motion/react";
import clsx from "clsx";
import { sound } from "@/lib/sound";

type Phase = "initial" | "leaving" | "hidden" | "entering" | "idle";

const EXIT_MS = 280;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** One key per page: "/", "/works", "/works/pulma", "/contact" (trailing slashes ignored). */
function routeKey(pathname: string) {
  const normalized = pathname.replace(/\/+$/, "");
  return normalized === "" ? "home" : normalized;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Page transitions: intercept internal cross-route clicks, fade + lift the current page out,
 * let the App Router navigate, then rise the new route in. (AnimatePresence exit animations are
 * unreliable with the App Router, so the exit is driven before navigation instead.)
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("initial");
  const busy = useRef(false);
  const renderedPath = useRef(pathname);
  const isHome = routeKey(pathname) === "home";

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(href)) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (routeKey(url.pathname) === routeKey(window.location.pathname)) return;

      event.preventDefault();
      if (busy.current) return;
      busy.current = true;
      setPhase("leaving");
      sound.whoosh();
      window.setTimeout(() => router.push(url.pathname + url.search + url.hash), prefersReducedMotion() ? 40 : EXIT_MS);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  useEffect(() => {
    if (renderedPath.current === pathname) return;
    renderedPath.current = pathname;
    let frame = 0;
    setPhase((current) => (current === "leaving" ? current : "hidden"));
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setPhase("entering"));
    });
    return () => {
      cancelAnimationFrame(frame);
      busy.current = false;
    };
  }, [pathname]);

  const targets: Record<Phase, TargetAndTransition> = {
    initial: { opacity: 1, y: 0, transition: { duration: 0 } },
    leaving: { opacity: 0, y: -10, transition: { duration: EXIT_MS / 1000, ease: "easeIn" } },
    hidden: { opacity: 0, y: 16, transition: { duration: 0 } },
    entering: { opacity: 1, y: 0, transition: { duration: isHome ? 0.38 : 0.62, ease: EASE_OUT } },
    idle: { opacity: 1, y: 0, transition: { duration: 0 } },
  };

  return (
    <m.div
      data-route-content
      initial={false}
      animate={targets[phase]}
      onAnimationComplete={() => {
        if (phase === "entering") {
          setPhase("idle");
          busy.current = false;
        }
      }}
      className={clsx(phase === "initial" && !isHome && "animate-route-enter", phase === "leaving" && "pointer-events-none")}
    >
      {children}
    </m.div>
  );
}
