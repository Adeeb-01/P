import { Reveal } from "@/components/motion/Reveal";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { SERVICES } from "@/lib/services";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { EditorialSplit } from "@/components/motion/EditorialSplit";

export function Services() {
  return (
    <section aria-labelledby="services-title" data-telemetry="04 Services" className="flex w-full justify-center bg-canvas pb-[200px] max-xl:pb-20 max-md:pb-16">
      <div className="w-[min(1120px,calc(100%-80px))] max-md:w-[calc(100%-40px)]">
        <Reveal as="header" className="mb-10 grid grid-cols-[40%_60%] items-start max-tab:grid-cols-1 max-tab:gap-4">
          <h2 id="services-title" data-parallax-speed="0.12" className="m-0 scroll-mt-20 text-eyebrow font-normal text-slate">
            <ScrambleText self text="Services" />
          </h2>
          <EditorialSplit
            as="p"
            segments={[
              { text: "Engineering solutions that turn ideas into reliable, scalable products." },
              { text: "I build full-stack and AI-powered systems with clean architecture.", className: "text-fg" },
            ]}
            stagger={0.018}
            className="m-0 max-w-[672px] text-section font-medium text-balance text-slate"
          />
        </Reveal>

        <ServicesGrid services={SERVICES} />
      </div>
    </section>
  );
}
