/* eslint-disable @next/next/no-img-element -- full-bleed cover with exact aspect */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClosingSection } from "@/components/ClosingSection";
import { Gallery } from "@/components/case-study/Gallery";
import { NextProject } from "@/components/case-study/NextProject";
import { QuickJumpTrigger } from "@/components/works/ProjectQuickJump";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { ClipReveal } from "@/components/motion/ClipReveal";
import { Reveal } from "@/components/motion/Reveal";
import { PROJECTS, getNextProject, getProject } from "@/lib/projects";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Case Study — Mohammad Adeeb Alsaleh`,
    description: project.caseStudy.summary,
    openGraph: { title: `${project.title} — Case Study`, images: [{ url: project.image.src }] },
  };
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="m-0 text-eyebrow font-normal text-slate">{children}</h2>;
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const next = getNextProject(slug);
  const study = project.caseStudy;

  return (
    <>
      <main className="w-full overflow-hidden pt-40 pb-[160px] max-md:pt-[120px] max-md:pb-[100px]">
        <div className="mx-auto flex w-[min(1120px,calc(100%-80px))] flex-col max-md:w-[calc(100%-40px)]">
          {/* Top bar */}
          <div className="mb-14 flex items-center justify-between gap-4 max-md:mb-10">
            <Link href="/works" className="group inline-flex items-center gap-2 text-small font-medium text-fg-soft hover:text-fg">
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1">
                <path d="M4 10h11M11 5.5 15.5 10 11 14.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              All works
            </Link>
            <QuickJumpTrigger className="max-md:hidden" />
          </div>

          <div data-telemetry="01 Overview">
          {/* Hero */}
          <Reveal>
            <p className="m-0 mb-6 inline-flex items-center gap-2 rounded-full bg-violet/10 px-3 py-1.5 text-[13px] leading-none font-medium text-violet">
              <span aria-hidden="true">●</span> <ScrambleText self text={project.tagline} />
            </p>
            <h1 className="m-0 text-[120px] leading-[0.92] font-medium tracking-[-0.055em] text-fg max-xl:text-[88px] max-md:text-[56px]">{project.title}</h1>
            <p className="m-0 mt-8 max-w-[720px] text-[24px] leading-[1.35] tracking-[-0.6px] text-fg-soft max-md:text-[20px]">{study.summary}</p>
          </Reveal>

          <Reveal delay={0.1} className="mt-14 grid grid-cols-3 gap-6 border-t border-fg/[0.08] pt-6 max-md:mt-10 max-md:grid-cols-1">
            {[
              ["Role", study.role],
              ["Type", study.type],
              ["Stack", project.tags.join(", ")],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="m-0 text-credit text-muted">{label}</p>
                <p className="m-0 mt-1.5 text-body text-fg">{value}</p>
              </div>
            ))}
          </Reveal>

          <ClipReveal className="mt-16 max-md:mt-10" fromScale={0.96}>
            <div className="relative aspect-[16/9] overflow-hidden rounded-5xl bg-surface max-md:aspect-[4/3] max-md:rounded-[32px]">
              <img src={project.image.src} alt={project.image.alt} width={project.image.width} height={project.image.height} className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </ClipReveal>
          </div>

          {/* Challenge */}
          <section data-telemetry="02 Challenge" className="mt-[140px] grid grid-cols-[40%_60%] items-start max-xl:grid-cols-1 max-xl:gap-6 max-md:mt-24">
            <SectionLabel>The challenge</SectionLabel>
            <Reveal>
              <p className="m-0 text-section font-medium text-balance text-fg max-tab:text-[28px] max-tab:leading-[1.25]">{study.challenge}</p>
            </Reveal>
          </section>

          {/* Approach */}
          <section data-telemetry="03 Approach" className="mt-[120px] grid grid-cols-[40%_60%] items-start max-xl:grid-cols-1 max-xl:gap-6 max-md:mt-20">
            <SectionLabel>Approach</SectionLabel>
            <ol className="m-0 grid list-none gap-3 p-0">
              {study.approach.map((step, index) => (
                <Reveal as="li" key={step} delay={index * 0.08} className="flex gap-5 rounded-3xl bg-surface p-6">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-ink text-[15px] font-medium text-white tabular-nums">{index + 1}</span>
                  <p className="m-0 pt-2 text-body text-fg-soft">{step}</p>
                </Reveal>
              ))}
            </ol>
          </section>

          {/* Technical highlights */}
          <section data-telemetry="04 Impact" className="mt-[120px] max-md:mt-20" aria-labelledby="metrics-title">
            <div className="mb-8 flex items-baseline justify-between gap-4">
              <h2 id="metrics-title" className="m-0 text-eyebrow font-normal text-slate">
                Impact
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
              {study.metrics.map((metric, index) => (
                <Reveal key={metric.label} delay={index * 0.08} className="rounded-3xl border border-line/70 bg-surface p-8">
                  <p className="m-0 text-[clamp(34px,3.6vw,52px)] leading-none font-medium tracking-[-0.045em] break-words text-fg">{metric.value}</p>
                  <p className="m-0 mt-4 text-body text-muted">{metric.label}</p>
                </Reveal>
              ))}
            </div>
          </section>

          {/* Deliverables */}
          <section className="mt-[120px] grid grid-cols-[40%_60%] items-start max-xl:grid-cols-1 max-xl:gap-6 max-md:mt-20">
            <SectionLabel>Deliverables</SectionLabel>
            <Reveal className="flex flex-wrap gap-2">
              {study.deliverables.map((item) => (
                <span key={item} className="rounded-xl bg-surface px-4 py-2.5 text-body text-fg-soft">
                  {item}
                </span>
              ))}
            </Reveal>
          </section>

          {/* Gallery */}
          <section className="mt-[140px] max-md:mt-24" aria-labelledby="gallery-title">
            <div className="mb-8 flex items-baseline justify-between gap-4">
              <h2 id="gallery-title" className="m-0 text-section font-medium text-fg">
                Details
              </h2>
              <span className="text-credit text-muted">Interface details</span>
            </div>
          </section>
        </div>

        <div data-telemetry="05 Details" className="pl-[max(40px,calc((100%-1120px)/2))] max-md:pl-5">
          <Gallery image={project.image} crops={study.gallery} title={project.title} controlsClassName="pr-[max(40px,calc((100%-1120px)/2))] max-md:pr-5" />
        </div>

        <div data-telemetry="06 Next" className="mx-auto mt-[140px] w-[min(1120px,calc(100%-80px))] max-md:mt-24 max-md:w-[calc(100%-40px)]">
          <NextProject project={next} />
        </div>
      </main>
      <ClosingSection />
    </>
  );
}
