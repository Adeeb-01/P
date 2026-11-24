"use client";

import { useId, useSyncExternalStore, type MouseEvent } from "react";
import clsx from "clsx";
import { getTheme, setTheme, subscribeTheme } from "@/lib/theme";

/** Current theme ("light" during SSR/hydration; the pre-paint script has already set the real one). */
export function useTheme() {
  return useSyncExternalStore(subscribeTheme, getTheme, () => "light" as const);
}

/** Sun ↔ moon toggle. The switch is revealed with a circular View Transition from the click point. */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme();
  const dark = theme === "dark";
  const maskId = `theme-mask-${useId().replace(/:/g, "")}`;

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    // Keyboard activation reports (0, 0): use the button centre instead.
    const origin = event.clientX || event.clientY ? { x: event.clientX, y: event.clientY } : { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    setTheme(dark ? "light" : "dark", origin);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={dark}
      className={clsx(
        "grid h-11 w-11 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-fg transition-colors hover:bg-fg/[0.06] active:scale-95",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] overflow-visible">
        {/* Moon mask: a circle that slides over the sun disc in dark mode. */}
        <mask id={maskId}>
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <circle
            r="6"
            style={{ cx: dark ? 16.5 : 30, cy: dark ? 8 : 0 }}
            fill="black"
            className="transition-[cx,cy] duration-500 ease-luzia motion-reduce:transition-none"
          />
        </mask>
        <circle
          cx="12"
          cy="12"
          style={{ r: dark ? 8 : 5 }}
          fill="currentColor"
          mask={`url(#${maskId})`}
          className="transition-[r] duration-500 ease-luzia motion-reduce:transition-none"
        />
        <g
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          className={clsx("origin-center transition-[opacity,scale,rotate] duration-500 ease-luzia motion-reduce:transition-none", dark ? "scale-50 rotate-90 opacity-0" : "opacity-100")}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line key={angle} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${angle} 12 12)`} />
          ))}
        </g>
      </svg>
    </button>
  );
}
