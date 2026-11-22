/* eslint-disable @next/next/no-img-element -- fixed-size decorative imagery mirrors the original markup */
import clsx from "clsx";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { Reveal } from "@/components/motion/Reveal";
import { StatsCard } from "@/components/home/StatsCard";

const IMG = "/assets/images/framerusercontent.com";
const card = "relative h-[450px] min-w-0 overflow-hidden rounded-5xl max-md:w-full";

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className}>
      <path d="M5.5 14.5 14.5 5.5M7 5.5h7.5V13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SocialProof() {
  return (
    <section aria-label="Social proof and client trust" className="flex w-full justify-center bg-canvas pb-[200px] max-md:py-[100px]">
      <Reveal className="grid w-[min(1128px,calc(100%-80px))] grid-cols-[minmax(0,32fr)_minmax(0,38fr)_minmax(0,30fr)] items-start gap-3 max-md:w-[calc(100%-40px)] max-md:grid-cols-1">
        {/* Awwwards */}
        <SpotlightCard className={clsx(card, "bg-surface p-6")}>
          <div className="flex h-8 items-center gap-3.5" aria-hidden="true">
            <span className="text-[30px] leading-8 font-bold tracking-[-1.2px] text-fg">W.</span>
            <svg className="h-[26px] w-[26px] text-gold" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="12" r="7.5" stroke="currentColor" strokeWidth="2" />
              <circle cx="15" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="m10.8 17.9-1.2 8 5.4-3.4 5.4 3.4-1.2-8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="mt-[18px]">
            <h2 className="m-0 mb-2 text-card font-medium text-fg">Awwwards Nominee</h2>
            <p className="m-0 text-body text-muted">Recognized for excellence in web design and innovative digital experiences.</p>
          </div>
          <a
            href="https://planza.framer.website/"
            target="_blank"
            rel="noopener"
            aria-label="View the Planza website"
            className="absolute top-[194px] right-6 bottom-6 left-6 z-[1] overflow-hidden rounded-lg text-ink"
          >
            <img
              src={`${IMG}/G5V2BfFS1k2hTxiBqkphqzLkVNc-ef904a3db7.webp`}
              width={710}
              height={1040}
              alt="Planza event website recognized by Awwwards"
              className="block h-full w-full object-cover object-top"
            />
            <span aria-hidden="true" className="absolute top-5 right-5 grid h-10 w-10 place-items-center rounded-xl bg-white/72 shadow-award-icon">
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </a>
        </SpotlightCard>

        {/* Testimonial */}
        <SpotlightCard tone="dark" className={clsx(card, "z-[1] flex flex-col justify-between bg-ink p-6 text-white shadow-testimonial dark:ring-1 dark:ring-white/[0.08]")}>
          <div className="flex flex-col gap-3.5">
            <svg className="h-[34px] w-[34px] text-slate/72" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <path d="M7 11h10v10.5c0 5.8-3.2 9.5-9 11.5M23 11h10v10.5c0 5.8-3.2 9.5-9 11.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <blockquote className="m-0 max-w-[360px] text-card font-normal">
              Carter&apos;s design expertise goes beyond aesthetics—he crafts experiences that truly connect with users. A great collaborator and a problem-solver at heart
            </blockquote>
          </div>
          <div className="flex items-center gap-2.5">
            <img
              src={`${IMG}/Ao32K3WgpeBMCWzE9i3TNoG2Yc-d3e54753e3.png`}
              width={512}
              height={512}
              alt="Samantha, Founder at NexaTech"
              className="h-9 w-9 flex-none rounded-lg object-cover"
            />
            <div className="flex flex-col">
              <p className="m-0 text-[16px] leading-[20.8px] tracking-[-0.42px] text-white">Samantha</p>
              <p className="m-0 text-credit text-line">Founder at NexaTech</p>
            </div>
          </div>
        </SpotlightCard>

        {/* Stats: hover / focus reveals the stacked stats and "Trusted by many" pill */}
        <StatsCard />
      </Reveal>
    </section>
  );
}
