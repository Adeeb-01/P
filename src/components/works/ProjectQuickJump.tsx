"use client";

/* eslint-disable @next/next/no-img-element -- small thumbnails */
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, m } from "motion/react";
import clsx from "clsx";
import { PROJECTS, projectHref } from "@/lib/projects";
import { quickJump } from "@/lib/quickjump-store";
import { sound } from "@/lib/sound";
import { useLenis } from "@/components/motion/SmoothScroll";
import { Portal } from "@/components/Portal";
import { ScrambleText } from "@/components/motion/ScrambleText";

const noopSubscribe = () => () => {};
const useIsMac = () => useSyncExternalStore(noopSubscribe, () => /Mac|iPhone|iPad/.test(navigator.platform), () => true);
const useQuickJumpOpen = () => useSyncExternalStore(quickJump.subscribe, quickJump.isOpen, () => false);

let lastTrigger: HTMLElement | null = null;

/** Opens the global palette, remembering the trigger so focus can return to it. */
export function openQuickJump(trigger?: HTMLElement | null) {
  lastTrigger = trigger ?? (document.activeElement as HTMLElement | null);
  quickJump.set(true);
}

/** Visible trigger for mouse / touch users. */
export function QuickJumpTrigger({ className }: { className?: string }) {
  const isMac = useIsMac();
  return (
    <button
      type="button"
      onClick={(event) => openQuickJump(event.currentTarget)}
      aria-haspopup="dialog"
      className={clsx(
        "group/btn relative isolate inline-flex h-11 cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border border-line/70 bg-canvas/80 pr-2 pl-4 text-small font-medium text-fg-soft shadow-[0_8px_24px_-18px_rgba(17,17,17,0.35)] backdrop-blur-md transition-colors hover:border-fg/20 hover:text-fg active:scale-[0.97]",
        className,
      )}
    >
      <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 text-muted">
        <circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="m13.2 13.2 3.3 3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <ScrambleText text="Quick jump" />
      <kbd className="rounded-lg border border-line bg-surface px-2 py-1 font-sans text-[12px] leading-none text-muted">{isMac ? "⌘K" : "Ctrl K"}</kbd>
    </button>
  );
}

/** Global ⌘K / Ctrl+K palette for case studies. Mounted once in the root layout. */
export function QuickJumpPalette() {
  const open = useQuickJumpOpen();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocusAfterExit = useRef(false);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const lenis = useLenis();
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PROJECTS;
    return PROJECTS.filter((project) => [project.title, project.tagline, ...project.tags].join(" ").toLowerCase().includes(q));
  }, [query]);

  // Reset the search each time the palette opens (derived during render, not in an effect).
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setQuery("");
      setActive(0);
    }
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (!quickJump.isOpen()) lastTrigger = document.activeElement as HTMLElement | null;
        quickJump.toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    sound.whoosh();
    lenis?.stop();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = overflow;
      lenis?.start();
    };
  }, [open, lenis]);

  const close = (restoreFocus = true) => {
    restoreFocusAfterExit.current = restoreFocus;
    quickJump.set(false);
  };

  const onInputKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (results.length ? (index + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (results.length ? (index - 1 + results.length) % results.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      linkRefs.current[active]?.click();
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  return (
    <Portal>
      <AnimatePresence onExitComplete={() => {
        // The floating trigger becomes interactive again after the modal leaves the DOM.
        if (restoreFocusAfterExit.current) requestAnimationFrame(() => requestAnimationFrame(() => lastTrigger?.focus?.()));
      }}>
        {open && (
          <m.div
            key="palette"
            className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[min(14vh,100px)] max-md:pt-[max(16px,env(safe-area-inset-top))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.16 } }}
          >
            <button type="button" aria-label="Close quick jump" tabIndex={-1} data-sound="off" onClick={() => close()} className="absolute inset-0 cursor-default bg-ink/30 backdrop-blur-[6px] dark:bg-black/50" />
            <m.div
              role="dialog"
              aria-modal="true"
              aria-label="Jump to a case study"
              onKeyDown={(event) => {
                if (event.key === "Escape") { event.preventDefault(); close(); }
                if (event.key === "Tab") {
                  const targets = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('input,button,[tabindex="0"]'));
                  const index = targets.indexOf(document.activeElement as HTMLElement);
                  event.preventDefault();
                  targets[(index + (event.shiftKey ? -1 : 1) + targets.length) % targets.length]?.focus();
                }
              }}
              data-lenis-prevent
              initial={{ y: 18, scale: 0.97, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 10, scale: 0.98, opacity: 0, transition: { duration: 0.14 } }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="relative w-full max-w-[560px] overflow-hidden rounded-3xl border border-white/60 bg-elevated/90 shadow-[0_40px_80px_-30px_rgba(17,17,17,0.5)] backdrop-blur-xl dark:border-white/10"
            >
              <div className="flex items-center gap-3 border-b border-fg/[0.06] px-5">
                <svg viewBox="0 0 20 20" aria-hidden="true" className="h-[18px] w-[18px] flex-none text-muted">
                  <circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  <path d="m13.2 13.2 3.3 3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <input
                  ref={inputRef}
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={listId}
                  aria-activedescendant={results[active] ? `${listId}-${results[active].slug}` : undefined}
                  aria-label="Search case studies"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onInputKey}
                  placeholder="Search projects, stack, topics…"
                  className="h-16 min-w-0 w-full border-0 bg-transparent text-[16px] tracking-[-0.36px] text-fg outline-none placeholder:text-muted"
                />
                <button type="button" aria-label="Close search" onClick={() => close()} className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-line bg-surface text-muted">×</button>
              </div>

              <ul id={listId} role="listbox" aria-label="Case studies" className="m-0 max-h-[min(50dvh,400px)] list-none overflow-y-auto p-2">
                {results.length === 0 && <li className="px-4 py-8 text-center text-body text-muted">No projects match “{query}”.</li>}
                {results.map((project, index) => (
                  <li key={project.slug} id={`${listId}-${project.slug}`} role="option" aria-selected={index === active}>
                    <Link
                      ref={(element) => {
                        linkRefs.current[index] = element;
                      }}
                      href={projectHref(project.slug)}
                      tabIndex={-1}
                      onPointerMove={() => setActive(index)}
                      onClick={() => close(false)}
                      className="relative isolate flex items-center gap-4 rounded-2xl p-2.5 pr-4"
                    >
                      {index === active && (
                        <m.span layoutId="quickjump-active" className="absolute inset-0 -z-[1] rounded-2xl bg-surface" transition={{ type: "spring", stiffness: 500, damping: 38 }} />
                      )}
                      <img src={project.image.src} alt="" width={64} height={48} className="h-12 w-16 flex-none rounded-xl object-cover" />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-[17px] leading-[1.3] font-medium tracking-[-0.4px] text-fg">{project.title}</span>
                        <span className="truncate text-[13px] text-muted">
                          {project.tagline} — {project.tags.join(" · ")}
                        </span>
                      </span>
                      <span aria-hidden="true" className={clsx("text-violet transition-opacity", index === active ? "opacity-100" : "opacity-0")}>
                        ↵
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
