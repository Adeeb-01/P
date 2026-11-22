import { WorkflowTimeline, type WorkflowStep } from "@/components/home/WorkflowTimeline";
import { Reveal } from "@/components/motion/Reveal";
import { ScrambleText } from "@/components/motion/ScrambleText";

const STEPS: WorkflowStep[] = [
  {
    key: "book-a-call",
    title: "Book a Call",
    description:
      "Let’s start with a conversation! We’ll discuss your goals, ideas, and how I can help bring them to life. This is where we align expectations and ensure a great fit",
  },
  {
    key: "project-brief",
    title: "Project Brief",
    description:
      "Once we’re on the same page, we’ll define the project scope, timeline, and deliverables. A structured brief ensures a smooth and efficient process",
  },
  {
    key: "develop",
    title: "Develop",
    description:
      "This is where the magic happens! I’ll craft thoughtful designs and refine them based on feedback, ensuring the final outcome meets your vision and goals",
  },
  {
    key: "deliver",
    title: "Deliver",
    description:
      "The final product is polished and ready to go. Whether it’s a brand identity, UI/UX design, or a Framer website, you’ll receive all the necessary files and guidance for a seamless handoff",
  },
  {
    key: "support",
    title: "Support",
    description:
      "Enjoy one month of free support after project delivery. I’ll be available to answer questions, make minor adjustments, and ensure everything runs smoothly",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="workflow-title" className="w-full bg-canvas pb-32 max-xl:pb-0">
      <div className="w-full overflow-hidden rounded-5xl border border-transparent bg-ink dark:border-white/[0.07] bg-[url('/assets/images/framerusercontent.com/WjZVYjfVNTdo9UKicX5AdploJGc-a96cff631d.webp')] bg-cover bg-center px-10 py-[150px] max-md:px-5 max-md:py-[100px]">
        <div className="mx-auto w-[min(1120px,100%)] max-xl:w-full">
          <Reveal as="header" className="mb-20 grid grid-cols-[40%_60%] items-start gap-0 max-xl:mb-[60px] max-xl:grid-cols-1 max-xl:gap-8 max-md:gap-5">
            <h2 id="workflow-title" className="m-0 scroll-mt-20 text-eyebrow font-normal text-slate">
              <ScrambleText self text="How it works" />
            </h2>
            <p className="m-0 max-w-[672px] text-section font-medium text-balance text-slate max-tab:max-w-[620px] max-tab:text-[32px] max-tab:leading-[38.4px]">
              <span className="text-white">A simple and efficient workflow to bring your vision to life. </span>
              From the first call to final delivery, every step is designed for clarity and efficiency.
            </p>
          </Reveal>

          <WorkflowTimeline steps={STEPS} />
        </div>
      </div>
    </section>
  );
}
