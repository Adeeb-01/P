import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { FooterWordmark } from "@/components/closing/FooterWordmark";

type FooterLink = { label: string; href: string; external?: boolean };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Navigation",
    links: [
      { label: "Home", href: "/" },
      { label: "Works", href: "/works" },
      { label: "About", href: "/#services-title" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "X (Twitter)", href: "https://x.com/qoim_h", external: true },
      { label: "Threads", href: "https://www.threads.com/@qoim.h", external: true },
      { label: "Instagram", href: "https://www.instagram.com/", external: true },
      { label: "Youtube", href: "https://www.youtube.com/", external: true },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "Framer Templates", href: "https://irise.studio/", external: true },
      { label: "Become Affiliate", href: "https://qoim.lemonsqueezy.com/affiliates", external: true },
      {
        label: "Hire me on Contra",
        href: "https://contra.com/rosyidqoim?referralExperimentNid=DEFAULT_REFERRAL_PROGRAM&referrerUsername=rosyidqoim",
        external: true,
      },
    ],
  },
];

const linkClass =
  "text-small font-normal text-light no-underline transition-colors duration-[180ms] ease-out hover:text-white focus-visible:outline-offset-4 active:text-white motion-reduce:transition-none";
const creditLinkClass =
  "text-white no-underline transition-colors duration-[180ms] ease-out hover:text-white focus-visible:outline-offset-4 motion-reduce:transition-none";

export function Footer() {
  return (
    <footer className="w-full rounded-none bg-transparent pt-24 text-white max-xl:pt-20">
      <div className="mx-auto w-[min(1120px,calc(100%-80px))] max-md:w-[calc(100%-40px)]">
        <nav
          aria-label="Footer navigation"
          className="grid grid-cols-[max-content_max-content_max-content] items-start justify-center gap-x-[84px] max-xl:gap-x-14 max-md:grid-cols-1 max-md:justify-stretch max-md:gap-y-10"
        >
          {COLUMNS.map((column, index) => (
            <Reveal key={column.title} delay={index * 0.08} y={18} className="min-w-28 max-[640.98px]:last:justify-self-start">
              <h2 className="m-0 mb-4 text-small font-medium text-muted">{column.title}</h2>
              <ul className="m-0 grid list-none gap-3.5 p-0">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a className={linkClass} href={link.href} target="_blank" rel="noopener">
                        {link.label}
                      </a>
                    ) : (
                      <Link className={linkClass} href={link.href}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </nav>

        <Reveal delay={0.2} y={12} className="mt-[72px] flex items-start justify-between gap-8 border-t border-white/[0.07] pt-4 text-credit font-normal text-muted max-xl:mt-[60px] max-xl:pt-3 max-md:mt-12 max-md:flex-col max-md:gap-5">
          <p className="m-0">©Irise Studio 2026. All rights reserved.</p>
          <div className="flex items-center gap-10 whitespace-nowrap max-md:flex-wrap max-md:gap-x-7 max-md:gap-y-3 max-md:whitespace-normal">
            <p className="m-0">
              Made in{" "}
              <a className={creditLinkClass} href="https://framer.com?fpr=rosyid11" target="_blank" rel="noopener">
                Framer
              </a>
            </p>
            <p className="m-0">
              Created by{" "}
              <a className={creditLinkClass} href="https://irise.studio/" target="_blank" rel="noopener">
                Rosyid Qoim
              </a>
            </p>
          </div>
        </Reveal>
      </div>
      <FooterWordmark />
    </footer>
  );
}
