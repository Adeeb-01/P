"use client";

import { useId, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import clsx from "clsx";

const FAQS = [
  {
    key: "timeline",
    question: "What's your typical project timeline?",
    answer:
      "The timeline depends on the project's scope and complexity. Branding and UI/UX projects usually take 2–6 weeks, while Framer website development can range from 1–4 weeks. I'll provide a detailed timeline after the project brief",
  },
  {
    key: "revisions",
    question: "Do you offer revisions?",
    answer:
      "Yes! I believe in collaboration and refining the work to match your vision. Each project includes a set number of revision rounds, which we'll define in the project scope",
  },
  {
    key: "get-started",
    question: "What do you need from me to get started?",
    answer:
      "To kick things off, I'll need details about your business, goals, and any references or inspirations you have in mind. If it's a UI/UX or Framer project, wireframes or content assets would also be helpful",
  },
  {
    key: "brand-guidelines",
    question: "Can you work with my existing brand guidelines?",
    answer:
      "Absolutely! If you already have brand guidelines, I'll ensure the designs align with your established identity while still bringing fresh creativity to the project",
  },
  {
    key: "support",
    question: "Do you provide post-project support?",
    answer:
      "Yes! I offer support after project completion to ensure a smooth transition. For Framer websites, I provide guidance on managing content, and for branding/UI work, I can assist with additional assets if needed",
  },
  {
    key: "contact",
    question: "What's the best way to reach you?",
    answer:
      "You can reach me via email or book a call through my website. I aim to respond within 24 hours on weekdays. Let's chat about your project!",
  },
];

const PANEL_SPRING = { type: "spring", stiffness: 260, damping: 32, mass: 0.9 } as const;

/** Single-open accordion: spring height + fading answer, and a "+" that springs into "×". */
export function FaqAccordion() {
  const [active, setActive] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="grid gap-2">
      {FAQS.map((faq, index) => {
        const open = active === index;
        const buttonId = `${baseId}-q${index}`;
        const panelId = `${baseId}-a${index}`;
        return (
          <div key={faq.key} className="overflow-hidden rounded-[18px] bg-elevated">
            <h3 className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setActive(open ? null : index)}
                className={clsx(
                  "flex min-h-16 w-full cursor-pointer items-center justify-between gap-5 border-0 bg-transparent p-5 text-left text-eyebrow font-medium text-fg",
                  "transition-colors duration-[180ms] ease-out focus-visible:rounded-[18px] focus-visible:-outline-offset-3 motion-reduce:transition-none",
                  "max-md:min-h-[60px] max-md:gap-4 max-md:p-4",
                  !open && "hover:bg-surface-hover",
                )}
              >
                {faq.question}
                <m.span
                  aria-hidden="true"
                  initial={false}
                  animate={{ rotate: open ? 135 : 0, scale: open ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 22 }}
                  className={clsx(
                    "relative h-3.5 w-3.5 flex-none xl:h-4 xl:w-4",
                    open ? "text-violet" : "text-muted",
                    "transition-colors duration-200",
                    "before:absolute before:top-[6.375px] before:left-0.5 before:h-[1.25px] before:w-2.5 before:rounded-[1px] before:bg-current before:content-[''] xl:before:top-[7.375px] xl:before:w-3",
                    "after:absolute after:top-[6.375px] after:left-0.5 after:h-[1.25px] after:w-2.5 after:rounded-[1px] after:bg-current after:[transform:rotate(90deg)] after:content-[''] xl:after:top-[7.375px] xl:after:w-3",
                  )}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {open && (
                <m.div
                  key="panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0 }}
                  animate={{ height: "auto", transition: PANEL_SPRING }}
                  exit={{ height: 0, transition: { ...PANEL_SPRING, stiffness: 320 } }}
                  className="overflow-hidden"
                >
                  <m.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.28, delay: 0.06, ease: "easeOut" } }}
                    exit={{ opacity: 0, y: -4, transition: { duration: 0.16, ease: "easeOut" } }}
                    className="m-0 max-w-[62ch] px-5 pb-5 text-body font-normal text-muted max-md:px-4 max-md:pb-[18px]"
                  >
                    {faq.answer}
                  </m.p>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
