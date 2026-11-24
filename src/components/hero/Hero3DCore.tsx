"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useMobileGpu, usePrefersReducedMotion } from "@/components/motion/hooks";
import { renderQuality } from "@/lib/render-quality";

const VERTEX = `#version 300 es
in vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

/*
 * Raymarched liquid-glass ring.
 *  - SDF: torus in the view plane + 3 octaves of animated value noise + angular ripples + click pulse
 *  - Normals: 4-tap tetrahedral gradient
 *  - Shading: Fresnel rim, thin-film iridescence (cosine palette over view angle), and chromatic
 *    dispersion (per-channel refraction into a procedural gradient environment)
 *  - Themes: pearlescent violet crystal (light) / obsidian + neon-violet volumetric glow (dark)
 */
const FRAGMENT = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uRot;
uniform float uPulse;
uniform float uWobble;
uniform float uDark;

mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 3; i++){ v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; } return v; }

float map(vec3 p){
  p.xz *= rot(uRot.x);
  p.yz *= rot(uRot.y);
  float t = uTime * 0.35;
  vec2 q = vec2(length(p.xy) - 1.0, p.z);           // ring facing the camera
  float ang = atan(p.y, p.x);
  float tube = 0.15 + 0.035 * sin(ang * 3.0 + t * 2.0);
  float d = length(q) - tube;
  float amp = 0.11 + 0.08 * uWobble;
  d -= amp * (fbm(p * 1.9 + vec3(0.0, t, t * 0.7)) - 0.5);
  d -= 0.018 * sin(ang * 9.0 - t * 4.0);
  d -= uPulse * 0.06 * sin(length(p.xy) * 14.0 - uTime * 10.0);
  return d;
}

vec3 normalAt(vec3 p){
  const vec2 k = vec2(1.0, -1.0);
  const float e = 0.0015;
  return normalize(k.xyy * map(p + k.xyy * e) + k.yyx * map(p + k.yyx * e) + k.yxy * map(p + k.yxy * e) + k.xxx * map(p + k.xxx * e));
}

vec3 env(vec3 d){
  float h = 0.5 + 0.5 * d.y;
  vec3 lightEnv = mix(vec3(0.86, 0.80, 1.0), vec3(1.0, 0.99, 1.0), h);
  vec3 darkEnv = mix(vec3(0.02, 0.01, 0.05), vec3(0.32, 0.16, 0.72), pow(h, 2.2));
  vec3 base = mix(lightEnv, darkEnv, uDark);
  float key = pow(max(dot(d, normalize(vec3(0.45, 0.75, 0.5))), 0.0), 36.0);
  float fill = pow(max(dot(d, normalize(vec3(-0.6, -0.2, 0.7))), 0.0), 10.0);
  return base + key * mix(1.2, 2.2, uDark) + fill * vec3(0.62, 0.42, 1.0) * mix(0.35, 0.8, uDark);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec3 ro = vec3(0.0, 0.0, 4.0);
  vec3 rd = normalize(vec3(uv, -1.45));

  // Early exit: bounding sphere around the ring.
  // Fade everything to zero before the canvas bounds so the square canvas never shows.
  float edgeFade = smoothstep(0.5, 0.42, max(abs(uv.x), abs(uv.y)));
  float b = dot(ro, rd); float c = dot(ro, ro) - 1.55 * 1.55; float disc = b * b - c;
  float glowAcc = 0.0;
  float tHit = -1.0;
  if (disc > 0.0) {
    float tt = max(-b - sqrt(disc), 0.0);
    float tMax = -b + sqrt(disc);
    float minD = 1e3;
    for (int i = 0; i < 64; i++) {
      vec3 p = ro + rd * tt;
      float d = map(p);
      minD = min(minD, d);
      if (d < 0.0012) { tHit = tt; break; }
      tt += d * 0.78;
      if (tt > tMax) break;
    }
    glowAcc = exp(-max(minD, 0.0) * 9.0);
  }

  vec3 violet = vec3(0.455, 0.188, 0.969);
  if (tHit < 0.0) {
    // Volumetric halo around the ring (much stronger in dark mode).
    float g = glowAcc * mix(0.06, 0.42, uDark) * edgeFade;
    vec3 col = mix(vec3(0.62, 0.48, 1.0), violet, uDark) * g;
    outColor = vec4(col, g);
    return;
  }

  vec3 p = ro + rd * tHit;
  vec3 n = normalAt(p);
  float fres = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
  vec3 refl = env(reflect(rd, n));
  // Chromatic dispersion: each channel refracts with a slightly different index.
  vec3 refr = vec3(env(refract(rd, n, 0.90)).r, env(refract(rd, n, 0.875)).g, env(refract(rd, n, 0.85)).b);
  vec3 film = 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.67) + fres * 0.9 + dot(n, vec3(0.2, 0.45, 0.3)) + uTime * 0.04));

  vec3 lightCol = mix(refr, refl, 0.25 + 0.75 * fres);
  lightCol = mix(lightCol, lightCol * (0.65 + 0.7 * film), 0.45);
  lightCol = mix(lightCol, violet, 0.16 + 0.22 * fres);

  vec3 darkCol = vec3(0.03, 0.02, 0.06) + refl * 0.22 + refr * 0.08;
  darkCol += violet * fres * 1.35 + film * fres * 0.45;

  vec3 col = mix(lightCol, darkCol, uDark);
  // Softer silhouette: opacity eases off at grazing angles (cheap edge anti-aliasing).
  float alpha = mix(0.92, 0.97, uDark) * mix(1.0, 0.55, pow(fres, 4.0)) * edgeFade;
  outColor = vec4(col * alpha, alpha);
}`;


/**
 * Real-time raymarched liquid-glass ring framing the hero portrait (WebGL2, no dependencies).
 * Spring-damped rotation follows the pointer; clicks send a ripple pulse; scroll velocity adds
 * wobble. Resolution adapts to keep frames under ~18ms. Pauses offscreen / in hidden tabs and
 * disposes all GL resources on unmount. Reduced motion: a single static frame.
 */
export function Hero3DCore({ pointerRoot, className }: { pointerRoot: RefObject<HTMLElement | null>; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  const mobile = useMobileGpu();
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "high-performance" });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl.FRAGMENT_SHADER, mobile ? FRAGMENT.replace("i < 64", "i < 36").replace("i < 3;", "i < 2;") : FRAGMENT);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const u = Object.fromEntries(["uRes", "uTime", "uRot", "uPulse", "uWobble", "uDark"].map((name) => [name, gl.getUniformLocation(program, name)]));

    // ── Adaptive resolution ──
    const quality = renderQuality(mobile);
    const resize = () => {
      const dpr = quality.dpr;
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    // ── Spring-damped interaction state ──
    const state = { rx: 0, ry: 0, vx: 0, vy: 0, tx: 0, ty: 0, pulse: 0, wobble: 0, wobbleTarget: 0, dark: 0 };
    const root = pointerRoot.current;
    let rect: DOMRect | null = null;
    const invalidate = () => {
      rect = null;
    };
    const onMove = (event: PointerEvent) => {
      rect ??= canvas.getBoundingClientRect(); // cached; invalidated on scroll/resize
      state.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 0.9;
      state.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 0.7;
      kick();
    };
    const onLeave = () => {
      state.tx = 0;
      state.ty = 0;
    };
    const onDown = (event: PointerEvent) => {
      onMove(event);
      state.pulse = 1;
      kick();
    };
    let lastScrollY = window.scrollY;
    let lastScrollT = performance.now();
    const onScroll = () => {
      invalidate();
      const now = performance.now();
      const velocity = Math.abs(window.scrollY - lastScrollY) / Math.max(now - lastScrollT, 8);
      lastScrollY = window.scrollY;
      lastScrollT = now;
      state.wobbleTarget = Math.min(velocity / 3, 1);
      kick();
    };

    let frame = 0;
    let visible = false;
    let last = performance.now();
    const start = last;
    const readDark = () => (document.documentElement.dataset.theme === "dark" ? 1 : 0);
    state.dark = readDark();

    const render = (time: number) => {
      resize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform1f(u.uTime, time);
      gl.uniform2f(u.uRot, state.rx, state.ry);
      gl.uniform1f(u.uPulse, state.pulse);
      gl.uniform1f(u.uWobble, state.wobble);
      gl.uniform1f(u.uDark, state.dark);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.dataset.rendered = "true";
    };

    const tick = (now: number) => {
      frame = 0;
      if (!visible || document.hidden || gl.isContextLost()) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      const frameMs = now - last;
      last = now;

      quality.sample(frameMs);

      // Critically damped springs for rotation; exponential decay for pulse / wobble.
      const k = 38;
      const damping = 2 * Math.sqrt(k);
      state.vx += ((state.tx - state.rx) * k - state.vx * damping) * dt;
      state.vy += ((state.ty - state.ry) * k - state.vy * damping) * dt;
      state.rx += state.vx * dt;
      state.ry += state.vy * dt;
      state.pulse *= Math.exp(-dt * 2.2);
      state.wobble += (state.wobbleTarget - state.wobble) * Math.min(1, dt * 6);
      state.wobbleTarget *= Math.exp(-dt * 3);
      const targetDark = readDark(); // attribute read only, no layout
      state.dark += (targetDark - state.dark) * Math.min(1, dt * 5);

      render((now - start) / 1000);
      frame = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (reduced) return;
      if (!frame && visible && !document.hidden && !gl.isContextLost()) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
      else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    observer.observe(canvas);
    const resizeObserver = new ResizeObserver(() => {
      if (reduced) render(4.0);
    });
    resizeObserver.observe(canvas);

    // Reduced motion: re-render the static frame when the theme flips.
    const themeObserver = new MutationObserver(() => {
      state.dark = readDark();
      if (reduced) render(4.0);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    if (reduced) {
      // Static high-res frame: full quality, fixed time.
      render(4.0);
    } else {
      root?.addEventListener("pointermove", onMove);
      root?.addEventListener("pointerleave", onLeave);
      root?.addEventListener("pointerdown", onDown);
      root?.addEventListener("pointercancel", onLeave);
      root?.addEventListener("pointerup", onLeave);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", invalidate);
      document.addEventListener("visibilitychange", kick);
      kick();
    }

    const onLost = (event: Event) => { event.preventDefault(); cancelAnimationFrame(frame); frame = 0; };
    const onRestored = () => setGeneration((value) => value + 1);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      root?.removeEventListener("pointermove", onMove);
      root?.removeEventListener("pointerleave", onLeave);
      root?.removeEventListener("pointerdown", onDown);
      root?.removeEventListener("pointercancel", onLeave);
      root?.removeEventListener("pointerup", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", invalidate);
      document.removeEventListener("visibilitychange", kick);
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [pointerRoot, reduced, mobile, generation]);

  // Rebuild all resources when quality mode changes or the browser restores a lost context.
  return <canvas key={`${reduced}-${mobile}-${generation}`} ref={canvasRef} aria-hidden="true" data-hero-core data-raymarch-steps={mobile ? 36 : 64} className={className} />;
}
