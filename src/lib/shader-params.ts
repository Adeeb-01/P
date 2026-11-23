/** Live, visitor-controlled shader parameters (0…1 targets) shared between ShaderLab and ShaderObject. */
export type ShaderParams = {
  distortion: number;
  flow: number;
  hue: number;
  /** Set by ShaderObject: restarts the render loop (needed when reduced motion stops it). */
  wake?: () => void;
};

export const DEFAULT_SHADER_PARAMS = { distortion: 0.5, flow: 0.5, hue: 0 } as const;

/** Standard RGB hue-rotation matrix (same as CSS `hue-rotate`). */
export function hueRotate(r: number, g: number, b: number, turns: number): [number, number, number] {
  const angle = turns * Math.PI * 2;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  return [
    clamp(r * (0.213 + c * 0.787 - s * 0.213) + g * (0.715 - c * 0.715 - s * 0.715) + b * (0.072 - c * 0.072 + s * 0.928)),
    clamp(r * (0.213 - c * 0.213 + s * 0.143) + g * (0.715 + c * 0.285 + s * 0.14) + b * (0.072 - c * 0.072 - s * 0.283)),
    clamp(r * (0.213 - c * 0.213 - s * 0.787) + g * (0.715 - c * 0.715 + s * 0.715) + b * (0.072 + c * 0.928 + s * 0.072)),
  ];
}
