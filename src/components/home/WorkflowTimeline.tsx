"use client";

import { useRef } from "react";
import { m, useScroll, useSpring, useTransform } from "motion/react";

export type WorkflowStep = { key: string; title: string; description: string };

function StepCard({ step, index }: { step: WorkflowStep; index: number }) {
  const ref = useRef<HTMLElement>(null);
  // 0 → 1 as the card travels from the lower part of the viewport to just above centre.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "start 45%"] });
  const lit = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  const cardOpacity = useTransform(lit, [0, 1], [0.45, 1]);
  const cardY = useTransform(lit, [0, 1], [28, 0]);

  return (
    <m.article
      ref={ref}
      style={{ opacity: cardOpacity, y: cardY }}
      className={`relative col-start-1 min-h-[226px] min-w-0 rounded-3xl border border-graphite bg-ink p-6 shadow-none hover-fine:transition-[border-color] hover-fine:duration-300 hover-fine:ease-out hover-fine:hover:border-[rgb(42,42,42)] xl:min-h-[236px] xl:w-[488px] xl:flex-none xl:bg-[rgb(20,20,20)] xl:p-[30px] ${index % 2 === 0 ? "xl:ml-[40%]" : "xl:ml-[59%]"}`}
    >
      {/* Violet ring fades in as the step activates. */}
      <m.span
        aria-hidden="true"
        style={{ opacity: lit }}
        className="pointer-events-none absolute -inset-px rounded-[inherit] border border-violet/45 shadow-[0_0_40px_-12px_rgba(116,48,247,0.55)]"
      />
      <span aria-hidden="true" className="relative grid h-10 w-10 place-items-center">
        <span className="absolute inset-0 rounded-full bg-[linear-gradient(0deg,rgb(31,31,31)_0%,rgb(17,17,17)_100%)]" />
        <m.span style={{ opacity: lit }} className="absolute inset-0 rounded-full bg-violet shadow-[0_0_24px_-4px_rgba(116,48,247,0.8)]" />
        <span className="relative text-[16px] leading-none font-medium text-slate tabular-nums">
          <m.span style={{ opacity: lit }} className="absolute inset-0 grid place-items-center text-white">
            {index + 1}
          </m.span>
          {index + 1}
        </span>
      </span>
      <h3 className="m-0 mt-4 text-card font-medium text-white">{step.title}</h3>
      <p className="m-0 mt-1.5 max-w-[42ch] text-body font-normal text-slate xl:leading-[22px]">{step.description}</p>
    </m.article>
  );
}

/** Step cards with a scroll-linked progress rail that fills as the visitor moves through the process. */
export function WorkflowTimeline({ steps }: { steps: WorkflowStep[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 55%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 });

  return (
    <div ref={ref} className="relative grid grid-cols-1 items-stretch gap-4 pl-8 xl:flex xl:flex-col xl:gap-5 xl:pl-0">
      <div aria-hidden="true" className="pointer-events-none absolute top-2 bottom-2 left-[11px] w-px xl:left-[calc(40%-56px)]">
        <span className="absolute inset-0 rounded-full bg-white/10" />
        <m.span style={{ scaleY }} className="absolute inset-0 origin-top rounded-full bg-[linear-gradient(180deg,rgba(116,48,247,0.2),rgb(116,48,247)_40%,rgb(178,140,255))]" />
      </div>
      {steps.map((step, index) => (
        <StepCard key={step.key} step={step} index={index} />
      ))}
    </div>
  );
}
