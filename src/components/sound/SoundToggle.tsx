"use client";

import clsx from "clsx";
import { sound } from "@/lib/sound";
import { useSoundEnabled } from "@/components/sound/SoundEngine";

const BARS = [0, 180, 360, 90];

/** Animated 4-bar equalizer that toggles UI sound (off by default, persisted). */
export function SoundToggle({ className }: { className?: string }) {
  const enabled = useSoundEnabled();
  return (
    <button
      type="button"
      onClick={() => sound.setEnabled(!enabled)}
      aria-pressed={enabled}
      aria-label={enabled ? "Turn interface sound off" : "Turn interface sound on"}
      data-sound="off"
      className={clsx(
        "grid h-11 w-11 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-fg transition-colors hover:bg-fg/[0.06] active:scale-95",
        className,
      )}
    >
      <span aria-hidden="true" className="flex h-4 items-end gap-[3px]">
        {BARS.map((delay, index) => (
          <span
            key={index}
            style={{ animationDelay: `${delay}ms` }}
            className={clsx(
              "block w-[2.5px] origin-bottom rounded-full bg-current transition-[height,opacity] duration-300",
              enabled ? "h-4 animate-eq opacity-100 motion-reduce:animate-none" : "opacity-45",
              !enabled && ["h-[5px]", "h-[9px]", "h-[7px]", "h-[4px]"][index],
            )}
          />
        ))}
      </span>
    </button>
  );
}
