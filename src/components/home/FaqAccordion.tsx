"use client";

import { useId, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import clsx from "clsx";

const FAQS = [
  {
    key: "stack",
    question: "What's your core tech stack?",
    answer:
      "I work across the MERN stack — MongoDB, Express.js, React and Node.js — with Next.js and TypeScript on the frontend, Python for AI tooling, and MySQL or MongoDB depending on the data model.",
  },
  {
    key: "ai",
    question: "Can you integrate AI into an existing product?",
    answer:
      "Yes. I integrate LLM APIs and build Retrieval-Augmented Generation (RAG) pipelines with VectorDB semantic search, so answers stay grounded in your own data — connected to your platform through clean, documented APIs.",
  },
  {
    key: "workflow",
    question: "What does your development process look like?",
    answer:
      "It's spec-driven: requirements and architecture first, then database and API design, frontend and AI implementation, and finally testing and documentation — so every stage is clear and reviewable.",
  },
  {
    key: "availability",
    question: "Are you available for freelance or full-time roles?",
    answer: "Yes — I'm open to both freelance projects and full-time software engineering roles, working remotely or from Damascus, Syria.",
  },
  {
    key: "contact",
    question: "What's the best way to reach you?",
    answer: "Email me at adeeb2002alsalh@gmail.com or message me on WhatsApp at +963 996 536 128. You can also browse my code on GitHub at github.com/Adeeb-01.",
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
