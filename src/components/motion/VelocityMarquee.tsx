"use client";

import { useRef } from "react";
import {
  m,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "motion/react";
import clsx from "clsx";

const SKILLS_A = ["Branding Design", "Framer Development", "UI/UX Design", "Design Systems", "Prototyping", "Motion"];
const SKILLS_B = ["Logo Design", "Landing Pages", "Web Migration", "Brand Strategy", "Multipage Sites", "Web & App Design"];

function Ribbon({ items, baseVelocity, outline }: { items: string[]; baseVelocity: number; outline?: boolean }) {
  const reduced = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });
  const direction = useRef(1);
  // Content is rendered 4×; wrapping between -25% and -50% makes the loop seamless.
  const x = useTransform(baseX, (value) => `${wrap(-25, -50, value)}%`);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    let moveBy = direction.current * baseVelocity * (delta / 1000);
    const factor = velocityFactor.get();
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;
    moveBy += moveBy * Math.abs(factor);
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <m.div style={{ x }} className="flex flex-none will-change-transform">
        {[0, 1, 2, 3].map((copy) => (
          <span key={copy} className="flex flex-none items-center" aria-hidden={copy > 0 ? true : undefined}>
            {items.map((item) => (
              <span key={item} className="flex items-center">
                <span
                  className={clsx(
                    "px-6 text-[72px] leading-[1.05] font-medium tracking-[-0.04em] max-xl:text-[56px] max-md:px-4 max-md:text-[40px]",
                    outline ? "text-transparent [-webkit-text-stroke:1.2px_var(--theme-fg)]" : "text-fg",
                  )}
                >
                  {item}
                </span>
                <span aria-hidden="true" className="text-[28px] text-violet max-md:text-[20px]">
                  ✦
                </span>
              </span>
            ))}
          </span>
        ))}
      </m.div>
    </div>
  );
}

/** Two opposing ribbons of disciplines that accelerate and flip direction with scroll velocity. */
export function VelocityMarquee() {
  return (
    <section aria-label="Disciplines" className="relative w-full overflow-hidden bg-canvas pt-[120px] select-none max-md:pt-20">
      <div className="flex -rotate-2 flex-col gap-2 py-6">
        <Ribbon items={SKILLS_A} baseVelocity={-2.2} />
        <Ribbon items={SKILLS_B} baseVelocity={2.2} outline />
      </div>
    </section>
  );
}
