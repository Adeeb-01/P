import type { Metadata } from "next";
import { ClosingSection } from "@/components/ClosingSection";
import { QuickJumpTrigger } from "@/components/works/ProjectQuickJump";
import { SpatialShowcase } from "@/components/works/SpatialShowcase";
import { PROJECTS } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Works — Mohammad Adeeb Alsaleh",
};

export default function WorksPage() {
  return (
    <>
      {/* overflow-x-clip (not hidden): keeps the spatial track's sticky stage working. */}
      <main className="w-full overflow-x-clip pb-[200px] max-md:pb-[100px]">
        <div className="mx-auto mb-[60px] flex w-[min(1120px,calc(100%-80px))] flex-col max-md:mb-10 max-md:w-[calc(100%-40px)]">
          <header className="flex w-full items-end justify-between gap-6 pt-40 max-md:flex-col max-md:items-start max-md:pt-[120px]">
            <h1 className="m-0 w-full max-w-[650px] text-[40px] leading-[1.1] font-medium tracking-[-0.03em] max-tab:text-[32px]">
              <span className="text-muted">Selected engineering work</span> across full-stack web and AI-powered systems
            </h1>
            <QuickJumpTrigger className="flex-none" />
          </header>
        </div>
        <SpatialShowcase projects={PROJECTS} />
      </main>
      <ClosingSection />
    </>
  );
}
