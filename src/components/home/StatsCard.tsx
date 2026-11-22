"use client";

/* eslint-disable @next/next/no-img-element -- 26px client marks mirror the original markup */
import { useEffect, useState } from "react";
import { animate, m, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import clsx from "clsx";
import { SpotlightCard } from "@/components/motion/SpotlightCard";

const IMG = "/assets/images/framerusercontent.com";

const reveal =
  "[transition:opacity_300ms_cubic-bezier(0.22,1,0.36,1),transform_300ms_cubic-bezier(0.22,1,0.36,1),visibility_0s_linear_300ms]";
const revealOn =
  "hover-fine:group-hover/spot:visible hover-fine:group-hover/spot:opacity-100 hover-fine:group-hover/spot:[transform:translateY(0)] hover-fine:group-hover/spot:[transition-delay:0s] hover-fine:group-focus-visible/spot:visible hover-fine:group-focus-visible/spot:opacity-100 hover-fine:group-focus-visible/spot:[transform:translateY(0)] hover-fine:group-focus-visible/spot:[transition-delay:0s]";

type Stat = { value: number; label: string; position: string; check: string; hidden: boolean };

const STATS: Stat[] = [
  {
    value: 10,
    label: "happy clients",
    hidden: true,
    position: clsx(
      "top-[116px] invisible opacity-0 [transform:translateY(-10px)]",
      revealOn,
      "hover-fine:group-hover/spot:[transition-delay:35ms,35ms,0s] hover-fine:group-focus-visible/spot:[transition-delay:35ms,35ms,0s]",
    ),
    check: "bg-yellow text-ink",
  },
  { value: 5, label: "years of experiences", hidden: true, position: clsx("top-[58px] invisible opacity-0 [transform:translateY(-8px)]", revealOn), check: "bg-green text-white" },
  { value: 20, label: "projects completed", hidden: false, position: "top-0", check: "bg-purple text-white" },
];

const LOGOS = [
  { src: `${IMG}/gBnkhJ17BmtTHqpLjPkAeWdN8U-502d59d6b6.png`, width: 771, height: 1024 },
  { src: `${IMG}/zfmF1iFYDX2iAwx2tDdmHAHKsKY-476e700fc9.png`, width: 512, height: 512 },
  { src: `${IMG}/7IFOWsHVY0RJFR1n6Chu0jDP1jA-21a60d831a.png`, width: 512, height: 512 },
  { src: `${IMG}/nSJFnEeB2r1YM5Orpw7rRVinGQ-a8d64e4293.png`, width: 512, height: 512 },
];

/** Counts from 0 to `value` each time `run` increments (0 = show final value, no animation yet). */
function Counter({ value, run }: { value: number; run: number }) {
  const reduced = useReducedMotion();
  const count = useMotionValue(value);
  const display = useTransform(count, (latest) => `${Math.round(latest)}+`);

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
    <SpotlightCard
      as="aside"
      tabIndex={0}
      aria-label="Client and project statistics"
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
              <Counter value={stat.value} run={stat.hidden ? runs.hidden : runs.visible} /> {stat.label}
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
        <p className="m-0 text-[13px] leading-[18px] font-semibold tracking-[-0.48px] text-ink">Trusted by many</p>
        <div className="flex items-center">
          <div className="flex w-[68px] flex-row-reverse items-center" aria-label="Trusted client marks">
            {LOGOS.map((logo) => (
              <img
                key={logo.src}
                src={logo.src}
                width={logo.width}
                height={logo.height}
                alt=""
                className="-ml-3 block h-[26px] w-[26px] flex-[0_0_26px] rounded-full border-2 border-green object-cover object-center"
              />
            ))}
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}
