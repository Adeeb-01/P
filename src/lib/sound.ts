/**
 * Procedural UI sound synthesis with the Web Audio API — no audio files.
 *
 *  - tick:   ~4ms high-passed noise impulse (hover)
 *  - click:  soft low sine "thud" with a short high harmonic snap (press)
 *  - whoosh: band-passed noise with a rising filter sweep (palette / route transitions)
 *  - air:    near-silent band-passed noise whose level follows scroll velocity (silent at rest)
 *
 * Every one-shot sound is routed through a StereoPannerNode whose pan follows the pointer's
 * horizontal position (capped at ±0.6 for comfortable headphone listening).
 *
 * Sound is OFF by default. The AudioContext is created lazily inside a user gesture (the toggle),
 * and resumed on the first interaction after a reload when the stored preference is "on".
 */

const STORAGE_KEY = "mc-sound";
const TICK_THROTTLE_MS = 45;
const PAN_WIDTH = 0.6;
const AIR_MAX_GAIN = 0.03;

type Listener = () => void;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private enabled = false;
  private hydrated = false;
  private lastTick = 0;
  private pan = 0;
  private air: { source: AudioBufferSourceNode; filter: BiquadFilterNode; gain: GainNode } | null = null;
  private airTimer = 0;
  private listeners = new Set<Listener>();

  /** Restore the stored preference (client only). Does not create audio until a gesture. */
  hydrate() {
    if (this.hydrated) return;
    this.hydrated = true;
    try {
      this.enabled = localStorage.getItem(STORAGE_KEY) === "on";
    } catch {
      this.enabled = false;
    }
    this.emit();
  }

  isEnabled() {
    return this.enabled;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    this.listeners.forEach((listener) => listener());
  }

  /** Must be called from a user gesture handler the first time. */
  unlock() {
    if (!this.enabled) return;
    if (!this.ctx) {
      const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Context) return;
      this.ctx = new Context();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);
      // One second of white noise, reused by every noise-based sound.
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
      this.noise = buffer;
      this.startAir();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
    } catch {
      /* ignore */
    }
    if (enabled) {
      this.unlock();
      this.click();
    } else if (this.air && this.ctx) {
      this.air.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
    this.emit();
  }

  private ready() {
    return this.enabled && this.ctx && this.master && this.noise && this.ctx.state === "running";
  }

  /** Horizontal pointer position in CSS px → stereo pan (−0.6 … +0.6). No layout reads. */
  setPointerX(clientX: number) {
    const width = window.innerWidth || 1;
    this.pan = Math.max(-1, Math.min(1, (clientX / width) * 2 - 1)) * PAN_WIDTH;
  }

  /** Per-sound stereo panner feeding the master bus (falls back to master if unsupported). */
  private output(ctx: AudioContext): AudioNode {
    if (typeof ctx.createStereoPanner !== "function") return this.master!;
    const panner = ctx.createStereoPanner();
    panner.pan.value = this.pan;
    panner.connect(this.master!);
    return panner;
  }

  private startAir() {
    if (this.air || !this.ctx || !this.master || !this.noise) return;
    const ctx = this.ctx;
    const source = this.noiseSource(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 600;
    filter.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    source.connect(filter).connect(gain).connect(this.master);
    source.start();
    this.air = { source, filter, gain };
  }

  /**
   * Scroll-velocity "air": level and brightness follow |velocity| (px/s) and fall back to silence
   * shortly after scrolling stops. Inaudible unless sound is on and audio has been unlocked.
   */
  scrollVelocity(velocity: number) {
    if (!this.ready() || !this.air) return;
    const ctx = this.ctx!;
    const level = Math.min(Math.abs(velocity) / 4000, 1);
    this.air.gain.gain.setTargetAtTime(level * AIR_MAX_GAIN, ctx.currentTime, 0.08);
    this.air.filter.frequency.setTargetAtTime(500 + level * 1600, ctx.currentTime, 0.1);
    window.clearTimeout(this.airTimer);
    this.airTimer = window.setTimeout(() => {
      if (this.air && this.ctx) this.air.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.12);
    }, 140);
  }

  private noiseSource(ctx: AudioContext) {
    const source = ctx.createBufferSource();
    source.buffer = this.noise;
    source.loop = true;
    return source;
  }

  tick() {
    if (!this.ready()) return;
    const now = performance.now();
    if (now - this.lastTick < TICK_THROTTLE_MS) return;
    this.lastTick = now;
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const source = this.noiseSource(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 5200;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.004 + 0.012);
    source.connect(filter).connect(gain).connect(this.output(ctx));
    source.start(t, Math.random() * 0.5);
    source.stop(t + 0.02);
  }

  click() {
    if (!this.ready()) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime;

    // Low "thud": pitch-dropping sine.
    const thud = ctx.createOscillator();
    thud.type = "sine";
    thud.frequency.setValueAtTime(150, t);
    thud.frequency.exponentialRampToValueAtTime(55, t + 0.09);
    const thudGain = ctx.createGain();
    thudGain.gain.setValueAtTime(0.0001, t);
    thudGain.gain.exponentialRampToValueAtTime(0.22, t + 0.004);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    const out = this.output(ctx);
    thud.connect(thudGain).connect(out);
    thud.start(t);
    thud.stop(t + 0.13);

    // High harmonic snap: very short band-passed noise.
    const snap = this.noiseSource(ctx);
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 3400;
    band.Q.value = 1.4;
    const snapGain = ctx.createGain();
    snapGain.gain.setValueAtTime(0.07, t);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
    snap.connect(band).connect(snapGain).connect(out);
    snap.start(t, Math.random() * 0.5);
    snap.stop(t + 0.03);
  }

  whoosh() {
    if (!this.ready()) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime;
    const duration = 0.38;
    const source = this.noiseSource(ctx);
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 0.9;
    band.frequency.setValueAtTime(320, t);
    band.frequency.exponentialRampToValueAtTime(2600, t + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.07, t + duration * 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    source.connect(band).connect(gain).connect(this.output(ctx));
    source.start(t, Math.random() * 0.5);
    source.stop(t + duration + 0.02);
  }
}

/** App-wide singleton (client-side usage only; constructing it touches no browser APIs). */
export const sound = new SoundEngine();
