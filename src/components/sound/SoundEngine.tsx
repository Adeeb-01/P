"use client";

import { useEffect, useSyncExternalStore } from "react";
import { sound } from "@/lib/sound";

const subscribe = (listener: () => void) => sound.subscribe(listener);
const getSnapshot = () => sound.isEnabled();
const getServerSnapshot = () => false;

/** Whether UI sound is on (false during SSR/hydration). */
export function useSoundEnabled() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const INTERACTIVE = "a[href], button, [role='button'], [role='option'], [data-cursor]";

/**
 * Global, delegated sound triggers — components don't need any wiring:
 *  - hover tick when the pointer enters a new interactive element (mouse/pen only)
 *  - tactile click on press
 * Elements can opt out with data-sound="off". Also unlocks audio on the first gesture after reload.
 */
export function SoundEngine() {
  useEffect(() => {
    sound.hydrate();
    let current: Element | null = null;

    const onOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const target = event.target instanceof Element ? event.target.closest(INTERACTIVE) : null;
      if (target === current) return;
      current = target;
      if (target && !target.closest("[data-sound='off']")) sound.tick();
    };
    const onDown = (event: PointerEvent) => {
      sound.unlock();
      const target = event.target instanceof Element ? event.target.closest(INTERACTIVE) : null;
      if (target && !target.closest("[data-sound='off']")) sound.click();
    };
    const onKey = (event: KeyboardEvent) => {
      sound.unlock();
      if (event.key === "Enter" || event.key === " ") {
        const target = document.activeElement?.closest(INTERACTIVE);
        if (target && !target.closest("[data-sound='off']")) sound.click();
      }
    };

    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return null;
}
