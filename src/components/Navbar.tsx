"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, m, useMotionValueEvent, useScroll } from "motion/react";
import clsx from "clsx";
import { useMagnetic } from "@/components/motion/hooks";
import { useLenis } from "@/components/motion/SmoothScroll";
import { Shine } from "@/components/motion/Shine";
import { ScrambleText } from "@/components/motion/ScrambleText";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SoundToggle } from "@/components/sound/SoundToggle";

const NAV_LINKS = [
  { href: "/works", label: "Work", match: "/works" },
  { href: "/#services-title", label: "About", match: null },
  { href: "/contact", label: "Contact", match: "/contact" },
] as const;

const MotionLink = m.create(Link);
const SHELL_SPRING = { type: "spring", stiffness: 320, damping: 34, mass: 0.9 } as const;
const SCROLL_THRESHOLD = 40;

function NavLink({
  href,
  label,
  current,
  hovered,
  onHover,
}: {
  href: string;
  label: string;
  current: boolean;
  hovered: boolean;
  onHover: (href: string | null) => void;
}) {
  const magnetic = useMagnetic(0.22);
  return (
    <MotionLink
      href={href}
      aria-current={current ? "page" : undefined}
      style={{ x: magnetic.x, y: magnetic.y }}
      onPointerMove={magnetic.onPointerMove}
      onPointerEnter={() => onHover(href)}
      onPointerLeave={() => {
        magnetic.onPointerLeave();
        onHover(null);
      }}
      className="relative isolate flex min-h-7 items-center justify-center rounded-full px-[11px] py-[5px] text-[16px] leading-[19.2px] font-medium tracking-[-0.48px] text-fg"
    >
      {hovered && (
        <m.span
          layoutId="nav-hover-pill"
          aria-hidden="true"
          className="absolute inset-0 -z-[1] rounded-full bg-fg/[0.07]"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
      {current && <span aria-hidden="true" className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-violet" />}
      <ScrambleText text={label} />
    </MotionLink>
  );
}

function CtaButton({ className, onClick }: { className?: string; onClick?: () => void }) {
  const magnetic = useMagnetic(0.3);
  return (
    <m.a
      href="/contact"
      onClick={onClick}
      style={{ x: magnetic.x, y: magnetic.y }}
      onPointerMove={magnetic.onPointerMove}
      onPointerLeave={magnetic.onPointerLeave}
      whileTap={{ scale: 0.97 }}
      className={clsx(
        "group/btn relative isolate inline-flex h-12 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-0 bg-inverse px-6 py-3 text-btn font-medium whitespace-nowrap text-on-inverse",
        "transition-[background-color,box-shadow] duration-200 ease-out hover:bg-violet hover:text-white hover:shadow-violet active:bg-violet",
        className,
      )}
    >
      <Shine />
      Hire Me
    </m.a>
  );
}

const drawer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};
const drawerItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 380, damping: 30 } },
} as const;

export function Navbar() {
  const pathname = usePathname();
  const lenis = useLenis();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > SCROLL_THRESHOLD));

  // Close on route change.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 1200) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Freeze page scrolling behind the open drawer.
  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [open, lenis]);

  const floating = scrolled;

  return (
    <nav aria-label="Primary navigation" className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center">
      <m.div
        layout
        transition={SHELL_SPRING}
        style={{ borderRadius: floating ? 22 : 0 }}
        className={clsx(
          "pointer-events-auto flex flex-col items-stretch",
          floating
            ? "mt-3 w-[min(880px,calc(100%-24px))] border border-fg/[0.08] bg-canvas/85 py-1.5 pr-1.5 pl-6 shadow-[0_12px_40px_-18px_rgba(17,17,17,0.28)] backdrop-blur-xl backdrop-saturate-150 max-xl:px-4 max-md:mt-2 max-md:py-[5px]"
            : "w-full bg-canvas px-10 py-2.5 max-xl:py-[9px] max-md:px-5 max-md:py-[7px]",
          open && "shadow-menu max-xl:pb-6 max-md:pb-5",
        )}
      >
        <div className="flex h-12 w-full items-center justify-between">
          <m.div layout="position" transition={SHELL_SPRING} className="flex w-[240px] items-center max-xl:w-auto max-xl:flex-auto">
            <Link href="/" className="text-brand font-medium whitespace-nowrap text-fg">
              Adeeb Alsaleh
            </Link>
          </m.div>

          <m.div
            layout="position"
            transition={SHELL_SPRING}
            className="flex items-center justify-center max-xl:hidden"
            onPointerLeave={() => setHovered(null)}
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                current={Boolean(link.match && pathname.startsWith(link.match))}
                hovered={hovered === link.href}
                onHover={setHovered}
              />
            ))}
          </m.div>

          <m.div layout="position" transition={SHELL_SPRING} className="flex w-[240px] items-center justify-end gap-1 max-xl:hidden">
            <SoundToggle />
            <ThemeToggle />
            <CtaButton className="w-[135.172px] min-w-[135.172px] shadow-button-sm" />
          </m.div>

          <m.div layout="position" transition={SHELL_SPRING} className="mr-1 hidden items-center max-xl:flex">
            <SoundToggle />
            <ThemeToggle />
          </m.div>

          <m.button
            layout="position"
            transition={SHELL_SPRING}
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-controls="mobile-navigation"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="-mr-[11px] hidden h-11 w-11 cursor-pointer place-items-center border-0 bg-transparent p-[11px] text-muted max-xl:grid"
          >
            <span
              aria-hidden="true"
              className={clsx(
                "relative block h-[1.5px] w-[18px]",
                "before:absolute before:-top-[5px] before:block before:h-[1.5px] before:w-[18px] before:bg-current before:content-['']",
                "after:absolute after:top-[5px] after:block after:h-[1.5px] after:w-[18px] after:bg-current after:content-['']",
                "transition-[transform,opacity,background-color] duration-200 ease-out before:transition-transform before:duration-300 before:ease-luzia after:transition-transform after:duration-300 after:ease-luzia",
                "motion-reduce:transition-none motion-reduce:before:transition-none motion-reduce:after:transition-none",
                open
                  ? "bg-transparent before:[transform:translateY(5px)_rotate(45deg)] after:[transform:translateY(-5px)_rotate(-45deg)]"
                  : "bg-current",
              )}
            />
          </m.button>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <m.div
              key="drawer"
              layout
              id="mobile-navigation"
              variants={drawer}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex w-full flex-col items-start xl:hidden"
            >
              <div className="mt-6 flex w-full flex-col">
                {NAV_LINKS.map((link) => (
                  <m.div key={link.href} variants={drawerItem}>
                    <Link
                      href={link.href}
                      aria-current={link.match && pathname.startsWith(link.match) ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className="flex min-h-11 w-full items-center py-2.5 text-[16px] leading-[19.2px] font-medium tracking-[-0.48px] text-fg transition-colors duration-[190ms] hover:text-muted max-tab:text-[15px] max-tab:leading-[18px] max-tab:tracking-[-0.45px]"
                    >
                      {link.label}
                    </Link>
                  </m.div>
                ))}
              </div>
              <m.div variants={drawerItem} className="mt-4 w-full">
                <CtaButton className="w-full shadow-button" onClick={() => setOpen(false)} />
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
    </nav>
  );
}
