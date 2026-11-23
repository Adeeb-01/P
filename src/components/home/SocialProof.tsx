import clsx from "clsx";
import { RefractiveCard } from "@/components/motion/RefractiveCard";
import { Reveal } from "@/components/motion/Reveal";
import { StatsCard } from "@/components/home/StatsCard";

const card = "relative h-[450px] min-w-0 overflow-hidden rounded-5xl max-md:w-full";


export function SocialProof() {
  return (
    <section aria-label="Education, certifications and experience" data-telemetry="03 Proof" className="flex w-full justify-center bg-canvas pb-[200px] max-md:py-[100px]">
      <Reveal className="grid w-[min(1128px,calc(100%-80px))] grid-cols-[minmax(0,32fr)_minmax(0,38fr)_minmax(0,30fr)] items-start gap-3 max-md:w-[calc(100%-40px)] max-md:grid-cols-1">
        {/* Education */}
        <div data-parallax-speed="0.035" className="min-w-0">
        <RefractiveCard className={clsx(card, "flex flex-col bg-surface p-6")}>
          <div className="flex h-8 items-center gap-3.5" aria-hidden="true">
            <span className="text-[30px] leading-8 font-bold tracking-[-1.2px] text-fg">SPU</span>
            <svg className="h-[26px] w-[26px] text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10 12 5 2 10l10 5 10-5Z" />
              <path d="M6 12v5c3 2.5 9 2.5 12 0v-5" />
              <path d="M22 10v6" />
            </svg>
          </div>
          <div className="mt-[18px]">
            <h2 className="m-0 mb-2 text-card font-medium text-fg">B.Sc. in Intelligent Software Engineering</h2>
            <p className="m-0 text-body text-muted">Syrian Private University (SPU)</p>
          </div>
          <div className="relative mt-auto flex flex-col justify-end overflow-hidden rounded-2xl bg-elevated p-5">
            <span className="text-credit text-muted">Class of</span>
            <span className="text-[96px] leading-[0.85] font-medium tracking-[-0.06em] text-fg">2026</span>
            <span aria-hidden="true" className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[radial-gradient(closest-side,rgba(116,48,247,0.22),transparent)]" />
          </div>
        </RefractiveCard>
        </div>

        {/* Certifications & tracks */}
        <RefractiveCard tone="dark" className={clsx(card, "z-[1] flex flex-col justify-between bg-ink p-6 text-white shadow-testimonial dark:ring-1 dark:ring-white/[0.08]")}>
          <div className="flex flex-col gap-3.5">
            <svg className="h-[34px] w-[34px] text-slate/72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="9" r="5.5" />
              <path d="m9 13.8-1.5 7.2L12 18.5l4.5 2.5-1.5-7.2" />
            </svg>
            <h2 className="m-0 max-w-[360px] text-card font-normal">
              JavaScript Fundamentals <span className="text-white/55">— New Horizons</span>
            </h2>
            <p className="m-0 max-w-[360px] text-card font-normal">
              Spec-Driven Full-Stack Development <span className="text-white/55">— engineering track</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-white/10 text-[13px] font-medium">AA</span>
            <div className="flex flex-col">
              <p className="m-0 text-[16px] leading-[20.8px] tracking-[-0.42px] text-white">Certifications &amp; tracks</p>
              <p className="m-0 text-credit text-line">Mohammad Adeeb Alsaleh</p>
            </div>
          </div>
        </RefractiveCard>

        {/* Stats: hover / focus reveals the stacked stats and "Core stack" pill */}
        <div data-parallax-speed="-0.035" className="min-w-0">
          <StatsCard />
        </div>
      </Reveal>
    </section>
  );
}
