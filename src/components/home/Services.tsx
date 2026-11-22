import { Reveal } from "@/components/motion/Reveal";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { SERVICES } from "@/lib/services";
import { ScrambleText } from "@/components/motion/ScrambleText";

export function Services() {
  return (
    <section aria-labelledby="services-title" className="flex w-full justify-center bg-canvas pb-[200px] max-md:pb-[100px]">
      <div className="w-[min(1120px,calc(100%-80px))] max-md:w-[calc(100%-40px)]">
        <Reveal as="header" className="mb-[60px] grid grid-cols-[40%_60%] items-start max-tab:grid-cols-1 max-tab:gap-4">
          <h2 id="services-title" className="m-0 scroll-mt-20 text-eyebrow font-normal text-slate">
            <ScrambleText self text="Services" />
          </h2>
          <p className="m-0 max-w-[672px] text-section font-medium text-balance text-slate">
            Design solutions that elevate brands and create seamless user experiences.{" "}
            <span className="text-fg">I help bring ideas to life with strategy and creativity</span>
          </p>
        </Reveal>

        <ServicesGrid services={SERVICES} />
      </div>
    </section>
  );
}
