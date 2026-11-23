"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import clsx from "clsx";
import { ShaderOrb } from "@/components/closing/ShaderOrb";
import { DEFAULT_SHADER_PARAMS, type ShaderParams } from "@/lib/shader-params";
import { sound } from "@/lib/sound";

type Key = "distortion" | "flow" | "hue";

const CONTROLS: { key: Key; label: string; format: (value: number) => string }[] = [
  { key: "distortion", label: "Distortion", format: (value) => `${value}` },
  { key: "flow", label: "Flow", format: (value) => `${value}` },
  { key: "hue", label: "Hue", format: (value) => `${Math.round(value * 3.6)}°` },
];

const DEFAULTS: Record<Key, number> = {
  distortion: DEFAULT_SHADER_PARAMS.distortion * 100,
  flow: DEFAULT_SHADER_PARAMS.flow * 100,
  hue: DEFAULT_SHADER_PARAMS.hue * 100,
};

/** Glass pill slider: drag horizontally or use arrow keys (±5), PageUp/PageDown (±10), Home/End. */
function PillSlider({ label, value, format, onChange }: { label: string; value: number; format: (value: number) => string; onChange: (value: number) => void }) {
  const rect = useRef<DOMRect | null>(null);
  const set = (next: number) => onChange(Math.round(Math.min(100, Math.max(0, next))));
  const fromPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (!rect.current) return;
    set(((event.clientX - rect.current.left) / rect.current.width) * 100);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5, PageUp: 10, PageDown: -10 };
    if (event.key in steps) set(value + steps[event.key]);
    else if (event.key === "Home") set(0);
    else if (event.key === "End") set(100);
    else return;
    event.preventDefault();
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={format(value)}
      onKeyDown={onKeyDown}
      onPointerDown={(event) => {
        rect.current = event.currentTarget.getBoundingClientRect(); // measured once per drag
        event.currentTarget.setPointerCapture(event.pointerId);
        fromPointer(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) fromPointer(event);
      }}
      className="relative h-9 w-[112px] cursor-ew-resize touch-none overflow-hidden rounded-full border border-white/15 bg-white/[0.06] backdrop-blur-md select-none focus-visible:outline-offset-2"
    >
      <span aria-hidden="true" style={{ transform: `scaleX(${value / 100})` }} className="absolute inset-0 origin-left bg-[linear-gradient(90deg,rgba(116,48,247,0.55),rgba(178,140,255,0.45))] transition-transform duration-150 ease-out" />
      <span aria-hidden="true" className="relative flex h-full items-center justify-between px-3 text-[11px] font-medium tracking-[0.02em] text-white">
        <span className="opacity-80">{label}</span>
        <span className="tabular-nums opacity-60">{format(value)}</span>
      </span>
    </div>
  );
}

/**
 * Interactive shader lab: the WebGL orb plus three glass pill sliders (Distortion, Flow, Hue) and a
 * Reset, mapped onto ShaderObject's existing uniforms with smooth per-frame easing.
 * Hidden at ≤640px, where the orb is a static image.
 */
export function ShaderLab({ orbClassName }: { orbClassName?: string }) {
  const [values, setValues] = useState<Record<Key, number>>(DEFAULTS);
  const params = useRef<ShaderParams>({ ...DEFAULT_SHADER_PARAMS });

  useEffect(() => {
    params.current.distortion = values.distortion / 100;
    params.current.flow = values.flow / 100;
    params.current.hue = values.hue / 100;
    params.current.wake?.();
  }, [values]);

  const update = (key: Key, value: number) => {
    setValues((current) => {
      if (current[key] === value) return current;
      sound.tick();
      return { ...current, [key]: value };
    });
  };
  const dirty = CONTROLS.some(({ key }) => values[key] !== DEFAULTS[key]);

  return (
    <div className="flex flex-col items-center gap-5">
      <ShaderOrb className={orbClassName} params={params} />
      <div role="group" aria-label="Shader controls" className="flex flex-wrap items-center justify-center gap-2 max-[640.98px]:hidden">
        {CONTROLS.map((control) => (
          <PillSlider key={control.key} label={control.label} value={values[control.key]} format={control.format} onChange={(value) => update(control.key, value)} />
        ))}
        <button
          type="button"
          onClick={() => setValues(DEFAULTS)}
          disabled={!dirty}
          aria-label="Reset shader"
          className={clsx(
            "grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-white/15 bg-white/[0.06] text-white backdrop-blur-md transition-opacity active:scale-95 disabled:cursor-default disabled:opacity-35",
          )}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10a6 6 0 1 0 1.8-4.3M4 4v3.5h3.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
