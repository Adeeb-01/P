import { WorkflowTimeline, type WorkflowStep } from "@/components/home/WorkflowTimeline";
import { Reveal } from "@/components/motion/Reveal";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { EditorialSplit } from "@/components/motion/EditorialSplit";

const STEPS: WorkflowStep[] = [
  {
    key: "requirements",
    title: "Requirements & Spec Analysis",
    description: "Defining system architecture, user flows, and technical specifications before a single line of code is written.",
  },
  {
    key: "database-api",
    title: "Database & API Design",
    description: "Modeling data schemas in MongoDB/MySQL and building clean, secure RESTful endpoints.",
  },
  {
    key: "frontend-ai",
    title: "Frontend & AI Implementation",
    description: "Crafting responsive Next.js/React interfaces and integrating LLM/RAG capabilities where they add real value.",
  },
  {
    key: "testing-docs",
    title: "Testing & Documentation",
    description: "End-to-end verification, performance tuning, and clear technical documentation for a smooth handoff.",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="workflow-title" data-telemetry="05 Process" className="w-full bg-canvas pb-32 max-xl:pb-0">
      <div className="w-full overflow-hidden rounded-5xl border border-transparent bg-ink dark:border-white/[0.07] bg-[url('/assets/images/framerusercontent.com/WjZVYjfVNTdo9UKicX5AdploJGc-a96cff631d.webp')] bg-cover bg-center px-10 py-[150px] max-md:px-5 max-md:py-[100px]">
        <div className="mx-auto w-[min(1120px,100%)] max-xl:w-full">
          <Reveal as="header" className="mb-20 grid grid-cols-[40%_60%] items-start gap-0 max-xl:mb-[60px] max-xl:grid-cols-1 max-xl:gap-8 max-md:gap-5">
            <h2 id="workflow-title" data-parallax-speed="0.1" className="m-0 scroll-mt-20 text-eyebrow font-normal text-slate">
              <ScrambleText self text="How it works" />
            </h2>
            <EditorialSplit
              as="p"
              segments={[
                { text: "A spec-driven engineering workflow from idea to production.", className: "text-white" },
                { text: "Every step is defined, tested, and documented for clarity and reliability." },
              ]}
              stagger={0.018}
              className="m-0 max-w-[672px] text-section font-medium text-balance text-slate max-tab:max-w-[620px] max-tab:text-[32px] max-tab:leading-[38.4px]"
            />
          </Reveal>

          <WorkflowTimeline steps={STEPS} />
        </div>
      </div>
    </section>
  );
}
