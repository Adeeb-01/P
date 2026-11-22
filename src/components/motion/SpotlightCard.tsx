"use client";

import { useRef, type PointerEvent } from "react";
import clsx from "clsx";
import { useCachedRect, usePointerEffects } from "@/components/motion/hooks";

type Tone = "light" | "dark";

const GLOW: Record<Tone, { fill: string; border: string }> = {
  light: {
    fill: "bg-[radial-gradient(420px_circle_at_var(--spot-x)_var(--spot-y),rgba(116,48,247,0.07),transparent_65%)]",
    border: "bg-[radial-gradient(260px_circle_at_var(--spot-x)_var(--spot-y),rgba(116,48,247,0.55),transparent_70%)]",
  },
  dark: {
    fill: "bg-[radial-gradient(420px_circle_at_var(--spot-x)_var(--spot-y),rgba(255,255,255,0.08),transparent_65%)]",
    border: "bg-[radial-gradient(260px_circle_at_var(--spot-x)_var(--spot-y),rgba(255,255,255,0.5),transparent_70%)]",
  },
};

/**
 * Card with a cursor-tracking spotlight: a soft radial fill plus a 1px border glow (masked ring).
 * Pointer position is written to CSS variables directly, so moving the mouse never re-renders React.
 */
export function SpotlightCard({
  as: Component = "article",
  tone = "light",
  className,
  children,
  ...rest
}: {
  as?: "article" | "aside" | "div";
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "children">) {
  const ref = useRef<HTMLElement>(null);
  const enabled = usePointerEffects();
  const { measure, reset } = useCachedRect();

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    rest.onPointerMove?.(event);
    if (!enabled || !ref.current) return;
    const rect = measure(ref.current);
    ref.current.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    ref.current.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  };

  return (
    <Component
      {...rest}
      ref={ref as React.Ref<never>}
      onPointerMove={onPointerMove}
      onPointerLeave={(event) => {
        reset();
        rest.onPointerLeave?.(event);
      }}
      className={clsx("group/spot [--spot-x:50%] [--spot-y:0%]", className)}
    >
      {children}
      {enabled && (
        <>
          <span
            aria-hidden="true"
            className={clsx(
              "pointer-events-none absolute inset-0 z-[3] rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100",
              GLOW[tone].fill,
            )}
          />
          <span
            aria-hidden="true"
            className={clsx(
              "pointer-events-none absolute inset-0 z-[3] rounded-[inherit] p-px opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100",
              "[mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)]",
              GLOW[tone].border,
            )}
          />
        </>
      )}
    </Component>
  );
}
