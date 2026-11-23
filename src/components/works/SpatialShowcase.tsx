"use client";

import { useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { m, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import clsx from "clsx";
import { ProjectCard } from "@/components/ProjectCard";
import { VelocitySkew } from "@/components/motion/VelocitySkew";
import { ClipReveal } from "@/components/motion/ClipReveal";
import { useLenis } from "@/components/motion/SmoothScroll";
import { useFinePointer, usePrefersReducedMotion } from "@/components/motion/hooks";
import type { Project } from "@/lib/projects";

type View = "track" | "grid";
const STORAGE_KEY = "mc-works-view";
const WIDE = "(min-width: 1200px)";

const subscribeWide = (callback: () => void) => {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const useWide = () => useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => false);

function readStoredView(): View | null {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    return value === "track" || value === "grid" ? value : null;
  } catch {
    return null;
  }
}

// ── Track: one card on the curved Z arc ──
function TrackCard({ project, index, progress, count }: { project: Project; index: number; progress: MotionValue<number>; count: number }) {
  const rel = useTransform(progress, (p) => index - p * (count - 1));
  const x = useTransform(rel, (r) => `${r * 58}vw`);
  const rotateY = useTransform(rel, (r) => Math.max(-40, Math.min(40, -r * 26)));
  const z = useTransform(rel, (r) => -Math.min(Math.abs(r), 2.2) * 260);
  const scale = useTransform(rel, (r) => 1 - Math.min(Math.abs(r), 2) * 0.1);
  const dim = useTransform(rel, (r) => Math.min(Math.abs(r), 1.4) * 0.5);

  return (
    <m.div
      style={{ x, rotateY, z, scale, transformPerspective: 1400 }}
      className="absolute top-1/2 left-1/2 w-[min(820px,60vw)] -translate-x-1/2 -translate-y-1/2 will-change-transform"
    >
      <ProjectCard project={project} variant="gallery" />
      {/* Peripheral dimming toward the page colour (opacity only — no blur, keeps 60fps). */}
      <m.span aria-hidden="true" style={{ opacity: dim }} className="pointer-events-none absolute inset-0 rounded-5xl bg-canvas" />
    </m.div>
  );
}

function SpatialTrack({ projects }: { projects: Project[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const count = projects.length;
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.6, restDelta: 0.0005 });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const next = Math.round(p * (count - 1));
    setActive((current) => (current === next ? current : next));
  });

  // Scroll position that centres card `index` (section offsets measured on demand, not per frame).
  const scrollToRatio = (ratio: number, immediate = false) => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const travel = section.offsetHeight - window.innerHeight;
    const y = top + Math.max(0, Math.min(1, ratio)) * travel;
    if (lenis) lenis.scrollTo(y, immediate ? { immediate: true } : { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
  };
  const goTo = (index: number) => scrollToRatio(Math.max(0, Math.min(count - 1, index)) / (count - 1));

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    const keys: Record<string, number> = { ArrowRight: active + 1, ArrowDown: active + 1, ArrowLeft: active - 1, ArrowUp: active - 1, Home: 0, End: count - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    goTo(keys[event.key]);
  };

  const scrubRect = useRef<DOMRect | null>(null);
  const scrub = (event: PointerEvent<HTMLDivElement>) => {
    const rect = scrubRect.current;
    if (!rect) return;
    scrollToRatio((event.clientX - rect.left) / rect.width, true);
  };

  return (
    <div ref={sectionRef} data-works-track style={{ height: `${100 + count * 55}vh` }} className="relative">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <section
          aria-roledescription="carousel"
          aria-label="Projects — spatial track. Use arrow keys to move between projects."
          tabIndex={0}
          onKeyDown={onKeyDown}
          // No preserve-3d here: each card carries its own transformPerspective, and a shared 3D context
          // would make the stage coplanar with the centred card and steal its clicks.
          className="relative flex-1 focus-visible:outline-offset-[-6px]"
        >
          {projects.map((project, index) => (
            <TrackCard key={project.slug} project={project} index={index} progress={progress} count={count} />
          ))}
        </section>

        <div className="mx-auto mb-10 flex w-[min(1120px,calc(100%-80px))] items-center gap-6">
          <span className="w-28 text-credit text-muted tabular-nums">
            {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
          <div
            role="slider"
            tabIndex={0}
            aria-label="Project position"
            aria-valuemin={1}
            aria-valuemax={count}
            aria-valuenow={active + 1}
            aria-valuetext={`${projects[active]?.title} (${active + 1} of ${count})`}
            onKeyDown={onKeyDown}
            onPointerDown={(event) => {
              scrubRect.current = event.currentTarget.getBoundingClientRect();
              event.currentTarget.setPointerCapture(event.pointerId);
              scrub(event);
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) scrub(event);
            }}
            className="relative h-10 flex-1 cursor-pointer touch-none"
          >
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-fg/15" />
            {/* Progress fill: scaleX only (GPU). */}
            <m.span style={{ scaleX: progress }} className="absolute inset-x-0 top-1/2 h-[2px] origin-left -translate-y-1/2 bg-fg" />
            {projects.map((project, index) => (
              <span
                key={project.slug}
                aria-hidden="true"
                style={{ left: `${(index / (count - 1)) * 100}%` }}
                className={clsx("absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors", index === active ? "bg-violet" : "bg-fg/25")}
              />
            ))}
          </div>
          <span className="w-40 truncate text-right text-small font-medium text-fg">{projects[active]?.title}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * /works showcase with a view switcher: a scroll-driven 3D spatial track (desktop, fine pointer,
 * motion allowed) or the editorial grid. The choice persists for the session.
 */
export function SpatialShowcase({ projects }: { projects: Project[] }) {
  const wide = useWide();
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const spatialAllowed = wide && fine && !reduced;
  const [chosen, setChosen] = useState<View | null>(null);
  const stored = useSyncExternalStore(
    () => () => {},
    () => readStoredView(),
    () => null,
  );
  const view: View = spatialAllowed ? (chosen ?? stored ?? "track") : "grid";

  const choose = (next: View) => {
    setChosen(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      {spatialAllowed && (
        <div className="mx-auto mb-10 flex w-[min(1120px,calc(100%-80px))] items-center justify-between">
          <div role="radiogroup" aria-label="Works layout" className="relative flex rounded-full border border-line/70 bg-surface p-1">
            {(["track", "grid"] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={view === option}
                onClick={() => choose(option)}
                className={clsx("relative isolate cursor-pointer rounded-full border-0 bg-transparent px-4 py-2 text-small font-medium transition-colors", view === option ? "text-on-inverse" : "text-fg-soft hover:text-fg")}
              >
                {view === option && <m.span layoutId="works-view-pill" className="absolute inset-0 -z-[1] rounded-full bg-inverse" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                {option === "track" ? "Spatial track" : "Editorial grid"}
              </button>
            ))}
          </div>
          {view === "track" && <span className="text-credit text-muted">Scroll or use ← → to travel</span>}
        </div>
      )}

      {view === "track" ? (
        <SpatialTrack projects={projects} />
      ) : (
        <div className="mx-auto w-[min(1120px,calc(100%-80px))] max-md:w-[calc(100%-40px)]">
          <VelocitySkew className="grid grid-cols-2 gap-3 pb-20 max-xl:grid-cols-1 max-md:pb-0">
            {projects.map((project, index) => (
              <ClipReveal key={project.slug} delay={(index % 2) * 0.08}>
                <ProjectCard project={project} variant="gallery" />
              </ClipReveal>
            ))}
          </VelocitySkew>
        </div>
      )}
    </>
  );
}
