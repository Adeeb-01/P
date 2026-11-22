/* eslint-disable @next/next/no-img-element -- 80px avatar mirrors the original markup */
import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { ClosingSection } from "@/components/ClosingSection";

export const metadata: Metadata = {
  title: "Contact — Michael Carter",
};

export default function ContactPage() {
  return (
    <>
      <main className="w-full overflow-hidden pt-40 pb-[200px] max-md:pt-[120px] max-md:pb-[100px]">
        <div className="mx-auto flex w-[min(900px,calc(100%-80px))] flex-col items-center gap-[60px] max-md:w-[calc(100%-40px)] max-md:gap-10">
          <h1 className="m-0 w-full max-w-[500px] text-center text-[40px] leading-[1.1] font-medium tracking-[-0.03em] max-md:text-[32px]">
            <span className="text-slate">Ready to create something amazing?</span> let’s talk!
          </h1>
          <div className="flex w-full items-stretch gap-3 max-md:flex-col">
            <ContactForm />
            <aside className="flex min-h-full w-px flex-[1_0_0] flex-col justify-between overflow-hidden rounded-3xl bg-surface p-6 max-md:min-h-0 max-md:w-full max-md:flex-none max-md:gap-10 max-md:p-5">
              <div className="flex flex-col gap-10">
                <img
                  src="/assets/images/contact-michael-carter-avatar.png"
                  width={1200}
                  height={1200}
                  alt="Michael Carter avatar"
                  className="block h-20 w-20 rounded-2xl object-cover"
                />
                <p className="m-0 text-[20px] leading-[1.3] font-medium tracking-[-0.03em] text-fg-soft">
                  Prefer a quick chat?
                  <span className="text-slate"> Let’s hop on a call and explore the best way to bring your ideas to life</span>
                </p>
              </div>
              <div className="flex w-full flex-col items-end gap-2.5">
                <span className="rounded-[100px] border border-surface bg-elevated px-2.5 py-[5px] text-small text-slate">approximately 15 minutes</span>
                <a
                  href="https://framer.link/rosyid11"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-[10px] border border-line bg-transparent px-6 py-3 text-btn font-medium text-fg shadow-none transition-[background-color,border-color] duration-[220ms] ease-out hover:bg-elevated hover:text-fg active:border-muted"
                >
                  Book a Call
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
