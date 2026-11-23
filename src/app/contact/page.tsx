import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { ClosingSection } from "@/components/ClosingSection";

export const metadata: Metadata = {
  title: "Contact — Mohammad Adeeb Alsaleh",
};

export default function ContactPage() {
  return (
    <>
      <main className="w-full overflow-hidden pt-40 pb-[200px] max-md:pt-[120px] max-md:pb-[100px]">
        <div className="mx-auto flex w-[min(900px,calc(100%-80px))] flex-col items-center gap-[60px] max-md:w-[calc(100%-40px)] max-md:gap-10">
          <h1 className="m-0 w-full max-w-[500px] text-center text-[40px] leading-[1.1] font-medium tracking-[-0.03em] max-md:text-[32px]">
            <span className="text-slate">Have a project or role in mind?</span> let’s talk!
          </h1>
          <div className="flex w-full items-stretch gap-3 max-md:flex-col">
            <ContactForm />
            <aside className="flex min-h-full w-px flex-[1_0_0] flex-col justify-between overflow-hidden rounded-3xl bg-surface p-6 max-md:min-h-0 max-md:w-full max-md:flex-none max-md:gap-10 max-md:p-5">
              <div className="flex flex-col gap-10">
                {/* Monogram (replaces the template's stock avatar photo). */}
                <span
                  aria-hidden="true"
                  className="grid h-20 w-20 place-items-center rounded-2xl bg-[linear-gradient(135deg,#7430F7,#B79CFF)] text-[28px] font-medium tracking-[-0.04em] text-white"
                >
                  AA
                </span>
                <p className="m-0 text-[20px] leading-[1.3] font-medium tracking-[-0.03em] text-fg-soft">
                  Prefer a quick chat?
                  <span className="text-slate"> Message me on WhatsApp or reach out by email — I usually reply within 24 hours.</span>
                </p>
              </div>
              <div className="flex w-full flex-col items-end gap-2.5">
                <a href="tel:+963996536128" className="rounded-[100px] border border-surface bg-elevated px-2.5 py-[5px] text-small text-slate hover:text-fg">
                  +963 996 536 128
                </a>
                <a
                  href="mailto:adeeb2002alsalh@gmail.com"
                  className="text-small text-slate underline-offset-4 hover:text-fg hover:underline"
                >
                  adeeb2002alsalh@gmail.com
                </a>
                <a
                  href="https://wa.me/963996536128"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-[10px] border border-line bg-transparent px-6 py-3 text-btn font-medium text-fg shadow-none transition-[background-color,border-color] duration-[220ms] ease-out hover:bg-elevated hover:text-fg active:border-muted"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <ClosingSection />
    </>
  );
}
