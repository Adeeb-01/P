"use client";

import { useEffect, useState } from "react";
import { animate, m, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import clsx from "clsx";
import { RefractiveCard } from "@/components/motion/RefractiveCard";

const reveal =
  "[transition:opacity_300ms_cubic-bezier(0.22,1,0.36,1),transform_300ms_cubic-bezier(0.22,1,0.36,1),visibility_0s_linear_300ms]";
const revealOn =
  "hover-fine:group-hover/spot:visible hover-fine:group-hover/spot:opacity-100 hover-fine:group-hover/spot:[transform:translateY(0)] hover-fine:group-hover/spot:[transition-delay:0s] hover-fine:group-focus-visible/spot:visible hover-fine:group-focus-visible/spot:opacity-100 hover-fine:group-focus-visible/spot:[transform:translateY(0)] hover-fine:group-focus-visible/spot:[transition-delay:0s]";

type Stat = { value: number; suffix: string; label: string; position: string; check: string; hidden: boolean };

const STATS: Stat[] = [
  {
    value: 100,
    suffix: "%",
    label: "spec-driven delivery",
    hidden: true,
    position: clsx(
      "top-[116px] invisible opacity-0 [transform:translateY(-10px)]",
      revealOn,
      "hover-fine:group-hover/spot:[transition-delay:35ms,35ms,0s] hover-fine:group-focus-visible/spot:[transition-delay:35ms,35ms,0s]",
    ),
    check: "bg-yellow text-ink",
  },
  { value: 15, suffix: "+", label: "core technologies", hidden: true, position: clsx("top-[58px] invisible opacity-0 [transform:translateY(-8px)]", revealOn), check: "bg-green text-white" },
  { value: 10, suffix: "+", label: "full-stack & AI projects", hidden: false, position: "top-0", check: "bg-purple text-white" },
];

const CORE_STACK = [
  { short: "Nx", name: "Next.js", tone: "bg-ink text-white" },
  { short: "Re", name: "React", tone: "bg-[rgb(97,218,251)] text-ink" },
  { short: "No", name: "Node.js", tone: "bg-[rgb(51,153,51)] text-white" },
  { short: "Py", name: "Python", tone: "bg-[rgb(255,212,59)] text-ink" },
];

/** Counts from 0 to `value` each time `run` increments (0 = show final value, no animation yet). */
function Counter({ value, suffix, run }: { value: number; suffix: string; run: number }) {
  const reduced = useReducedMotion();
  const count = useMotionValue(value);
  const display = useTransform(count, (latest) => `${Math.round(latest)}${suffix}`);

  useEffect(() => {
    if (run === 0 || reduced) return;
    count.set(0);
    const controls = animate(count, value, { duration: 1.1, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [run, value, count, reduced]);

  return <m.span className="text-[20px] font-semibold tabular-nums">{display}</m.span>;
}

export function StatsCard() {
  // Visible counter plays once on entering the viewport; the hidden stack replays on every reveal.
  const [runs, setRuns] = useState({ visible: 0, hidden: 0 });
  const replayHidden = () => setRuns((current) => ({ ...current, hidden: current.hidden + 1 }));

  return (
    <RefractiveCard
      as="aside"
      tabIndex={0}
      aria-label="Engineering statistics"
      onPointerEnter={replayHidden}
      onFocus={replayHidden}
      className="relative h-[450px] min-w-0 overflow-hidden rounded-5xl bg-surface max-md:w-full"
    >
      <m.div
        className="absolute top-16 right-6 left-6 h-[166px]"
        viewport={{ once: true, margin: "0px 0px -15% 0px" }}
        onViewportEnter={() => setRuns((current) => ({ ...current, visible: current.visible + 1 }))}
      >
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className={clsx(
              "absolute inset-x-0 flex min-h-[52px] items-center justify-between gap-3 rounded-2xl bg-elevated py-3 pr-3.5 pl-4 text-fg-soft shadow-stat",
              reveal,
              stat.position,
            )}
          >
            <p className="m-0 text-btn">
              <Counter value={stat.value} suffix={stat.suffix} run={stat.hidden ? runs.hidden : runs.visible} /> {stat.label}
            </p>
            <span aria-hidden="true" className={clsx("grid h-[18px] w-[18px] flex-none place-items-center rounded-full", stat.check)}>
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
                <path d="m3 6.2 2 2L9 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        ))}
      </m.div>

      <div
        className={clsx(
          "pointer-events-none invisible absolute top-[18px] right-[18px] left-auto flex h-[38px] w-max flex-row-reverse items-center gap-[9px] rounded-[999px] bg-green py-1 pr-3 pl-[5px] opacity-0 shadow-trusted [transform:translateY(6px)]",
          reveal,
          revealOn,
        )}
      >
        <p className="m-0 text-[13px] leading-[18px] font-semibold tracking-[-0.48px] text-ink">Core stack</p>
        <div className="flex items-center">
          <div className="flex flex-row-reverse items-center pl-3" role="list" aria-label="Core stack">
              {[...CORE_STACK].reverse().map((tech) => (
                <span
                  key={tech.short}
                  role="listitem"
                  title={tech.name}
                  aria-label={tech.name}
                  className={clsx("-ml-3 grid h-[26px] w-[26px] flex-[0_0_26px] place-items-center rounded-full border-2 border-green text-[9px] font-semibold", tech.tone)}
                >
                  {tech.short}
                </span>
              ))}
            </div>
        </div>
      </div>
    </RefractiveCard>
  );
}
