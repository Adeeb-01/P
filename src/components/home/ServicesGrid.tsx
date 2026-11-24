"use client";

/* eslint-disable @next/next/no-img-element -- fixed-size previews and icons mirror the original markup */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import clsx from "clsx";
import { RefractiveCard } from "@/components/motion/RefractiveCard";
import { Reveal } from "@/components/motion/Reveal";
import { Shine } from "@/components/motion/Shine";
import { useLenis } from "@/components/motion/SmoothScroll";
import { ServiceDiagram } from "@/components/home/ServiceDiagrams";
import { CONTACT_EMAIL, type Service } from "@/lib/services";
import { Portal } from "@/components/Portal";

const SHELL_SPRING = { type: "spring", stiffness: 300, damping: 34, mass: 0.9 } as const;
const shellId = (key: string) => `service-shell-${key}`;

function ServiceCard({ service, hidden, onOpen }: { service: Service; hidden: boolean; onOpen: (button: HTMLButtonElement) => void }) {
  const p = service.prominent;
  const text = p ? "text-white" : "text-fg";
  const panel = p ? "bg-violet" : "bg-elevated";

  return (
    <RefractiveCard
      tone={p ? "dark" : "light"}
      data-cursor="explore"
      className={clsx(
        "group relative isolate flex h-full min-h-[466px] min-w-0 cursor-pointer flex-col gap-1.5 rounded-3xl p-1.5 max-xl:min-h-[390px]",
        "hover-fine:transition-shadow hover-fine:duration-[260ms] hover-fine:ease-out",
        p ? "z-[1] shadow-prominent hover-fine:hover:shadow-prominent-hover" : "shadow-service hover-fine:hover:shadow-service-hover",
        hidden && "pointer-events-none opacity-0",
      )}
    >
      {/* Shared-element background: morphs into the detail panel on open. */}
      {!hidden && (
        <m.span
          layoutId={shellId(service.key)}
          transition={SHELL_SPRING}
          style={{ borderRadius: 24 }}
          className={clsx("absolute inset-0 -z-[1]", p ? "bg-ink dark:ring-1 dark:ring-white/[0.08]" : "bg-surface")}
        />
      )}
      <button
        type="button"
        aria-label={`Open ${service.title} details`}
        aria-haspopup="dialog"
        onClick={(event) => onOpen(event.currentTarget)}
        className="absolute inset-0 z-[1] cursor-pointer rounded-3xl border-0 bg-transparent focus-visible:-outline-offset-4"
      />
      <div className={clsx("flex min-h-14 items-center justify-between gap-3 overflow-hidden rounded-[20px] py-2 pr-2 pl-3", panel)}>
        <div className="h-[26px] min-w-0 flex-auto overflow-hidden">
          <div className="grid transition-transform duration-[420ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] hover-fine:group-hover:[transform:translateY(-26px)] motion-reduce:transition-none">
            <h3 className={clsx("m-0 text-eyebrow leading-[26px] font-medium whitespace-nowrap", text)}>{service.title}</h3>
            <span className={clsx("m-0 flex min-h-[26px] items-center gap-[7px] text-eyebrow leading-[26px] font-medium whitespace-nowrap", text)}>
              Explore service
              <svg viewBox="0 0 18 18" aria-hidden="true" className="h-4 w-4 flex-none">
                <path d="M4 9h9M9.5 5.5 13 9l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
        <span aria-hidden="true" className={clsx("grid h-10 w-10 flex-none place-items-center rounded-xl p-2", service.icon.tile)}>
          <img src={service.icon.src} alt="" className={clsx("block h-6 w-6 object-contain", service.icon.filter)} />
        </span>
      </div>

      <div
        className={clsx(
          "flex min-h-0 flex-auto flex-col gap-4 overflow-hidden rounded-[20px] p-6",
          "hover-fine:transition-opacity hover-fine:duration-[260ms] hover-fine:ease-out hover-fine:group-hover:opacity-30",
          panel,
        )}
      >
        <p className={clsx("m-0 text-small font-normal", p ? "text-light" : "text-slate")}>{service.description}</p>
        <div className="grid grid-cols-3 gap-1" aria-label={`${service.title} examples`}>
          {service.previews.map((preview) => (
            <div key={preview.src} className="aspect-square min-w-0 overflow-hidden rounded-xl">
              <img src={preview.src} width={preview.width} height={preview.height} alt={preview.alt} className="block h-full w-full object-cover object-center" />
            </div>
          ))}
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-2" aria-label={`${service.title} services`}>
          {service.tags.map((tag) => (
            <span
              key={tag}
              className={clsx(
                "inline-flex min-h-[30px] items-center rounded-xl px-2.5 py-1.5 text-[13px] leading-[18px] font-normal tracking-[-0.26px] whitespace-nowrap",
                p ? "border border-white/40 bg-transparent text-white" : "bg-surface text-fg-soft",
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </RefractiveCard>
  );
}

function ServiceDetail({ service, onClose }: { service: Service; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const p = service.prominent;

  useEffect(() => {
    const id = requestAnimationFrame(() => closeRef.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div data-lenis-prevent className="fixed inset-0 z-[75] flex items-center-safe justify-center overflow-y-auto p-4">
      <m.button
        type="button"
        tabIndex={-1}
        aria-label="Close details"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 cursor-default border-0 bg-ink/35 backdrop-blur-[6px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${service.key}-detail-title`}
        className="relative isolate my-auto w-full max-w-[920px] rounded-[32px] p-8 max-md:p-5"
      >
        <m.span
          layoutId={shellId(service.key)}
          transition={SHELL_SPRING}
          style={{ borderRadius: 32 }}
          className={clsx("absolute inset-0 -z-[1] shadow-[0_50px_100px_-40px_rgba(17,17,17,0.6)]", p ? "bg-ink dark:ring-1 dark:ring-white/[0.08]" : "bg-surface")}
        />
        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.18, duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, y: 8, transition: { duration: 0.12 } }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className={clsx("grid h-12 w-12 place-items-center rounded-2xl p-2", service.icon.tile)}>
                <img src={service.icon.src} alt="" className={clsx("block h-7 w-7 object-contain", service.icon.filter)} />
              </span>
              <h3 id={`${service.key}-detail-title`} className={clsx("m-0 text-[36px] leading-[1.1] font-medium tracking-[-1.2px] max-md:text-[28px]", p ? "text-white" : "text-fg")}>
                {service.title}
              </h3>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={clsx("grid h-11 w-11 flex-none cursor-pointer place-items-center rounded-full border-0 transition-colors active:scale-95", p ? "bg-white/10 text-white hover:bg-white/20" : "bg-elevated text-fg hover:bg-surface-hover")}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
                <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <p className={clsx("m-0 mt-5 max-w-[640px] text-body", p ? "text-light" : "text-fg-soft")}>{service.description}</p>

          <div className="mt-7">
            <ServiceDiagram serviceKey={service.key} />
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {service.tags.map((tag) => (
                <span key={tag} className={clsx("rounded-xl px-3 py-2 text-[13px] leading-none", p ? "border border-white/25 text-white" : "bg-elevated text-fg-soft")}>
                  {tag}
                </span>
              ))}
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${service.subject}`}
              className={clsx(
                "group/btn relative isolate inline-flex h-12 items-center gap-2 overflow-hidden rounded-2xl px-6 text-btn font-medium transition-colors active:scale-[0.97]",
                p ? "bg-white text-ink hover:bg-light" : "bg-inverse text-on-inverse hover:bg-violet hover:text-white",
              )}
            >
              <Shine tone={p ? "dark" : "light"} />
              Start a Project
              <svg viewBox="0 0 18 18" aria-hidden="true" className="h-4 w-4">
                <path d="M4 9h9M9.5 5.5 13 9l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </m.div>
      </div>
    </div>
  );
}

/** Services grid with click-to-expand detail panels (shared-element `layoutId` transition). */
export function ServicesGrid({ services }: { services: Service[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const lenis = useLenis();
  const open = services.find((service) => service.key === openKey) ?? null;

  useEffect(() => {
    if (!openKey) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [openKey, lenis]);

  const close = () => {
    setOpenKey(null);
    requestAnimationFrame(() => returnFocus.current?.focus());
  };

  return (
    <>
      <div className="grid grid-cols-3 items-stretch gap-4 max-xl:grid-cols-2 max-[767.98px]:grid-cols-1">
        {services.map((service, index) => (
          <Reveal key={service.key} delay={index * 0.1} className="min-w-0 max-xl:last:col-span-2 max-[767.98px]:last:col-span-1">
            <ServiceCard
              service={service}
              hidden={openKey === service.key}
              onOpen={(button) => {
                returnFocus.current = button;
                setOpenKey(service.key);
              }}
            />
          </Reveal>
        ))}
      </div>
      <Portal>
        <AnimatePresence>{open && <ServiceDetail key={open.key} service={open} onClose={close} />}</AnimatePresence>
      </Portal>
    </>
  );
}
