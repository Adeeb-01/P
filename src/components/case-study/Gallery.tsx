"use client";

/* eslint-disable @next/next/no-img-element -- CSS-cropped close-ups of the cover image */
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { animate, m, useMotionTemplate, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "motion/react";
import clsx from "clsx";
import type { GalleryCrop, ProjectImage } from "@/lib/projects";

const LOUPE = 184;
const ZOOM = 2.5;
const GAP = 16;

function cropStyle(crop: GalleryCrop): CSSProperties {
  return { objectPosition: crop.focus, transform: `scale(${crop.zoom})`, transformOrigin: crop.focus };
}

/**
 * Case-study gallery: drag carousel + optional 2.5× optical loupe ("Inspect", key I), arrow-key
 * navigation and an accessible progress scrubber. Slides are CSS crops of the cover image until
 * real gallery images are added. Element sizes are measured on enter/resize, never per pointer move.
 */
export function Gallery({
  image,
  crops,
  title,
  controlsClassName,
}: {
  image: ProjectImage;
  crops: GalleryCrop[];
  title: string;
  /** Extra classes for the controls row (e.g. right padding when the carousel bleeds to the edge). */
  controlsClassName?: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const reduced = useReducedMotion();
  const [inspect, setInspect] = useState(false);
  const [metrics, setMetrics] = useState({ min: 0, viewport: 1, track: 1, slide: 400, scrub: 1 });
  const [progress, setProgress] = useState(0);

  // ── Measurement (mount + resize only) ──
  useEffect(() => {
    const measure = () => {
      const viewport = viewportRef.current?.clientWidth ?? 1;
      const track = trackRef.current?.scrollWidth ?? 1;
      const slide = (trackRef.current?.firstElementChild as HTMLElement | null)?.offsetWidth ?? 400;
      const scrub = scrubRef.current?.clientWidth ?? 1;
      setMetrics({ min: Math.min(0, viewport - track), viewport, track, slide, scrub });
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (viewportRef.current) observer.observe(viewportRef.current);
    if (scrubRef.current) observer.observe(scrubRef.current);
    return () => observer.disconnect();
  }, []);

  useMotionValueEvent(x, "change", (value) => {
    const next = metrics.min ? Math.round((value / metrics.min) * 100) : 0;
    setProgress((current) => (current === next ? current : Math.max(0, Math.min(100, next))));
  });

  const thumbWidth = Math.max(12, Math.min(100, (metrics.viewport / metrics.track) * 100));
  const thumbX = useTransform(x, (value) => {
    const ratio = metrics.min ? value / metrics.min : 0;
    return ratio * metrics.scrub * (1 - thumbWidth / 100);
  });

  const goTo = useCallback(
    (target: number) => {
      const clamped = Math.max(metrics.min, Math.min(0, target));
      animate(x, clamped, reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 32 });
    },
    [metrics.min, reduced, x],
  );
  const step = (direction: 1 | -1) => goTo(x.get() - direction * (metrics.slide + GAP));

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(metrics.min);
    } else if (event.key.toLowerCase() === "i" && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      setInspect((value) => !value);
    }
  };

  // ── Scrubber: pointer position on the track maps directly to carousel position ──
  const scrubRect = useRef<DOMRect | null>(null);
  const scrubTo = (clientX: number) => {
    const rect = scrubRect.current;
    if (!rect) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    x.set(ratio * metrics.min);
  };

  // ── Loupe ──
  const [lens, setLens] = useState<{ index: number; width: number; height: number } | null>(null);
  const frameRect = useRef<DOMRect | null>(null);
  const lx = useMotionValue(0);
  const ly = useMotionValue(0);
  const lensX = useTransform(lx, (value) => value - LOUPE / 2);
  const lensY = useTransform(ly, (value) => value - LOUPE / 2);
  const innerX = useTransform(lx, (value) => LOUPE / 2 - value);
  const innerY = useTransform(ly, (value) => LOUPE / 2 - value);
  const innerOrigin = useMotionTemplate`${lx}px ${ly}px`;

  useEffect(() => {
    if (!lens) return;
    const invalidate = () => {
      frameRect.current = null;
    };
    window.addEventListener("scroll", invalidate, { passive: true });
    return () => window.removeEventListener("scroll", invalidate);
  }, [lens]);

  const onFrameEnter = (index: number) => (event: PointerEvent<HTMLDivElement>) => {
    if (!inspect) return;
    frameRect.current = event.currentTarget.getBoundingClientRect();
    setLens({ index, width: frameRect.current.width, height: frameRect.current.height });
    lx.set(event.clientX - frameRect.current.left);
    ly.set(event.clientY - frameRect.current.top);
  };
  const onFrameMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!inspect) return;
    if (!frameRect.current) frameRect.current = event.currentTarget.getBoundingClientRect(); // re-measure only after a scroll
    lx.set(event.clientX - frameRect.current.left);
    ly.set(event.clientY - frameRect.current.top);
  };

  return (
    <div>
      <div
        ref={viewportRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${title} gallery. Use left and right arrow keys to move, I to toggle inspect mode.`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        data-cursor={inspect ? "none" : "drag"}
        className="overflow-hidden focus-visible:outline-offset-4"
      >
        <m.div
          ref={trackRef}
          drag={inspect ? false : "x"}
          dragConstraints={viewportRef}
          dragElastic={0.08}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 32, power: 0.25 }}
          style={{ x }}
          className={clsx("flex w-max gap-4", inspect ? "cursor-zoom-in" : "cursor-grab active:cursor-grabbing")}
        >
          {crops.map((crop, index) => (
            <figure key={crop.label} className="m-0 w-[min(560px,78vw)] flex-none select-none">
              <div
                onPointerEnter={onFrameEnter(index)}
                onPointerMove={onFrameMove}
                onPointerLeave={() => setLens(null)}
                className="relative aspect-[4/3] overflow-hidden rounded-[32px] bg-surface max-md:rounded-3xl"
              >
                <img
                  src={image.src}
                  alt={`${title} — ${crop.label}`}
                  draggable={false}
                  width={image.width}
                  height={image.height}
                  style={cropStyle(crop)}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute top-4 left-4 rounded-full bg-white/80 px-3 py-1.5 text-[12px] leading-none font-medium text-ink backdrop-blur-md">
                  {String(index + 1).padStart(2, "0")} / {String(crops.length).padStart(2, "0")}
                </span>

                {inspect && lens?.index === index && (
                  <m.div
                    aria-hidden="true"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 28 }}
                    style={{ x: lensX, y: lensY, width: LOUPE, height: LOUPE }}
                    className="pointer-events-none absolute top-0 left-0 z-10 overflow-hidden rounded-full border-2 border-white/90 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6),inset_0_0_0_1px_rgba(0,0,0,0.08)]"
                  >
                    <m.div
                      style={{ x: innerX, y: innerY, width: lens.width, height: lens.height, scale: ZOOM, transformOrigin: innerOrigin }}
                      className="absolute top-0 left-0 overflow-hidden"
                    >
                      <img src={image.src} alt="" draggable={false} style={cropStyle(crop)} className="absolute inset-0 h-full w-full object-cover" />
                    </m.div>
                    <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.35),transparent_45%)]" />
                  </m.div>
                )}
              </div>
              <figcaption className="mt-3 text-small text-muted">{crop.label}</figcaption>
            </figure>
          ))}
        </m.div>
      </div>

      <div className={clsx("mt-6 flex flex-wrap items-center gap-3", controlsClassName)}>
        {([-1, 1] as const).map((direction) => (
          <button
            key={direction}
            type="button"
            onClick={() => step(direction)}
            disabled={direction === -1 ? progress <= 0 : progress >= 100}
            aria-label={direction === -1 ? "Previous image" : "Next image"}
            className="grid h-12 w-12 cursor-pointer place-items-center rounded-full border border-line bg-elevated text-fg transition-[opacity,background-color] hover:bg-surface active:scale-95 disabled:cursor-default disabled:opacity-35"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" className={clsx("h-4 w-4", direction === -1 && "rotate-180")}>
              <path d="M4 10h11M11 5.5 15.5 10 11 14.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}

        <button
          type="button"
          onClick={() => setInspect((value) => !value)}
          aria-pressed={inspect}
          className={clsx(
            "inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border px-5 text-small font-medium transition-colors active:scale-[0.97]",
            inspect ? "border-violet bg-violet text-white" : "border-line bg-elevated text-fg hover:bg-surface",
          )}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
            <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="m12.8 12.8 4 4M8.5 6v5M6 8.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {inspect ? "Inspecting" : "Inspect"}
          <kbd className={clsx("rounded-md px-1.5 py-0.5 font-sans text-[11px] leading-none", inspect ? "bg-white/20" : "bg-surface text-muted")}>I</kbd>
        </button>

        {/* Progress scrubber */}
        <div
          ref={scrubRef}
          role="slider"
          tabIndex={0}
          aria-label="Gallery position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-valuetext={`${progress}%`}
          onKeyDown={onKeyDown}
          onPointerDown={(event) => {
            scrubRect.current = event.currentTarget.getBoundingClientRect();
            event.currentTarget.setPointerCapture(event.pointerId);
            scrubTo(event.clientX);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) scrubTo(event.clientX);
          }}
          className="relative ml-2 h-12 min-w-[140px] flex-1 cursor-pointer touch-none focus-visible:outline-offset-2 max-md:basis-full max-md:ml-0"
        >
          <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-fg/10" />
          <m.span style={{ x: thumbX, width: `${thumbWidth}%` }} className="absolute top-1/2 left-0 h-[3px] -translate-y-1/2 rounded-full bg-fg" />
        </div>
        <span className="text-credit text-muted tabular-nums max-md:hidden">{String(progress).padStart(3, " ")}%</span>
      </div>
    </div>
  );
}
