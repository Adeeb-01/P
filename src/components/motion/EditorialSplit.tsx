"use client";

import { Fragment, useMemo, useRef } from "react";
import { m, useInView } from "motion/react";
import clsx from "clsx";
import { usePrefersReducedMotion } from "@/components/motion/hooks";

export type SplitSegment = { text: string; className?: string };

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Editorial split reveal: each word flips up from rotateX(-80deg) around its bottom edge with a
 * short stagger when the heading enters view. The full sentence is kept as screen-reader text;
 * the animated words are aria-hidden. Reduced motion renders the final state immediately.
 */
export function EditorialSplit({
  as: Tag = "h2",
  segments,
  className,
  id,
  delay = 0,
  stagger = 0.035,
}: {
  as?: "h1" | "h2" | "h3" | "p";
  segments: SplitSegment[];
  className?: string;
  id?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const reduced = usePrefersReducedMotion();
  const words = useMemo(
    () => segments.flatMap((segment) => segment.text.split(/\s+/).filter(Boolean).map((text) => ({ text, className: segment.className }))),
    [segments],
  );
  const label = segments.map((segment) => segment.text).join(" ");

  return (
    <Tag ref={ref} id={id} className={className}>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <Fragment key={index}>
            <span className="inline-block [perspective:900px]">
              <m.span
                className={clsx("inline-block origin-[50%_100%] will-change-transform", word.className)}
                initial={reduced ? false : { rotateX: -80, opacity: 0, y: "0.2em" }}
                animate={reduced || inView ? { rotateX: 0, opacity: 1, y: "0em" } : undefined}
                transition={{ duration: 0.9, ease: EASE, delay: delay + index * stagger }}
              >
                {word.text}
              </m.span>
            </span>
            {index < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}
