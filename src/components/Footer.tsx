import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { FooterWordmark } from "@/components/closing/FooterWordmark";
import { PROJECTS, projectHref } from "@/lib/projects";

/** internal → client-side Link · external → new tab · direct → mailto:/tel: in place */
type FooterLink = { label: string; href: string; kind: "internal" | "external" | "direct" };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Navigation",
    links: [
      { label: "Home", href: "/", kind: "internal" },
      { label: "Works", href: "/works", kind: "internal" },
      { label: "About", href: "/#services-title", kind: "internal" },
      { label: "Contact", href: "/contact", kind: "internal" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "GitHub", href: "https://github.com/Adeeb-01", kind: "external" },
      { label: "Email", href: "mailto:adeeb2002alsalh@gmail.com", kind: "direct" },
      { label: "WhatsApp", href: "https://wa.me/963996536128", kind: "external" },
      { label: "+963 996 536 128", href: "tel:+963996536128", kind: "direct" },
    ],
  },
  {
    title: "Case studies",
    links: PROJECTS.map((project) => ({ label: project.title, href: projectHref(project.slug), kind: "internal" as const })),
  },
];

const linkClass =
  "text-small font-normal text-light no-underline transition-colors duration-[180ms] ease-out hover:text-white focus-visible:outline-offset-4 active:text-white motion-reduce:transition-none";

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
                    {link.kind === "internal" ? (
                      <Link className={linkClass} href={link.href}>
                        {link.label}
                      </Link>
                    ) : (
                      <a className={linkClass} href={link.href} {...(link.kind === "external" ? { target: "_blank", rel: "noopener" } : {})}>
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </nav>

        <Reveal delay={0.2} y={12} className="mt-[72px] flex items-start justify-between gap-8 border-t border-white/[0.07] pt-4 text-credit font-normal text-muted max-xl:mt-[60px] max-xl:pt-3 max-md:mt-12 max-md:flex-col max-md:gap-5">
          <p className="m-0">© 2026 Mohammad Adeeb Alsaleh. All rights reserved.</p>
          <div className="flex items-center gap-10 whitespace-nowrap max-md:flex-wrap max-md:gap-x-7 max-md:gap-y-3 max-md:whitespace-normal">
            <p className="m-0">
              Engineered by <span className="text-white">Mohammad Adeeb Alsaleh</span>
            </p>
            <p className="m-0">Damascus, Syria</p>
          </div>
        </Reveal>
      </div>
      <FooterWordmark />
    </footer>
  );
}
