/** Effective DPR, not a multiplier of device DPR. Never rasterize mobile shaders at DPR 2–3. */
export function renderQuality(mobile: boolean) {
  let dpr = mobile ? 0.75 : Math.min(window.devicePixelRatio || 1, 1.5);
  let average = 16.7;
  let frames = 0;
  return {
    get dpr() { return dpr; },
    sample(ms: number) {
      if (ms > 100 || ms < 1) return; // Ignore suspension / first frame.
      average += (ms - average) * 0.08;
      frames++;
      const floor = mobile ? 0.65 : 0.75;
      const ceiling = mobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
      if (average > 19 && frames >= 24) { dpr = Math.max(floor, dpr - 0.1); frames = 0; }
      else if (frames >= 120) {
        if (average < 16.9) dpr = Math.min(ceiling, dpr + 0.025);
        frames = 0;
      }
    },
  };
}
