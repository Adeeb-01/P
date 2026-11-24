"use client";

import { useEffect, useRef } from "react";
import { useClosingStage } from "@/components/closing/ClosingStage";
import { usePrefersReducedMotion } from "@/components/motion/hooks";

const RADIUS = 150; // pointer influence radius (CSS px)
const LINK = 96; // max distance for particle ↔ particle links near the cursor
const SPRING = 0.012; // pull back toward home
const DAMPING = 0.9;
const PUSH = 2.4;

/**
 * Interactive particle constellation for the dark closing section (Canvas 2D).
 * Particles spring toward drifting home positions, are repelled by the pointer, and link up
 * near it. Pauses offscreen / in hidden tabs; not rendered for reduced motion.
 */
export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stage = useClosingStage();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = stage?.current;
    if (!canvas || !root || reduced) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let count = 0;
    let px = new Float32Array(0);
    let py = new Float32Array(0);
    let vx = new Float32Array(0);
    let vy = new Float32Array(0);
    let hx = new Float32Array(0);
    let hy = new Float32Array(0);
    let phase = new Float32Array(0);
    const near: number[] = [];

    const pointer = { x: -9999, y: -9999, active: false };
    let rect: DOMRect | null = null;

    const seed = () => {
      const mobile = window.matchMedia("(max-width: 1199px), (pointer: coarse)").matches;
      const dpr = mobile ? 0.75 : Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      count = Math.round(Math.max(mobile ? 20 : 40, Math.min(mobile ? 36 : 110, (width * height) / 16000)));
      px = new Float32Array(count);
      py = new Float32Array(count);
      vx = new Float32Array(count);
      vy = new Float32Array(count);
      hx = new Float32Array(count);
      hy = new Float32Array(count);
      phase = new Float32Array(count);
      // Jittered grid gives an even, organic spread.
      const cols = Math.ceil(Math.sqrt((count * width) / Math.max(1, height)));
      const rows = Math.ceil(count / cols);
      for (let i = 0; i < count; i += 1) {
        const cx = ((i % cols) + 0.5 + (Math.random() - 0.5) * 0.8) / cols;
        const cy = (Math.floor(i / cols) + 0.5 + (Math.random() - 0.5) * 0.8) / rows;
        hx[i] = px[i] = cx * width;
        hy[i] = py[i] = cy * height;
        phase[i] = Math.random() * Math.PI * 2;
      }
      rect = null;
    };

    const onMove = (event: PointerEvent) => {
      if (!rect) rect = canvas.getBoundingClientRect(); // cached; invalidated on scroll/resize
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const invalidate = () => {
      rect = null;
    };

    let frame = 0;
    let visible = false;
    const draw = (now: number) => {
      frame = 0;
      if (!visible || document.hidden) return;
      const t = now / 1000;
      context.clearRect(0, 0, width, height);
      near.length = 0;

      for (let i = 0; i < count; i += 1) {
        const homeX = hx[i] + Math.sin(t * 0.35 + phase[i]) * 7;
        const homeY = hy[i] + Math.cos(t * 0.3 + phase[i]) * 7;
        let ax = (homeX - px[i]) * SPRING;
        let ay = (homeY - py[i]) * SPRING;
        let proximity = 0;
        if (pointer.active) {
          const dx = px[i] - pointer.x;
          const dy = py[i] - pointer.y;
          const distance = Math.hypot(dx, dy) || 1;
          if (distance < RADIUS) {
            proximity = 1 - distance / RADIUS;
            const force = proximity * proximity * PUSH;
            ax += (dx / distance) * force;
            ay += (dy / distance) * force;
            near.push(i);
          }
        }
        vx[i] = (vx[i] + ax) * DAMPING;
        vy[i] = (vy[i] + ay) * DAMPING;
        px[i] += vx[i];
        py[i] += vy[i];

        context.beginPath();
        context.arc(px[i], py[i], 1.1 + proximity * 1.3, 0, Math.PI * 2);
        context.fillStyle = proximity > 0 ? `rgba(178, 140, 255, ${0.35 + proximity * 0.6})` : "rgba(255, 255, 255, 0.22)";
        context.fill();
      }

      // Links only among particles near the cursor (keeps cost linear in practice).
      context.lineWidth = 0.8;
      for (let a = 0; a < near.length; a += 1) {
        const i = near[a];
        const toPointer = 1 - Math.hypot(px[i] - pointer.x, py[i] - pointer.y) / RADIUS;
        context.strokeStyle = `rgba(116, 48, 247, ${toPointer * 0.45})`;
        context.beginPath();
        context.moveTo(px[i], py[i]);
        context.lineTo(pointer.x, pointer.y);
        context.stroke();
        for (let b = a + 1; b < near.length; b += 1) {
          const j = near[b];
          const distance = Math.hypot(px[i] - px[j], py[i] - py[j]);
          if (distance < LINK) {
            context.strokeStyle = `rgba(255, 255, 255, ${(1 - distance / LINK) * 0.22})`;
            context.beginPath();
            context.moveTo(px[i], py[i]);
            context.lineTo(px[j], py[j]);
            context.stroke();
          }
        }
      }
      frame = requestAnimationFrame(draw);
    };
    const resume = () => {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };

    seed();
    const resizeObserver = new ResizeObserver(() => seed());
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) resume();
    });
    intersection.observe(canvas);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", invalidate, { passive: true });
    window.addEventListener("resize", invalidate);
    document.addEventListener("visibilitychange", resume);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", invalidate);
      window.removeEventListener("resize", invalidate);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [stage, reduced]);

  if (reduced) return null;
  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-[1] h-full w-full" />;
}
