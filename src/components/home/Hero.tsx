"use client";

import { useEffect, useRef, useState } from "react";
import { m, useScroll, useTransform, type Variants } from "motion/react";
import clsx from "clsx";
import { useMagnetic } from "@/components/motion/hooks";
import { HeroAura } from "@/components/hero/HeroAura";
import { PortraitSheen } from "@/components/hero/PortraitSheen";
import { Shine } from "@/components/motion/Shine";

const PORTRAIT = "/assets/images/framerusercontent.com/yHECzzvtCQT7X8sGipPGW5sEc-f4fe77a16e.webp";

const fade = "max-tab:transition-none motion-reduce:duration-[0.01ms]";
const EASE = [0.22, 1, 0.36, 1] as const;

const HEADLINE = ["Carter is solving problems", "through strategic design and", "compelling visuals"];

const word: Variants = {
  hidden: { y: "110%" },
  show: (delay: number) => ({ y: "0%", transition: { duration: 0.9, ease: EASE, delay } }),
};

function EmailCta() {
  const magnetic = useMagnetic(0.35);
  return (
    <m.a
      href="mailto:rosyidqoim@gmail.com"
      style={{ x: magnetic.x, y: magnetic.y }}
      onPointerMove={magnetic.onPointerMove}
      onPointerLeave={magnetic.onPointerLeave}
      whileTap={{ scale: 0.97 }}
      className="group/btn relative isolate inline-flex h-9 w-24 overflow-hidden cursor-pointer items-center justify-center rounded-xl border-0 bg-inverse px-4 py-2 text-btn-sm font-medium whitespace-nowrap text-on-inverse shadow-button-sm transition-[background-color,box-shadow] duration-200 ease-out hover:bg-violet hover:text-white hover:shadow-violet active:bg-violet active:text-white active:shadow-violet max-xl:h-12 max-xl:w-[112.391px] max-xl:rounded-2xl max-xl:px-6 max-xl:py-3 max-xl:text-btn max-xl:shadow-button"
    >
      <Shine />
      Email Me
    </m.a>
  );
}

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);

  // Scroll parallax: the portrait sinks slightly slower than the page, the glow drifts further.
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 180]);

  // Hold the hidden state until the portrait is decoded (capped at 1.2s) so the fade never starts on an empty image.
  useEffect(() => {
    const image = portraitRef.current;
    if (!image) return;
    let cancelled = false;
    let frame = 0;
    const decoded = image.decode ? image.decode().catch(() => undefined) : Promise.resolve();
    let capTimer = 0;
    const cap = new Promise<void>((resolve) => {
      capTimer = window.setTimeout(resolve, 1200);
    });
    Promise.race([decoded, cap]).then(() => {
      if (cancelled) return;
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setReady(true));
      });
    });
    return () => {
      cancelled = true;
      window.clearTimeout(capTimer);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      ref={heroRef}
      id="hero"
      className="relative h-screen scroll-mt-20 overflow-hidden bg-canvas max-xl:flex max-xl:h-auto max-xl:min-h-0 max-xl:flex-col max-xl:justify-start"
    >
      {/* Ambient violet glow floating behind the portrait. */}
      <m.div aria-hidden="true" style={{ y: glowY }} className="pointer-events-none absolute inset-x-0 top-[6%] z-0 grid place-items-center max-xl:top-[34%]">
        <m.div
          className="[grid-area:1/1] h-[min(720px,90vw)] w-[min(720px,90vw)] rounded-full bg-[radial-gradient(closest-side,rgba(116,48,247,0.16),rgba(116,48,247,0.05)_55%,transparent)]"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={ready ? { opacity: 1, scale: [1, 1.08, 1], x: [0, 24, -16, 0], y: [0, -18, 10, 0] } : { opacity: 0 }}
          transition={{
            opacity: { duration: 1.6, ease: EASE },
            scale: { duration: 14, repeat: Infinity, ease: "easeInOut" },
            x: { duration: 18, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 16, repeat: Infinity, ease: "easeInOut" },
          }}
        />
        {/* WebGL liquid aura (pointer-reactive), layered over the CSS glow fallback. */}
        <m.div
          className="[grid-area:1/1]"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 1.8, ease: EASE }}
        >
          <HeroAura pointerRoot={heroRef} className="block h-[min(960px,120vw)] w-[min(1100px,130vw)]" />
        </m.div>
      </m.div>

      <m.div
        style={{ y: portraitY }}
        className={clsx(
          "absolute top-[88px] left-1/2 z-[1] block aspect-[1242/986] h-[calc(100%-26px)] w-auto max-w-none -translate-x-1/2",
          "max-xl:relative max-xl:inset-auto max-xl:order-1 max-xl:mx-auto max-xl:h-auto max-xl:w-[719px] max-xl:flex-none max-xl:translate-x-0",
          "max-md:mt-[23px] max-md:-mb-[10px] max-md:w-[clamp(564px,92vw,719px)]",
          "transition-opacity duration-[650ms] ease-standard",
          fade,
          ready ? "opacity-100" : "opacity-0",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- exact intrinsic sizing is required for pixel parity */}
        <img ref={portraitRef} src={PORTRAIT} width={1242} height={986} alt="Michael Carter, Digital Product Designer" className="block h-full w-full" />
        <PortraitSheen src={PORTRAIT} pointerRoot={heroRef} />
      </m.div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] hidden h-[220px] overflow-hidden bg-[linear-gradient(to_bottom,transparent_55%,color-mix(in_srgb,var(--theme-canvas)_14%,transparent)_100%)] backdrop-blur-[8px] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.18)_38%,rgb(0,0,0)_100%)] [mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.18)_38%,rgb(0,0,0)_100%)] xl:block"
      />

      {/* Dark theme only: side vignette over the lower portrait so light copy never sits on the white shirt. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] hidden h-[58%] bg-[linear-gradient(90deg,var(--theme-canvas)_0%,var(--theme-canvas)_18%,color-mix(in_srgb,var(--theme-canvas)_70%,transparent)_33%,transparent_46%,transparent_60%,color-mix(in_srgb,var(--theme-canvas)_70%,transparent)_70%,var(--theme-canvas)_84%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,#000_42%)] [mask-image:linear-gradient(to_bottom,transparent,#000_42%)] dark:xl:block"
      />

      <div className="absolute inset-x-0 bottom-0 z-[3] flex h-[350px] items-center justify-center px-10 max-xl:relative max-xl:inset-auto max-xl:order-none max-xl:block max-xl:h-auto max-xl:w-full max-xl:pt-[120px] max-md:px-5">
        <div className="flex h-[350px] w-full max-w-[1440px] items-center justify-between pb-14 max-xl:block max-xl:h-auto max-xl:max-w-[520px] max-xl:p-0 max-md:max-w-none">
          <div
            className={clsx(
              "flex w-[600px] flex-col items-start justify-end gap-4 self-stretch max-xl:block max-xl:h-auto max-xl:w-full",
              "transition-opacity delay-150 duration-[450ms] ease-standard",
              fade,
              ready ? "opacity-100" : "opacity-0",
            )}
          >
            <div className="inline-flex items-center justify-center gap-2.5 rounded-[100px] text-body font-normal whitespace-nowrap text-muted max-xl:mb-4 max-xl:h-[32.406px] max-xl:gap-3 max-xl:border max-xl:border-surface max-xl:bg-canvas max-xl:px-2.5 max-xl:py-[5px]">
              <span aria-hidden="true" className="relative flex h-1.5 w-1.5 flex-none max-xl:h-2.5 max-xl:w-2.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-green opacity-60 motion-reduce:animate-none" />
                <span className="relative h-full w-full rounded-full bg-green" />
              </span>
              <span>2 projects left in March</span>
            </div>
            {/* Masked reveal: each word rises from behind its own clip; lines stagger on desktop. */}
            <m.h1
              initial="hidden"
              animate={ready ? "show" : "hidden"}
              className="m-0 w-[600px] text-[36px] leading-[39.6px] font-medium tracking-[-1.08px] text-fg max-xl:w-full max-xl:text-[32px] max-xl:leading-[35.2px] max-xl:tracking-[-0.96px]"
            >
              {HEADLINE.map((line, lineIndex) => (
                <span key={line} className="block max-xl:inline">
                  {line.split(" ").map((text, index, words) => {
                    const delay = 0.12 + lineIndex * 0.1 + index * 0.035;
                    return (
                      <span key={`${lineIndex}-${index}`}>
                        <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-top">
                          <m.span className="inline-block will-change-transform" variants={word} custom={delay}>
                            {text}
                          </m.span>
                        </span>
                        {index < words.length - 1 || lineIndex < HEADLINE.length - 1 ? " " : ""}
                      </span>
                    );
                  })}
                </span>
              ))}
            </m.h1>
          </div>

          <div
            className={clsx(
              "flex w-[400px] -translate-y-2.5 flex-col items-start gap-6 max-xl:mt-4 max-xl:w-full max-xl:translate-y-0 max-xl:gap-8",
              "transition-opacity delay-[210ms] duration-[450ms] ease-standard",
              fade,
              ready ? "opacity-100" : "opacity-0",
            )}
          >
            <p className="m-0 w-[400px] text-body font-normal text-fg-soft max-xl:w-full">
              As a digital product designer with a strong focus on visual design and Framer websites, he collaborates closely with teams to craft seamless, user-centered experiences. A reliable partner in bringing ideas to life
            </p>
            <EmailCta />
          </div>
        </div>
      </div>
    </header>
  );
}
