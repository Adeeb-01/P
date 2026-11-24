"use client";

import { useEffect, useRef, type RefObject } from "react";
import clsx from "clsx";
import { imageFx } from "@/lib/image-fx";
import { useMobileGpu, usePrefersReducedMotion } from "@/components/motion/hooks";

const DPR_CAP = 1.5;
const IDLE = 0.008;

/**
 * Liquid ripple + chromatic aberration over a project image, driven by pointer and scroll velocity.
 * Rendering goes through the single shared WebGL context (lib/image-fx) into this 2D canvas, only
 * while the effect has energy; at rest the canvas fades out and the crisp <img> underneath shows.
 * Touch impulses and native scroll velocity share the same bounded energy budget.
 */
export function WebGLImagePlane({ src, hostRef, className }: { src: string; hostRef: RefObject<HTMLElement | null>; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const enabled = !usePrefersReducedMotion();
  const mobile = useMobileGpu();

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = hostRef.current;
    if (!enabled || !canvas || !host) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;
    const fx = imageFx();

    let entry: Awaited<ReturnType<typeof fx.load>> = null;
    let loading = false;
    let visible = false;
    let frame = 0;
    let active = false;
    let disposed = false;
    let lastFrame = performance.now();
    let energy = 0;
    let scroll = 0;
    let scrollTarget = 0;
    const start = performance.now();
    const mouse = { x: 0.5, y: 0.5, lastX: -1, lastY: -1, lastT: 0 };
    let rect: DOMRect | null = null;

    const resize = () => {
      const dpr = mobile ? 0.75 : Math.min(window.devicePixelRatio || 1, DPR_CAP);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      if (active) {
        active = false;
        canvas.style.opacity = "0";
      }
    };

    const tick = (now: number) => {
      frame = 0;
      if (!visible || document.hidden || !entry) {
        stop();
        return;
      }
      const dt = Math.min(50, now - lastFrame) / 16.667;
      lastFrame = now;
      energy *= Math.pow(0.94, dt);
      scroll += (scrollTarget - scroll) * 0.15;
      scrollTarget *= Math.pow(0.86, dt);
      if (energy + scroll < IDLE) {
        stop();
        return;
      }
      const drawn = fx.draw(context, entry, {
        width: canvas.width,
        height: canvas.height,
        time: (now - start) / 1000,
        energy: Math.min(energy, 1),
        scroll: Math.min(scroll, 1),
        mouseX: mouse.x,
        mouseY: mouse.y,
      });
      if (!drawn) {
        stop();
        entry = null;
        ensureTexture();
        return;
      }
      if (drawn && !active) {
        active = true;
        canvas.style.opacity = "1";
      }
      frame = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!frame && visible && entry && !document.hidden && !disposed) { lastFrame = performance.now(); frame = requestAnimationFrame(tick); }
    };

    const ensureTexture = () => {
      if (entry || loading) return;
      loading = true;
      void fx.load(src).then((result) => {
        if (disposed) return;
        entry = result;
        loading = false;
        if (energy + scrollTarget > IDLE) kick();
      });
    };

    const onMove = (event: PointerEvent) => {
      rect ??= host.getBoundingClientRect(); // cached: invalidated on leave/scroll/resize
      const x = (event.clientX - rect.left) / rect.width;
      const y = 1 - (event.clientY - rect.top) / rect.height;
      const now = performance.now();
      if (mouse.lastX >= 0) {
        const dt = Math.max(now - mouse.lastT, 8) / 1000;
        const speed = Math.hypot(x - mouse.lastX, y - mouse.lastY) / dt; // plane-widths per second
        energy = Math.min(1.2, energy + speed * 0.05);
      }
      mouse.x = x;
      mouse.y = y;
      mouse.lastX = x;
      mouse.lastY = y;
      mouse.lastT = now;
      kick();
    };
    const onLeave = () => {
      rect = null;
      mouse.lastX = -1;
    };
    const onDown = (event: PointerEvent) => {
      onMove(event);
      energy = 0.7;
      ensureTexture();
      kick();
    };
    const onVisibility = () => { if (document.hidden) stop(); else kick(); };

    let lastScrollY = window.scrollY;
    let lastScrollT = performance.now();
    const onScroll = () => {
      rect = null;
      const now = performance.now();
      const velocity = ((window.scrollY - lastScrollY) / Math.max(now - lastScrollT, 8)) * 1000;
      lastScrollY = window.scrollY;
      lastScrollT = now;
      if (!visible) return;
      scrollTarget = Math.max(scrollTarget, Math.min(Math.abs(velocity) / 2600, 1));
      if (scrollTarget > 0.04) kick();
    };
    const onResize = () => {
      rect = null;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver(([item]) => {
      visible = item.isIntersecting;
      if (visible) ensureTexture();
      else stop();
    });
    intersection.observe(canvas);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerdown", onDown, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      stop();
      resizeObserver.disconnect();
      intersection.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, hostRef, src, mobile]);

  if (!enabled) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-image-fx
      className={clsx("pointer-events-none absolute inset-0 h-full w-full opacity-0 transition-opacity duration-300 ease-out", className)}
    />
  );
}
