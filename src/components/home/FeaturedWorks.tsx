import Link from "next/link";
import { ProjectCard } from "@/components/ProjectCard";
import { PROJECTS } from "@/lib/projects";
import { VelocitySkew } from "@/components/motion/VelocitySkew";
import { ClipReveal } from "@/components/motion/ClipReveal";
import { ScrambleText } from "@/components/motion/ScrambleText";

export function FeaturedWorks() {
  return (
    <main id="projects" className="flex w-full scroll-mt-20 justify-center bg-canvas pt-[120px] pb-[200px] max-md:pt-20 max-md:pb-[100px]">
      <div className="flex w-[min(1120px,calc(100%-80px))] flex-col gap-10 max-md:w-[calc(100%-40px)]">
        <div className="flex min-h-12 items-center justify-between">
          <h2 className="m-0 text-section font-medium text-fg"><ScrambleText self text="Featured works" /></h2>
          <Link
            href="/works"
            className="group inline-flex h-12 w-min items-center justify-center gap-3 rounded-2xl border border-transparent bg-surface px-6 py-3 text-btn font-medium whitespace-nowrap text-fg-soft shadow-button transition-colors duration-[220ms] ease-out hover:bg-surface-hover hover:text-fg focus-visible:bg-surface-hover focus-visible:text-fg active:bg-surface-hover active:text-fg max-xl:w-12 max-xl:min-w-12 max-xl:gap-0 max-xl:overflow-hidden max-xl:p-3.5 max-xl:text-[0px]"
          >
            <span>All Works</span>
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="h-5 w-5 flex-none transition-transform duration-[220ms] ease-out group-hover:[transform:translate(2px,-2px)] group-focus-visible:[transform:translate(2px,-2px)] group-active:[transform:translate(2px,-2px)] motion-reduce:transition-none motion-reduce:transform-none!"
            >
              <path d="M5.5 14.5 14.5 5.5M7 5.5h7.5V13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <VelocitySkew className="grid w-full grid-cols-2 gap-3 max-xl:grid-cols-1">
          {PROJECTS.map((project, index) => (
            <ClipReveal key={project.slug} delay={(index % 2) * 0.08}>
              <ProjectCard project={project} variant="featured" />
            </ClipReveal>
          ))}
        </VelocitySkew>
      </div>
    </main>
  );
}
