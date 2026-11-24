import { FaqAccordion } from "@/components/home/FaqAccordion";
import { Shine } from "@/components/motion/Shine";
import { ScrambleText } from "@/components/motion/ScrambleText";

export function FaqSection() {
  return (
    <section aria-labelledby="faq-title" data-telemetry="06 FAQ" className="w-full bg-canvas pt-14 pb-40 max-xl:py-20 max-md:py-16">
      <div className="mx-auto grid w-[min(1128px,calc(100%-80px))] grid-cols-[minmax(0,532px)_minmax(0,548px)] items-start gap-12 max-xl:grid-cols-1 max-xl:gap-[60px] max-md:w-[calc(100%-40px)]">
        <div className="pt-5 max-xl:pt-0">
          <p data-parallax-speed="0.06" className="m-0 flex items-center gap-4 text-btn font-medium text-muted after:h-px after:flex-auto after:bg-[rgb(231,232,233)] after:content-['']">
            <ScrambleText self text="FAQs" />
          </p>
          <h2
            id="faq-title"
            className="m-0 mt-3.5 max-w-[520px] scroll-mt-20 text-section font-medium text-fg max-xl:max-w-[620px] max-xl:text-[32px] max-xl:leading-[35.2px] max-xl:tracking-[-0.96px]"
          >
            <span className="text-muted">Answers to common questions to help you understand </span>
            the process and how we can work together
          </h2>
          <a
            href="mailto:adeeb2002alsalh@gmail.com"
            className="group/btn relative isolate mt-7 inline-flex h-12 overflow-hidden w-auto min-w-[108px] cursor-pointer items-center justify-center rounded-2xl border-0 bg-inverse px-6 py-3 text-btn-sm font-medium whitespace-nowrap text-on-inverse shadow-button transition-[background-color,box-shadow] duration-200 ease-out hover:bg-violet hover:text-white hover:shadow-violet active:bg-violet active:text-white active:shadow-violet active:scale-[0.97] max-xl:text-btn motion-reduce:transition-none"
          >
            <Shine />
            Email Me
          </a>
        </div>

        <div aria-label="Frequently asked questions" className="min-w-0 rounded-3xl bg-surface px-2 pt-6 pb-2 shadow-faq-shell max-xl:w-full">
          <p className="mx-auto mt-0 mb-5 flex min-h-[34px] w-max items-center justify-center rounded-[15px] bg-inverse px-3.5 py-[7px] text-[13px] leading-[18.2px] font-medium tracking-[-0.39px] text-on-inverse shadow-pill">
            I&apos;m here to help you
          </p>
          <FaqAccordion />
        </div>
      </div>
    </section>
  );
}
