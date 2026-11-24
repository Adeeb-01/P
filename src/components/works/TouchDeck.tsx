"use client";

import { useEffect, useRef, useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { usePrefersReducedMotion } from "@/components/motion/hooks";
import type { Project } from "@/lib/projects";

/** Native scrolling owns gestures; transforms only decorate each untransformed snap slot. */
export function TouchDeck({ projects }: { projects: Project[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const gesture = useRef({ x: 0, y: 0, moved: false, until: 0 });
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const track = ref.current;
    if (!track) return;
    const slots = Array.from(track.children) as HTMLElement[];
    let centers: number[] = [];
    let frame = 0;
    const paint = () => {
      frame = 0;
      const center = track.scrollLeft + track.clientWidth / 2;
      let nearest = 0;
      slots.forEach((slot, i) => {
        if (Math.abs(centers[i] - center) < Math.abs(centers[nearest] - center)) nearest = i;
        const rel = Math.max(-1.5, Math.min(1.5, (centers[i] - center) / slot.offsetWidth));
        const card = slot.firstElementChild as HTMLElement;
        card.style.transform = reduced ? "none" : `perspective(1100px) translateZ(${-Math.abs(rel) * 70}px) rotateY(${-rel * 12}deg) scale(${1 - Math.abs(rel) * 0.06})`;
        card.style.opacity = String(reduced ? 1 : 1 - Math.min(Math.abs(rel), 1) * 0.18);
      });
      setActive((previous) => previous === nearest ? previous : nearest);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const measure = () => {
      centers = slots.map((slot) => slot.offsetLeft + slot.offsetWidth / 2);
      schedule();
    };
    const resize = new ResizeObserver(measure);
    resize.observe(track);
    slots.forEach((slot) => resize.observe(slot));
    track.addEventListener("scroll", schedule, { passive: true });
    measure();
    return () => { resize.disconnect(); track.removeEventListener("scroll", schedule); cancelAnimationFrame(frame); };
  }, [projects, reduced]);

  const go = (index: number) => {
    const track = ref.current;
    const slot = track?.children[Math.max(0, Math.min(projects.length - 1, index))] as HTMLElement | undefined;
    if (track && slot) track.scrollTo({ left: slot.offsetLeft + slot.offsetWidth / 2 - track.clientWidth / 2, behavior: reduced ? "instant" : "smooth" });
  };

  return (
    <section aria-label="Projects" aria-roledescription="carousel" data-touch-deck>
      <div ref={ref} className="touch-deck" data-lenis-prevent-wheel
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
          if (e.key === "Home") { e.preventDefault(); go(0); }
          if (e.key === "End") { e.preventDefault(); go(projects.length - 1); }
        }}
        onPointerDown={(e) => { e.currentTarget.dataset.swipeBlocked = "false"; gesture.current = { x: e.clientX, y: e.clientY, moved: false, until: 0 }; }}
        onPointerMove={(e) => {
          if (Math.hypot(e.clientX - gesture.current.x, e.clientY - gesture.current.y) > 10) { gesture.current.moved = true; e.currentTarget.dataset.swipeBlocked = "true"; }
        }}
        onPointerCancel={(e) => { e.currentTarget.dataset.swipeBlocked = "true"; gesture.current.moved = true; gesture.current.until = performance.now() + 450; }}
        onPointerUp={() => { if (gesture.current.moved) gesture.current.until = performance.now() + 450; }}
        onClickCapture={(e) => {
          if (e.detail > 0 && (gesture.current.moved || performance.now() < gesture.current.until)) { e.preventDefault(); e.stopPropagation(); }
        }}>
        {projects.map((project, index) => (
          <div key={project.slug} className="touch-deck-slot" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${projects.length}: ${project.title}`}>
            <div className="touch-deck-card"><ProjectCard project={project} variant="gallery" /></div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-4 flex w-[calc(100%-40px)] max-w-[1120px] items-center gap-3">
        <p aria-live="polite" aria-atomic="true" className="m-0 min-w-0 flex-1 text-small text-muted tabular-nums">
          <span data-deck-counter className="text-fg">{String(active + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
          <span className="ml-3">{projects[active]?.title}</span>
        </p>
        <button type="button" aria-label="Previous project" disabled={active === 0} onClick={() => go(active - 1)} className="deck-arrow">←</button>
        <button type="button" aria-label="Next project" disabled={active === projects.length - 1} onClick={() => go(active + 1)} className="deck-arrow">→</button>
      </div>
    </section>
  );
}
