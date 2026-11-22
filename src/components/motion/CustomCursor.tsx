"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m, useMotionValue, useSpring } from "motion/react";
import clsx from "clsx";
import { usePointerEffects } from "@/components/motion/hooks";

type Mode = "default" | "magnet" | "view" | "drag" | "explore" | "text" | "hidden";

const LENS: Partial<Record<Mode, { label: string; arrows?: boolean }>> = {
  view: { label: "View Case Study" },
  drag: { label: "Drag", arrows: true },
  explore: { label: "Explore" },
};

const RING = 34;
const INTERACTIVE = "a[href], button, [role='button'], summary, label[for]";
const TEXT_INPUT = "input:not([type='checkbox']):not([type='radio']):not([type='submit']), textarea, select, [contenteditable='true']";

/**
 * Physics-driven cursor for fine pointers: a precise dot plus a spring-lagged ring that snaps to
 * buttons/links and morphs into a frosted lens over elements marked `data-cursor="view|drag|explore"`.
 * Not rendered on touch devices or with reduced motion (the native cursor is kept there).
 */
export function CustomCursor() {
  const enabled = usePointerEffects();
  const [mode, setMode] = useState<Mode>("hidden");
  const [pressed, setPressed] = useState(false);
  const [ringScale, setRingScale] = useState(1);

  const pointerX = useMotionValue(-100);
  const pointerY = useMotionValue(-100);
  const ringTargetX = useMotionValue(-100);
  const ringTargetY = useMotionValue(-100);
  const dotX = useSpring(pointerX, { stiffness: 1400, damping: 60, mass: 0.2 });
  const dotY = useSpring(pointerY, { stiffness: 1400, damping: 60, mass: 0.2 });
  const ringX = useSpring(ringTargetX, { stiffness: 420, damping: 32, mass: 0.5 });
  const ringY = useSpring(ringTargetY, { stiffness: 420, damping: 32, mass: 0.5 });

  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");
    let visible = false;

    let lastX = -1;
    let lastY = -1;
    let refreshFrame = 0;
    // Magnet target rect cache: re-measured only when the target changes or the page scrolls/resizes.
    let magnetEl: Element | null = null;
    let magnetRect: DOMRect | null = null;

    const evaluate = (x: number, y: number, target: Element | null) => {
      const lensHost = target?.closest<HTMLElement>("[data-cursor]");
      const lensMode = lensHost?.dataset.cursor as Mode | undefined;
      if (target?.closest(TEXT_INPUT) || lensHost?.dataset.cursor === "none") {
        // Text fields keep the native caret; data-cursor="none" hands over to a custom tool (e.g. the loupe).
        setMode("text");
      } else if (lensMode && lensMode in LENS) {
        setMode(lensMode);
        ringTargetX.set(x);
        ringTargetY.set(y);
      } else {
        const interactive = target?.closest<HTMLElement>(INTERACTIVE);
        if (interactive) {
          // Magnetic snap: the ring is pulled most of the way to the control's centre and sized to it.
          if (interactive !== magnetEl || !magnetRect) {
            magnetEl = interactive;
            magnetRect = interactive.getBoundingClientRect();
          }
          const rect = magnetRect;
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          ringTargetX.set(cx + (x - cx) * 0.22);
          ringTargetY.set(cy + (y - cy) * 0.22);
          setRingScale(Math.min(2.4, Math.max(1.25, (Math.min(rect.width, rect.height) + 18) / RING)));
          setMode("magnet");
        } else {
          ringTargetX.set(x);
          ringTargetY.set(y);
          setRingScale(1);
          setMode("default");
        }
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const { clientX: x, clientY: y } = event;
      lastX = x;
      lastY = y;
      pointerX.set(x);
      pointerY.set(y);
      if (!visible) {
        // First appearance: jump instead of flying in from the corner.
        visible = true;
        dotX.jump(x);
        dotY.jump(y);
        ringX.jump(x);
        ringY.jump(y);
      }
      evaluate(x, y, event.target instanceof Element ? event.target : null);
    };

    // Content can change under a still pointer (dialogs opening, scrolling): re-check what's beneath it.
    const refresh = () => {
      magnetRect = null;
      if (!visible || lastX < 0 || refreshFrame) return;
      refreshFrame = requestAnimationFrame(() => {
        refreshFrame = 0;
        evaluate(lastX, lastY, document.elementFromPoint(lastX, lastY));
      });
    };
    const timers: number[] = [];
    const refreshAfterClick = () => {
      timers.push(window.setTimeout(refresh, 80), window.setTimeout(refresh, 500));
    };
    const onLeave = () => {
      visible = false;
      setMode("hidden");
    };
    const onDown = () => setPressed(true);
    const onUp = () => {
      setPressed(false);
      refreshAfterClick();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("blur", onLeave);
    window.addEventListener("scroll", refresh, { passive: true });
    window.addEventListener("resize", refresh);
    window.addEventListener("keyup", refreshAfterClick);
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      if (refreshFrame) cancelAnimationFrame(refreshFrame);
      window.removeEventListener("scroll", refresh);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("keyup", refreshAfterClick);
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onLeave);
    };
  }, [enabled, pointerX, pointerY, ringTargetX, ringTargetY, dotX, dotY, ringX, ringY]);

  if (!enabled) return null;

  const lens = LENS[mode];
  const hidden = mode === "hidden" || mode === "text";

  return (
    <>
    {/* Dot + ring layer blends with the page (difference) so it reads on light and dark sections. */}
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[2147483000] mix-blend-difference">
      {/* Ring */}
      <m.div style={{ x: ringX, y: ringY }} className="absolute top-0 left-0">
        <m.div
          animate={{
            scale: hidden || lens ? 0 : (mode === "magnet" ? ringScale : 1) * (pressed ? 0.82 : 1),
            opacity: hidden || lens ? 0 : 1,
          }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          style={{ width: RING, height: RING }}
          className={clsx(
            "-translate-x-1/2 -translate-y-1/2 rounded-full border",
            mode === "magnet" ? "border-white/90 bg-white/10" : "border-white/70",
          )}
        />
      </m.div>

      {/* Dot */}
      <m.div style={{ x: dotX, y: dotY }} className="absolute top-0 left-0">
        <m.div
          animate={{ scale: hidden || lens ? 0 : mode === "magnet" ? 0.5 : 1 }}
          transition={{ type: "spring", stiffness: 600, damping: 30 }}
          className="h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        />
      </m.div>
    </div>

    {/* Frosted lens layer (no blending). */}
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[2147483001]">
      <m.div style={{ x: ringX, y: ringY }} className="absolute top-0 left-0">
        <AnimatePresence>
          {lens && (
            <m.div
              key={mode}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: pressed ? 0.92 : 1, opacity: 1 }}
              exit={{ scale: 0.3, opacity: 0, transition: { duration: 0.18 } }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="absolute top-0 left-0"
            >
              <div className="flex h-[112px] w-[112px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-full border border-white/50 bg-white/70 text-center text-[13px] leading-[1.15] font-medium tracking-[-0.26px] text-ink shadow-[0_18px_40px_-16px_rgba(17,17,17,0.45)] backdrop-blur-xl backdrop-saturate-150">
                {lens.arrows && <span className="text-[15px] text-violet">← →</span>}
                <span className="max-w-[80px]">{lens.label}</span>
                {!lens.arrows && <span className="text-[14px] text-violet">↗</span>}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </m.div>

    </div>
    </>
  );
}
