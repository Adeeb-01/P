"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { usePrefersReducedMotion } from "@/components/motion/hooks";
import clsx from "clsx";

/** Cycles 0…count-1 every `ms` (paused for reduced motion). */
function useCycle(count: number, ms: number) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setIndex((value) => (value + 1) % count), ms);
    return () => window.clearInterval(id);
  }, [count, ms, reduced]);
  return reduced ? count - 1 : index;
}

const frame = "relative h-[260px] overflow-hidden rounded-[20px] max-md:h-[220px]";

/* ── Branding: palette + type specimen ─────────────────────────────────── */

const PALETTE = [
  { hex: "#7430F7", name: "Violet" },
  { hex: "#111111", name: "Ink" },
  { hex: "#F5F2FF", name: "Mist" },
  { hex: "#EFCE03", name: "Sun" },
  { hex: "#00C047", name: "Leaf" },
];
const WEIGHTS = [
  { weight: "font-normal", label: "Regular 400" },
  { weight: "font-medium", label: "Medium 500" },
  { weight: "font-bold", label: "Bold 700" },
];

export function BrandingDiagram() {
  const active = useCycle(WEIGHTS.length, 1500);
  return (
    <div className={clsx(frame, "grid grid-cols-[1.1fr_1fr] gap-3 bg-elevated p-4 max-md:grid-cols-1")}>
      <div className="flex gap-2 max-md:h-[90px]">
        {PALETTE.map((swatch, index) => (
          <m.div
            key={swatch.hex}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.25 + index * 0.07 }}
            className="flex flex-1 flex-col justify-end rounded-2xl border border-ink/[0.06] p-2"
            style={{ background: swatch.hex }}
          >
            <span className={clsx("text-[10px] leading-tight font-medium", index === 1 || index === 0 ? "text-white/80" : "text-ink/60")}>
              {swatch.name}
              <br />
              {swatch.hex}
            </span>
          </m.div>
        ))}
      </div>
      <div className="relative flex flex-col justify-between rounded-2xl bg-surface p-4 max-md:hidden">
        <span className="text-[11px] tracking-[0.08em] text-muted uppercase">Instrument Sans</span>
        <div className="relative h-[120px]">
          <AnimatePresence mode="popLayout" initial={false}>
            <m.span
              key={active}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className={clsx("absolute bottom-0 left-0 text-[112px] leading-[0.9] tracking-[-0.05em] text-fg", WEIGHTS[active].weight)}
            >
              Aa
            </m.span>
          </AnimatePresence>
        </div>
        <span className="text-[12px] text-fg-soft">{WEIGHTS[active].label}</span>
      </div>
    </div>
  );
}

/* ── Framer: breakpoint resizer ────────────────────────────────────────── */

const BREAKPOINTS = [
  { label: "Desktop · 1440", inset: 0, cols: 3 },
  { label: "Tablet · 810", inset: 20, cols: 2 },
  { label: "Mobile · 390", inset: 34, cols: 1 },
];

export function FramerDiagram() {
  const active = useCycle(BREAKPOINTS.length, 1900);
  const bp = BREAKPOINTS[active];
  return (
    <div className={clsx(frame, "bg-[rgb(30,14,72)] p-4")}>
      <div className="mb-3 flex items-center justify-between text-[12px] text-white/70">
        <span className="flex gap-1.5">
          {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
            <span key={color} className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          ))}
        </span>
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span key={bp.label} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} className="tabular-nums">
            {bp.label}
          </m.span>
        </AnimatePresence>
      </div>
      <m.div
        animate={{ clipPath: `inset(0% ${bp.inset}% 0% ${bp.inset}% round 14px)` }}
        transition={{ type: "spring", stiffness: 160, damping: 24 }}
        className="relative h-[calc(100%-30px)] bg-white"
      >
        {BREAKPOINTS.map((layout, index) => (
          <m.div
            key={layout.label}
            animate={{ opacity: index === active ? 1 : 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-y-0 flex flex-col gap-2 p-3"
            style={{ left: `${layout.inset}%`, right: `${layout.inset}%` }}
          >
            <div className="flex items-center justify-between">
              <span className="h-2 w-10 rounded-full bg-ink" />
              {layout.cols > 1 ? (
                <span className="flex gap-1.5">
                  {[0, 1, 2].map((item) => (
                    <span key={item} className="h-1.5 w-6 rounded-full bg-ink/25" />
                  ))}
                </span>
              ) : (
                <span className="h-2 w-3 rounded-sm bg-ink/40" />
              )}
            </div>
            <div className="h-10 rounded-lg bg-[linear-gradient(120deg,#7430F7,#B79CFF)]" />
            <div className="grid flex-1 gap-1.5" style={{ gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))` }}>
              {Array.from({ length: layout.cols * 2 }).map((_, item) => (
                <span key={item} className="rounded-md bg-ink/[0.07]" />
              ))}
            </div>
          </m.div>
        ))}
      </m.div>
    </div>
  );
}

/* ── UI/UX: wireframe → UI wipe ────────────────────────────────────────── */

function Screen({ ui }: { ui: boolean }) {
  return (
    <div className={clsx("absolute inset-0 grid grid-cols-[72px_1fr] gap-3 p-4", ui ? "bg-white" : "bg-light")}>
      <div className={clsx("flex flex-col gap-2 rounded-xl p-2", ui ? "bg-ink" : "border border-dashed border-ink/25")}>
        {[0, 1, 2, 3].map((item) => (
          <span key={item} className={clsx("h-2 rounded-full", ui ? (item === 0 ? "bg-violet" : "bg-white/30") : "bg-ink/15")} />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <div className={clsx("h-12 rounded-xl", ui ? "bg-[linear-gradient(120deg,#7430F7,#B79CFF)]" : "border border-dashed border-ink/25")} />
        <div className="grid flex-1 grid-cols-3 gap-2">
          {[0, 1, 2].map((item) => (
            <div key={item} className={clsx("flex flex-col justify-end gap-1.5 rounded-xl p-2", ui ? "bg-light" : "border border-dashed border-ink/25")}>
              <span className={clsx("h-6 w-6 rounded-full", ui ? ["bg-green", "bg-yellow", "bg-violet"][item] : "bg-ink/10")} />
              <span className={clsx("h-1.5 rounded-full", ui ? "bg-ink/70" : "bg-ink/15")} />
              <span className={clsx("h-1.5 w-2/3 rounded-full", ui ? "bg-ink/25" : "bg-ink/10")} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UiUxDiagram() {
  const reduced = usePrefersReducedMotion();
  const loop = reduced
    ? { clipPath: "inset(0% 0% 0% 0%)" }
    : { clipPath: ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)", "inset(0% 100% 0% 0%)"] };
  return (
    <div className={clsx(frame, "border border-ink/[0.06]")}>
      <Screen ui={false} />
      <m.div
        className="absolute inset-0"
        initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
        animate={loop}
        transition={reduced ? { duration: 0 } : { duration: 4.2, times: [0, 0.35, 0.8, 1], ease: "easeInOut", repeat: Infinity, delay: 0.3 }}
      >
        <Screen ui />
      </m.div>
      <span className="absolute bottom-3 left-3 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-ink backdrop-blur">Wireframe → UI</span>
    </div>
  );
}

export function ServiceDiagram({ serviceKey }: { serviceKey: string }) {
  if (serviceKey === "branding") return <BrandingDiagram />;
  if (serviceKey === "framer-development") return <FramerDiagram />;
  return <UiUxDiagram />;
}
