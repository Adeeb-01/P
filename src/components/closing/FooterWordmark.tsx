"use client";

import { useRef, useState } from "react";
import { m, useScroll, useTransform, type Variants } from "motion/react";
import clsx from "clsx";
import { useClosingStage } from "@/components/closing/ClosingStage";
import { usePrefersReducedMotion } from "@/components/motion/hooks";
import { ProximityChar, ProximityProvider, useProximityField } from "@/components/motion/ProximityText";

const NAME = "Adeeb Alsaleh";
const EASE = [0.22, 1, 0.36, 1] as const;

/** Letters with a stable index for the proximity field (spaces are not part of the field). */
const LETTERS = (() => {
  let index = 0;
  return Array.from(NAME).map((char) => (char === " " ? { char, index: -1 } : { char, index: index++ }));
})();

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } },
};
const letter: Variants = {
  hidden: { y: "105%" },
  show: { y: "0%", transition: { duration: 1, ease: EASE } },
};

const GRADIENT = "bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.38)_58%,rgba(255,255,255,0.04)_100%)] bg-clip-text text-transparent";

/**
 * Oversized signature at the foot of the dark section. Letters rise from behind a mask when it
 * enters view, drift up subtly near the page end, and then respond to pointer proximity anywhere
 * in the closing section (lift / scale / tilt via springs — transforms only, no layout shift).
 */
export function FooterWordmark() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const stage = useClosingStage();
  const [revealed, setRevealed] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["18%", "0%"]);
  const fallbackRoot = useRef<HTMLElement | null>(null);
  const field = useProximityField(textRef, stage ?? fallbackRoot, { radius: 240, lift: 22, scale: 0.08, rotate: 4 });

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none mt-16 w-full select-none max-md:mt-12">
      <m.div style={{ y: reduced ? 0 : y }}>
        <ProximityProvider field={field}>
          <m.p
            ref={textRef}
            variants={container}
            initial={reduced ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, margin: "0px 0px -5% 0px" }}
            onAnimationComplete={() => setRevealed(true)}
            className={clsx(
              "relative m-0 flex justify-center pb-[0.06em] text-center text-[14.1vw] leading-[0.86] font-medium tracking-[-0.065em] whitespace-nowrap xl:text-[min(14.1vw,212px)]",
              revealed ? "overflow-visible" : "overflow-hidden",
            )}
          >
            {LETTERS.map(({ char, index }, position) =>
              char === " " ? (
                <span key={position} className="inline-block">
                  {" "}
                </span>
              ) : (
                <m.span key={position} variants={letter} className="inline-block will-change-transform">
                  <ProximityChar char={char} index={index} className={clsx("inline-block", GRADIENT)} />
                </m.span>
              ),
            )}
          </m.p>
        </ProximityProvider>
      </m.div>
    </div>
  );
}
