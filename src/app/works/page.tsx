import type { Metadata } from "next";
import { ProjectCard } from "@/components/ProjectCard";
import { ClosingSection } from "@/components/ClosingSection";
import { QuickJumpTrigger } from "@/components/works/ProjectQuickJump";
import { VelocitySkew } from "@/components/motion/VelocitySkew";
import { ClipReveal } from "@/components/motion/ClipReveal";
import { PROJECTS } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Works — Michael Carter",
};

export default function WorksPage() {
  return (
    <>
      <main className="w-full overflow-hidden pb-[200px] max-md:pb-[100px]">
        <div className="mx-auto flex w-[min(1120px,calc(100%-80px))] flex-col gap-[60px] max-md:w-[calc(100%-40px)] max-md:gap-10">
          <header className="flex w-full items-end justify-between gap-6 pt-40 max-md:flex-col max-md:items-start max-md:pt-[120px]">
            <h1 className="m-0 w-full max-w-[650px] text-[40px] leading-[1.1] font-medium tracking-[-0.03em] max-tab:text-[32px]">
              <span className="text-muted">Designing seamless experiences that</span> elevate brands and engage users
            </h1>
            <QuickJumpTrigger className="flex-none" />
          </header>
          <VelocitySkew className="grid grid-cols-2 gap-3 pb-20 max-xl:grid-cols-1 max-md:pb-0">
            {PROJECTS.map((project, index) => (
              <ClipReveal key={project.slug} delay={(index % 2) * 0.08}>
                <ProjectCard project={project} variant="gallery" />
              </ClipReveal>
            ))}
          </VelocitySkew>
        </div>
      </main>
      <ClosingSection />
    </>
  );
}
