"use client";

import Link from "next/link";
import { useRef } from "react";
import { useControlsHidden } from "@/components/dock/useControlsHidden";
import { usePathname } from "next/navigation";
import { ScrambleText } from "@/components/motion/ScrambleText";

/**
 * Floating "Available for Projects" status pill (bottom-right). Links to /contact, so it goes
 * through the RouteTransition curtain and the delegated SoundEngine feedback automatically, and the
 * CustomCursor snaps magnetically around it. Theme-aware glass surface; the live dot's halo pauses
 * for reduced motion. Compact label at narrower widths so it never collides with the centred dock;
 * hidden on /contact itself (it would be redundant and could cover the form's submit button).
 */
export function AvailabilityBadge() {
  const pathname = usePathname();
  const ref = useRef<HTMLAnchorElement>(null);
  const hidden = useControlsHidden(ref, "right");
  if (/^\/contact\/?$/.test(pathname)) return null;

  return (
    <Link
      ref={ref}
      style={{ visibility: hidden ? "hidden" : "visible" }}
      href="/contact"
      data-cursor="magnet"
      aria-label="Available for projects — get in touch"
      className="max-md:hidden fixed right-5 bottom-5 z-40 inline-flex h-10 items-center gap-2.5 rounded-full border border-line/70 bg-elevated/85 pr-4 pl-3.5 text-[13px] leading-none font-medium tracking-[-0.26px] text-fg shadow-[0_10px_30px_-14px_rgba(17,17,17,0.35)] backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-200 hover:border-green/40 hover:shadow-[0_12px_32px_-14px_rgba(0,192,71,0.45)] active:scale-[0.97] max-md:right-4 max-md:bottom-4 max-md:h-9 max-md:pr-3.5 max-md:pl-3"
    >
      <span aria-hidden="true" className="relative flex h-2 w-2 flex-none">
        <span className="absolute inset-0 animate-ping rounded-full bg-green opacity-60 motion-reduce:animate-none" />
        <span className="relative h-full w-full rounded-full bg-green" />
      </span>
      <ScrambleText text="Available for Projects" className="max-[1099.98px]:hidden" />
      <ScrambleText text="Available" className="min-[1100px]:hidden" />
    </Link>
  );
}
