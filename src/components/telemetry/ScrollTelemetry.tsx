"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useLenis } from "@/components/motion/SmoothScroll";

type Section = { label: string; element: HTMLElement };

/**
 * Section telemetry (≥1200px): a compact column of dots on the right edge showing the active
 * section of pages that mark sections with `data-telemetry="02 Works"`. The active section is the
 * last one past the viewport centre, using cached section offsets (no layout reads while scrolling).
 *
 * Contrast: the whole indicator is pure white with `mix-blend-difference`, so it inverts against
 * whatever is underneath — black over light sections, white over dark ones — in both themes.
 */
export function ScrollTelemetry() {
  const pathname = usePathname();
  const lenis = useLenis();
  const [sections, setSections] = useState<Section[]>([]);
  const [active, setActive] = useState(0);

  // Discover the sections of the newly rendered route.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-telemetry]"));
      setSections(elements.map((element) => ({ label: element.dataset.telemetry ?? "", element })));
      setActive(0);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  // Active section = the last one whose top has passed the viewport centre. Section tops are cached
  // (measured on mount and whenever the document height changes), so scrolling reads no layout and
  // the indicator stays correct even after instant jumps that skip sections.
  useEffect(() => {
    if (sections.length < 2) return;
    let tops: number[] = [];
    const measure = () => {
      tops = sections.map((section) => section.element.getBoundingClientRect().top + window.scrollY);
      update();
    };
    const update = () => {
      const line = window.scrollY + window.innerHeight * 0.5;
      let index = 0;
      for (let i = 0; i < tops.length; i += 1) if (tops[i] <= line) index = i;
      setActive((current) => (current === index ? current : index));
    };
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
    };
  }, [sections]);

  if (sections.length < 2) return null;

  const jump = (element: HTMLElement) => {
    if (lenis) lenis.scrollTo(element, { offset: -80, duration: 1.2 });
    else element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav aria-label="Page sections" className="fixed top-1/2 right-4 z-[45] flex -translate-y-1/2 flex-col items-end gap-3.5 text-white mix-blend-difference max-xl:hidden">
      {sections.map((section, index) => {
        const current = index === active;
        const [number, ...rest] = section.label.split(" ");
        return (
          <button
            key={section.label}
            type="button"
            onClick={() => jump(section.element)}
            aria-label={`Jump to ${rest.join(" ")}`}
            aria-current={current ? "location" : undefined}
            className="group/tel relative flex h-4 w-4 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
          >
            <span
              className={clsx(
                "pointer-events-none absolute right-6 flex items-center gap-1.5 text-[10px] leading-none font-medium tracking-[0.14em] whitespace-nowrap uppercase transition-[opacity,translate] duration-300 ease-luzia",
                current ? "translate-x-0 opacity-100" : "translate-x-1 opacity-0 group-hover/tel:translate-x-0 group-hover/tel:opacity-75 group-focus-visible/tel:opacity-75",
              )}
            >
              <span className="tabular-nums opacity-60">{number}</span>
              {rest.join(" ")}
            </span>
            <span
              aria-hidden="true"
              className={clsx(
                "block h-1.5 w-1.5 rounded-full transition-[scale,background-color] duration-300 ease-luzia",
                current ? "scale-y-[3.2] bg-white" : "bg-white/45 group-hover/tel:bg-white/80",
              )}
            />
          </button>
        );
      })}
    </nav>
  );
}
