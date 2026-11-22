"use client";

import { useRef } from "react";
import { m, useScroll, useTransform, type Variants } from "motion/react";

const NAME = "Michael Carter";
const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } },
};
const letter: Variants = {
  hidden: { y: "105%" },
  show: { y: "0%", transition: { duration: 1, ease: EASE } },
};

/**
 * Oversized signature set edge-to-edge at the foot of the dark section. Letters rise from behind a
 * mask when it enters view; the whole mark then drifts up subtly as the page reaches the end.
 */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["18%", "0%"]);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none mt-16 w-full select-none max-md:mt-12">
      <m.div style={{ y }}>
        <m.p
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -5% 0px" }}
          className="m-0 flex justify-center overflow-hidden pb-[0.06em] text-center text-[14.1vw] leading-[0.86] font-medium tracking-[-0.065em] whitespace-nowrap xl:text-[min(14.1vw,212px)]"
        >
          {NAME.split("").map((char, index) => (
            <m.span
              key={index}
              variants={letter}
              className="inline-block bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.38)_58%,rgba(255,255,255,0.04)_100%)] bg-clip-text text-transparent will-change-transform"
            >
              {char === " " ? " " : char}
            </m.span>
          ))}
        </m.p>
      </m.div>
    </div>
  );
}
