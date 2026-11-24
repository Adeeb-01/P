"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { m, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { usePointerEffects, usePrefersReducedMotion } from "@/components/motion/hooks";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SoundToggle } from "@/components/sound/SoundToggle";
import { openQuickJump } from "@/components/works/ProjectQuickJump";
import { useLenis } from "@/components/motion/SmoothScroll";
import { useControlsHidden } from "./useControlsHidden";

const TILE = 44; // resting tile size (px)
const GAP = 6;
const RANGE = 150; // influence radius of the magnification bell (px)
const AMPLITUDE = 0.62; // peak extra scale at the cursor
const SPRING = { stiffness: 420, damping: 32, mass: 0.5 };
const RING_R = 15;
const RING_C = 2 * Math.PI * RING_R;

/** Cosine-bell magnification + neighbour spreading for every tile, from one pointer position. */
function layoutFor(pointer: number, centers: number[]) {
  const scales = centers.map((center) => {
    if (pointer < 0) return 1;
    const distance = Math.abs(pointer - center);
    return distance < RANGE ? 1 + AMPLITUDE * Math.cos((Math.PI * distance) / (2 * RANGE)) : 1;
  });
  const extra = scales.map((scale) => (scale - 1) * TILE);
  const total = extra.reduce((sum, value) => sum + value, 0);
  let before = 0;
  const offsets = extra.map((value) => {
    const offset = before + value / 2 - total / 2;
    before += value;
    return offset;
  });
  return { scales, offsets, total };
}

function Tile({
  index,
  label,
  centers,
  pointer,
  active,
  children,
}: {
  index: number;
  label: string;
  centers: number[];
  pointer: MotionValue<number>;
  active?: boolean;
  children: ReactNode;
}) {
  const scale = useSpring(useTransform(pointer, (value) => layoutFor(value, centers).scales[index] ?? 1), SPRING);
  const x = useSpring(useTransform(pointer, (value) => layoutFor(value, centers).offsets[index] ?? 0), SPRING);
  const y = useTransform(scale, (value) => -(value - 1) * 14);

  return (
    <m.div data-dock-tile style={{ scale, x, y, width: TILE, height: TILE }} className="group/tile relative origin-bottom">
      <div className="grid h-full w-full place-items-center rounded-2xl bg-fg/[0.06] text-fg transition-colors group-hover/tile:bg-fg/[0.1] [&>*]:h-full [&>*]:w-full [&>*]:rounded-2xl">
        {children}
      </div>
      <span
        role="presentation"
        className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-lg bg-inverse px-2 py-1 text-[11px] leading-none font-medium whitespace-nowrap text-on-inverse opacity-0 transition-opacity duration-150 group-focus-within/tile:opacity-100 group-hover/tile:opacity-100"
      >
        <ScrambleText text={label} />
      </span>
      {active && <span aria-hidden="true" className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-violet" />}
    </m.div>
  );
}

const iconClass = "h-[18px] w-[18px]";
const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z" />
    </svg>
  ),
  works: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </svg>
  ),
  contact: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  ),
};

const LINKS = [
  { href: "/", label: "Home", icon: ICONS.home, match: (path: string) => path === "/" },
  { href: "/works", label: "Works", icon: ICONS.works, match: (path: string) => path.startsWith("/works") },
  { href: "/contact", label: "Contact", icon: ICONS.contact, match: (path: string) => path.startsWith("/contact") },
];

/**
 * macOS-style floating dock (≥810px). Appears after the hero, hides while scrolling down and
 * returns on scroll-up / idle. Tile centres are measured on mount/resize (offsetLeft) — never per move.
 */
export function SpatialDock() {
  const pathname = usePathname();
  const magnify = usePointerEffects();
  const reduced = usePrefersReducedMotion();
  const dockRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const controlsHidden = useControlsHidden(shellRef);
  const dockLeft = useRef(0);
  const pointer = useMotionValue(-1);
  const [centers, setCenters] = useState<number[]>([]);
  const [shown, setShown] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const lenis = useLenis();
  const ringOffset = useTransform(scrollYProgress, (progress) => RING_C * (1 - progress));
  const lastY = useRef(0);
  const idleTimer = useRef(0);

  // ── Measure tile centres (layout positions are unaffected by transforms) ──
  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;
    const measure = () => {
      const tiles = Array.from(dock.querySelectorAll<HTMLElement>("[data-dock-tile]"));
      setCenters(tiles.map((tile) => tile.offsetLeft + tile.offsetWidth / 2));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(dock);
    return () => observer.disconnect();
  }, []);

  // ── Show / hide with scroll direction ──
  useMotionValueEvent(scrollY, "change", (y) => {
    const delta = y - lastY.current;
    lastY.current = y;
    window.clearTimeout(idleTimer.current);
    const past = y > window.innerHeight * 0.6;
    if (!past) setShown(false);
    else if (delta > 6) setShown(false);
    else if (delta < -4) setShown(true);
    if (past) idleTimer.current = window.setTimeout(() => setShown(true), 700);
  });
  useEffect(() => () => window.clearTimeout(idleTimer.current), []);

  const total = useTransform(pointer, (value) => layoutFor(value, centers).total);
  const bgScale = useSpring(
    useTransform(total, (value) => 1 + value / Math.max(1, dockRef.current?.offsetWidth ?? 1)),
    SPRING,
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const items = Array.from(dockRef.current?.querySelectorAll<HTMLElement>("[data-dock-tile] a, [data-dock-tile] button") ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (index < 0) return;
    event.preventDefault();
    items[(index + (event.key === "ArrowRight" ? 1 : -1) + items.length) % items.length]?.focus();
  };

  return (
    <m.div
      ref={shellRef}
      initial={false}
      animate={shown && !controlsHidden ? { y: 0, opacity: 1 } : { y: 110, opacity: 0 }}
      transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 30 }}
      inert={!shown || controlsHidden}
      className="fixed bottom-5 left-1/2 z-[55] -translate-x-1/2 max-md:hidden"
    >
      <div
        ref={dockRef}
        role="toolbar"
        aria-label="Quick navigation"
        onKeyDown={onKeyDown}
        onPointerEnter={() => {
          dockLeft.current = dockRef.current?.getBoundingClientRect().left ?? 0;
        }}
        onPointerMove={(event) => {
          if (magnify) pointer.set(event.clientX - dockLeft.current);
        }}
        onPointerLeave={() => pointer.set(-1)}
        className="relative flex items-end px-3 py-2.5"
        style={{ gap: GAP }}
      >
        <m.div
          aria-hidden="true"
          style={{ scaleX: bgScale }}
          className="absolute inset-0 -z-[1] rounded-[22px] border border-fg/[0.08] bg-canvas/75 shadow-[0_20px_50px_-20px_rgba(17,17,17,0.45)] backdrop-blur-xl backdrop-saturate-150"
        />
        {LINKS.map((link, index) => (
          <Tile key={link.href} index={index} label={link.label} centers={centers} pointer={pointer} active={link.match(pathname)}>
            <Link href={link.href} aria-label={link.label} aria-current={link.match(pathname) ? "page" : undefined} className="grid place-items-center">
              {link.icon}
            </Link>
          </Tile>
        ))}
        <span aria-hidden="true" className="mx-1 mb-2 h-7 w-px self-end bg-fg/15" />
        <Tile index={3} label="Search ⌘K" centers={centers} pointer={pointer}>
          <button type="button" aria-label="Open quick jump" onClick={(event) => openQuickJump(event.currentTarget)} className="grid cursor-pointer place-items-center border-0 bg-transparent text-fg">
            {ICONS.search}
          </button>
        </Tile>
        <Tile index={4} label="Theme" centers={centers} pointer={pointer}>
          <ThemeToggle className="h-full w-full rounded-2xl hover:bg-transparent" />
        </Tile>
        <Tile index={5} label="Sound" centers={centers} pointer={pointer}>
          <SoundToggle className="h-full w-full rounded-2xl hover:bg-transparent" />
        </Tile>
        <Tile index={6} label="Back to top" centers={centers} pointer={pointer}>
          <button
            type="button"
            aria-label="Back to top"
            onClick={() => (lenis && !reduced ? lenis.scrollTo(0, { duration: 1.4 }) : window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" }))}
            className="relative grid cursor-pointer place-items-center border-0 bg-transparent text-fg"
          >
            {/* Radial reading progress: stroke-dashoffset follows scrollYProgress. */}
            <svg viewBox="0 0 36 36" aria-hidden="true" className="absolute inset-0 m-auto h-[36px] w-[36px] -rotate-90">
              <circle cx="18" cy="18" r={RING_R} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
              <m.circle cx="18" cy="18" r={RING_R} fill="none" stroke="var(--color-violet)" strokeWidth="2" strokeLinecap="round" strokeDasharray={RING_C} style={{ strokeDashoffset: ringOffset }} />
            </svg>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="relative h-[14px] w-[14px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M6 11l6-6 6 6" />
            </svg>
          </button>
        </Tile>
      </div>
    </m.div>
  );
}
