"use client";

import { useEffect, useRef, type RefObject } from "react";
import clsx from "clsx";
import { FRAGMENT_BODY } from "@/lib/shader-fragment";
import { DEFAULT_SHADER_PARAMS, hueRotate, type ShaderParams } from "@/lib/shader-params";

const HEIGHTMAP_SRC = "/assets/images/luzia-shader-heightmap.png";

const VERTEX = `#version 300 es
precision highp float;
in vec2 a_position;
in vec2 a_texCoord;
out vec2 v_uv;
void main(){v_uv=a_texCoord;gl_Position=vec4(a_position,0.0,1.0);}`;

const DECLARATIONS = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_deltaTime;
uniform float u_pixelRatio;
uniform vec4 u_mousePosition;
uniform float u_mousePointerDown;
uniform float u_mouseHover;
uniform sampler2D u_image_heightmap;
uniform vec4 u_colors[8];
uniform int u_colors_length;
uniform vec4 u_colorBack;
uniform float u_seed;
uniform float u_speed;
uniform float u_motionMode;
uniform float u_angle;
uniform float u_scale;
uniform float u_turbAmp;
uniform float u_turbFreq;
uniform float u_turbIter;
uniform float u_waveFreq;
uniform float u_bend;
uniform float u_contour;
uniform float u_pushRadius;
uniform float u_pushAmount;
`;

const UNIFORMS: Record<string, number> = {
  u_seed: 6,
  u_speed: 0.6,
  u_motionMode: 0,
  u_angle: 20,
  u_scale: 1.2,
  u_turbAmp: 0.21,
  u_turbFreq: 1.15,
  u_turbIter: 5,
  u_waveFreq: 2.4,
  u_bend: 0.24,
  u_contour: 0.8,
  u_pushRadius: 1.5,
  u_pushAmount: 8,
};

// The first shader start waits for the Hero entrance so WebGL setup never stalls the first fade.
let hasBooted = false;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || "Shader compilation failed");
  return shader;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

/**
 * Animated purple 3D object (WebGL2 heightmap shader). Falls back to a static PNG
 * background when WebGL2 is unavailable, and rotates slowly via CSS.
 */
export function ShaderObject({
  className,
  trackingRoot,
  params,
}: {
  className?: string;
  /** Visitor-controlled targets (ShaderLab). Eased per frame onto the existing uniforms. */
  params?: RefObject<ShaderParams | null> | null;
  /** Element whose pointer movement drives the shader (defaults to the canvas itself). */
  trackingRoot?: RefObject<HTMLElement | null> | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pointerRoot: HTMLElement = trackingRoot?.current ?? canvas;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let teardown: (() => void) | null = null;

    function start(image: HTMLImageElement) {
      if (disposed || !canvas) return;
      const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false, antialias: false, powerPreference: "default" });
      if (!gl) return;

      const program = gl.createProgram()!;
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, DECLARATIONS + FRAGMENT_BODY));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "Shader link failed");
      gl.useProgram(program);

      const buffers: WebGLBuffer[] = [];
      const attributes: [string, Float32Array][] = [
        ["a_position", new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])],
        ["a_texCoord", new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1])],
      ];
      for (const [name, data] of attributes) {
        const buffer = gl.createBuffer()!;
        buffers.push(buffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        const location = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
      }

      const texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.uniform1i(gl.getUniformLocation(program, "u_image_heightmap"), 0);

      const palette = new Float32Array([17 / 255, 17 / 255, 17 / 255, 1, 116 / 255, 48 / 255, 247 / 255, 1, 245 / 255, 242 / 255, 255 / 255, 1]);
      gl.uniform4fv(gl.getUniformLocation(program, "u_colors[0]"), palette);
      gl.uniform1i(gl.getUniformLocation(program, "u_colors_length"), 3);
      gl.uniform4f(gl.getUniformLocation(program, "u_colorBack"), 17 / 255, 17 / 255, 17 / 255, 0);
      for (const [name, value] of Object.entries(UNIFORMS)) {
        const location = gl.getUniformLocation(program, name);
        if (location !== null) gl.uniform1f(location, value);
      }

      const loc = (name: string) => gl.getUniformLocation(program, name);
      // Eased live parameters (ShaderLab). Palette colours: violet + mist get hue-rotated.
      const live = { ...DEFAULT_SHADER_PARAMS };
      let uploadedHue = -1;
      let settled = true;
      const applyParams = () => {
        const target = params?.current;
        if (!target) return;
        const ease = 0.08;
        live.distortion += (target.distortion - live.distortion) * ease;
        live.flow += (target.flow - live.flow) * ease;
        live.hue += (target.hue - live.hue) * ease;
        settled =
          Math.abs(target.distortion - live.distortion) < 0.002 && Math.abs(target.flow - live.flow) < 0.002 && Math.abs(target.hue - live.hue) < 0.002;
        gl.uniform1f(loc("u_turbAmp"), UNIFORMS.u_turbAmp * (0.25 + 1.5 * live.distortion));
        gl.uniform1f(loc("u_bend"), UNIFORMS.u_bend * (0.4 + 1.2 * live.distortion));
        gl.uniform1f(loc("u_speed"), UNIFORMS.u_speed * (0.25 + 1.5 * live.flow));
        gl.uniform1f(loc("u_waveFreq"), UNIFORMS.u_waveFreq * (0.6 + 0.8 * live.flow));
        if (Math.abs(live.hue - uploadedHue) > 0.0005) {
          uploadedHue = live.hue;
          const v = hueRotate(116 / 255, 48 / 255, 247 / 255, live.hue);
          const mist = hueRotate(245 / 255, 242 / 255, 255 / 255, live.hue);
          gl.uniform4fv(loc("u_colors[0]"), new Float32Array([17 / 255, 17 / 255, 17 / 255, 1, v[0], v[1], v[2], 1, mist[0], mist[1], mist[2], 1]));
        }
      };
      // `impulse` is a click "energy pulse" that decays; `energy` follows pointer speed.
      const mouse = { x: -999, y: -999, px: -999, py: -999, hover: 0, down: 0, impulse: 0, energy: 0, fx: -999, fy: -999 };
      const onEnter = () => { mouse.hover = 1; };
      const onLeave = () => { mouse.hover = 0; mouse.down = 0; };
      const onDown = () => { mouse.down = 1; mouse.impulse = 1; };
      const onUp = () => { mouse.down = 0; };
      let cachedRect: DOMRect | null = null;
      const invalidateRect = () => {
        cachedRect = null;
      };
      const onMove = (event: PointerEvent) => {
        const rect = (cachedRect ??= canvas!.getBoundingClientRect()); // cached; invalidated on scroll/resize
        mouse.px = mouse.x;
        mouse.py = mouse.y;
        mouse.x = (event.clientX - rect.left) / rect.width;
        mouse.y = (event.clientY - rect.top) / rect.height;
      };

      const started = performance.now();
      let last = started;
      let frame = 0;
      let running = false;
      let lost = false;
      let onScreen = true;

      const draw = (now: number) => {
        frame = 0;
        if (document.hidden || lost || !onScreen || !canvas!.isConnected) { running = false; return; }
        running = true;
        try {
          const dpr = Math.max(1, window.devicePixelRatio || 1);
          const width = Math.max(1, Math.round(canvas!.clientWidth * dpr));
          const height = Math.max(1, Math.round(canvas!.clientHeight * dpr));
          if (canvas!.width !== width || canvas!.height !== height) { canvas!.width = width; canvas!.height = height; }
          gl.viewport(0, 0, width, height);
          gl.uniform1f(loc("u_time"), reduced.matches ? 0 : (now - started) / 1000);
          gl.uniform1f(loc("u_deltaTime"), (now - last) / 1000);
          gl.uniform2f(loc("u_resolution"), width, height);
          gl.uniform1f(loc("u_pixelRatio"), dpr);
          // Pointer velocity → push strength; click impulse → decaying pulse through the surface.
          const dt = Math.max((now - last) / 1000, 1 / 240);
          const travelled = mouse.fx === -999 ? 0 : Math.hypot(mouse.x - mouse.fx, mouse.y - mouse.fy);
          mouse.fx = mouse.x;
          mouse.fy = mouse.y;
          mouse.energy += (Math.min(travelled / dt / 4, 1) - mouse.energy) * 0.12;
          mouse.impulse *= Math.exp(-dt * 3.2);
          gl.uniform4f(loc("u_mousePosition"), mouse.x, mouse.y, mouse.x - mouse.px, mouse.y - mouse.py);
          gl.uniform1f(loc("u_mousePointerDown"), Math.max(mouse.down, mouse.impulse));
          gl.uniform1f(loc("u_pushAmount"), UNIFORMS.u_pushAmount + mouse.energy * 10 + mouse.impulse * 14);
          gl.uniform1f(loc("u_mouseHover"), mouse.hover);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          applyParams();
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          last = now;
        } catch {
          running = false;
          return;
        }
        // Reduced motion: no idle loop, but keep drawing while visitor-set parameters are still easing.
        if (!reduced.matches || !settled) frame = requestAnimationFrame(draw);
        else running = false;
      };
      const resume = () => {
        if (!running && !frame && !document.hidden && !lost) frame = requestAnimationFrame(draw);
      };
      if (params?.current) params.current.wake = () => {
        settled = false;
        resume();
      };
      const onVisibility = () => {
        if (document.hidden) {
          if (frame) cancelAnimationFrame(frame);
          frame = 0;
          running = false;
        } else resume();
      };
      const onLost = (event: Event) => {
        event.preventDefault();
        lost = true;
        running = false;
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
      };
      const onRestored = () => {
        lost = false;
        resume();
      };

      pointerRoot.addEventListener("pointerenter", onEnter);
      pointerRoot.addEventListener("pointerleave", onLeave);
      pointerRoot.addEventListener("pointerdown", onDown);
      pointerRoot.addEventListener("pointermove", onMove);
      canvas.addEventListener("webglcontextlost", onLost);
      canvas.addEventListener("webglcontextrestored", onRestored);
      window.addEventListener("pointerup", onUp);
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("scroll", invalidateRect, { passive: true });
      window.addEventListener("resize", invalidateRect);
      // Pause the render loop entirely while the object is offscreen.
      const observer = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) resume();
      });
      observer.observe(canvas);
      resume();

      teardown = () => {
        if (frame) cancelAnimationFrame(frame);
        pointerRoot.removeEventListener("pointerenter", onEnter);
        pointerRoot.removeEventListener("pointerleave", onLeave);
        pointerRoot.removeEventListener("pointerdown", onDown);
        pointerRoot.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("webglcontextlost", onLost);
        canvas.removeEventListener("webglcontextrestored", onRestored);
        window.removeEventListener("pointerup", onUp);
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("scroll", invalidateRect);
        window.removeEventListener("resize", invalidateRect);
        observer.disconnect();
        buffers.forEach((buffer) => gl.deleteBuffer(buffer));
        gl.deleteTexture(texture);
        gl.deleteProgram(program);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    }

    function boot() {
      loadImage(HEIGHTMAP_SRC)
        .then((image) => start(image))
        .catch(() => {
          /* PNG background fallback stays visible. */
        });
    }

    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(boot, hasBooted ? 0 : 1400);
      hasBooted = true;
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      window.removeEventListener("load", schedule);
      teardown?.();
    };
  }, [trackingRoot, params]);

  return (
    <canvas
      ref={canvasRef}
      width={360}
      height={360}
      role="img"
      aria-label="Animated purple three-dimensional object"
      className={clsx(
        "block bg-[url('/assets/images/luzia-shader-fallback.png')] bg-contain bg-center bg-no-repeat object-contain will-change-transform",
        "animate-object-turn motion-reduce:animate-none motion-reduce:transform-none",
        className,
      )}
    />
  );
}
