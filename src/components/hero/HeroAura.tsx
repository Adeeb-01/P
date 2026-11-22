"use client";

import { useEffect, useRef, type RefObject } from "react";
import { usePrefersReducedMotion } from "@/components/motion/hooks";

const VERTEX = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

// Domain-warped fbm "liquid" in the brand violet, with a soft attractor that follows the pointer.
const FRAGMENT = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform float uBoost;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*uRes)/min(uRes.x,uRes.y);
  vec2 m=uMouse*vec2(uRes.x/min(uRes.x,uRes.y),uRes.y/min(uRes.x,uRes.y))*.5;
  vec2 toM=m-uv; float dm=length(toM);
  uv+=toM*.18*uHover*smoothstep(.9,0.,dm);
  float t=uTime*.06;
  vec2 q=vec2(fbm(uv*1.5+t),fbm(uv*1.5-t+3.1));
  float f=fbm(uv*1.7+q*1.6+vec2(t*.7,-t*.5));
  vec3 violet=vec3(.455,.188,.969), lilac=vec3(.72,.58,1.), ice=vec3(.55,.80,1.);
  vec3 col=mix(violet,lilac,smoothstep(.25,.85,f));
  col=mix(col,ice,smoothstep(.62,.95,q.y)*.35);
  vec2 e=gl_FragCoord.xy/uRes;
  float edge=smoothstep(0.,.22,e.x)*smoothstep(1.,.78,e.x)*smoothstep(0.,.22,e.y)*smoothstep(1.,.78,e.y);
  float body=smoothstep(.62,.02,length(uv*vec2(.9,1.)))*edge;
  float halo=smoothstep(.38,0.,dm)*.18*uHover;
  float a=clamp((body*(.07+.2*f)+halo*body)*uBoost,0.,.6);
  gl_FragColor=vec4(col*a,a);
}`;

const RESOLUTION_SCALE = 0.5;

/**
 * Lightweight WebGL "liquid aura" behind the hero portrait. Renders at half resolution, pauses when
 * offscreen (IntersectionObserver) or the tab is hidden, and is skipped for reduced motion.
 */
export function HeroAura({ pointerRoot, className }: { pointerRoot: RefObject<HTMLElement | null>; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uHover = gl.getUniformLocation(program, "uHover");
    const uBoost = gl.getUniformLocation(program, "uBoost");

    // Smoothed pointer in normalised device space (-1…1, y up).
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, hover: 0, thover: 0 };
    const root = pointerRoot.current;
    let cachedRect: DOMRect | null = null;
    const invalidateRect = () => {
      cachedRect = null;
    };
    const onMove = (event: PointerEvent) => {
      const rect = (cachedRect ??= canvas.getBoundingClientRect()); // cached; invalidated on scroll/resize
      mouse.tx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.ty = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.thover = 1;
    };
    const onLeave = () => {
      mouse.thover = 0;
    };
    root?.addEventListener("pointermove", onMove);
    root?.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", invalidateRect, { passive: true });
    window.addEventListener("resize", invalidateRect);

    let frame = 0;
    let visible = true;
    const start = performance.now();

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2) * RESOLUTION_SCALE;
      const width = Math.max(1, Math.round(canvas.clientWidth * scale));
      const height = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const draw = (now: number) => {
      frame = 0;
      if (!visible || document.hidden) return;
      resize();
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      mouse.hover += (mouse.thover - mouse.hover) * 0.04;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uHover, mouse.hover);
      // Attribute read only (no layout): the aura glows brighter on the dark canvas.
      gl.uniform1f(uBoost, document.documentElement.dataset.theme === "dark" ? 1.9 : 1);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = requestAnimationFrame(draw);
    };
    const resume = () => {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) resume();
    });
    observer.observe(canvas);
    const onVisibility = () => resume();
    document.addEventListener("visibilitychange", onVisibility);
    resume();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      root?.removeEventListener("pointermove", onMove);
      root?.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", invalidateRect);
      window.removeEventListener("resize", invalidateRect);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [reduced, pointerRoot]);

  if (reduced) return null;
  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
