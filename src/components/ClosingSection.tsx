import { Footer } from "@/components/Footer";
import { ClosingStage } from "@/components/closing/ClosingStage";
import { ShaderLab } from "@/components/closing/ShaderLab";
import { ParticleField } from "@/components/closing/ParticleField";
import { MagneticLink } from "@/components/motion/MagneticLink";
import { Reveal } from "@/components/motion/Reveal";
import { Shine } from "@/components/motion/Shine";
import { EditorialSplit } from "@/components/motion/EditorialSplit";

/** Dark closing environment: shader object, final CTA, and the site footer. Shared by every route. */
export function ClosingSection() {
  return (
    <ClosingStage className="relative isolate w-full overflow-hidden rounded-t-5xl bg-ink bg-[url('/assets/images/framerusercontent.com/WjZVYjfVNTdo9UKicX5AdploJGc-a96cff631d.webp')] bg-cover bg-center pt-[176px] pb-[72px] text-white max-xl:pt-[120px] max-xl:pb-[60px] max-tab:pt-[100px] max-[640.98px]:rounded-t-[28px] max-[640.98px]:pt-20 max-[640.98px]:pb-10">
      <ParticleField />
      <section aria-labelledby="closing-cta-title" className="w-full bg-transparent p-0">
        <div className="mx-auto flex w-[min(400px,calc(100%-80px))] flex-col items-center gap-8 text-center max-md:w-[min(400px,calc(100%-40px))]">
          <ShaderLab orbClassName="h-[168px] w-[168px] max-xl:h-[180px] max-xl:w-[180px] max-[640.98px]:h-[160px] max-[640.98px]:w-[140px] max-[640.98px]:[content:url('/assets/images/luzia-purple-shader-object-mobile.png')]" />
          <EditorialSplit
            id="closing-cta-title"
            segments={[{ text: "Have a project in mind?", className: "text-muted" }, { text: "Let's build it together." }]}
            className="m-0 max-w-[400px] scroll-mt-20 text-display font-medium text-balance text-white max-tab:text-[36px] max-tab:leading-[39.6px] max-tab:tracking-[-1.08px] max-md:max-w-[340px] max-md:text-[30px] max-md:leading-[33px] max-md:tracking-[-0.9px]"
          />
          <Reveal delay={0.12}>
            <MagneticLink
              href="/contact"
              strength={0.35}
              className="group/btn relative isolate mt-0 inline-flex h-12 min-w-[126px] overflow-hidden items-center justify-center rounded-2xl bg-white px-6 py-3 text-btn font-medium text-graphite shadow-closing transition-[background-color,box-shadow] duration-200 ease-out hover:bg-light hover:text-ink hover:shadow-closing-hover focus-visible:outline-offset-4 active:bg-light active:text-ink active:shadow-closing-hover motion-reduce:transition-none"
            >
              <Shine tone="dark" />
              Start a Project
            </MagneticLink>
          </Reveal>
        </div>
      </section>
      <Footer />
    </ClosingStage>
  );
}
