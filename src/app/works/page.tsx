import type { Metadata } from "next";
import { ClosingSection } from "@/components/ClosingSection";
import { QuickJumpTrigger } from "@/components/works/ProjectQuickJump";
import { SpatialShowcase } from "@/components/works/SpatialShowcase";
import { PROJECTS } from "@/lib/projects";

const title = "Works — Mohammad Adeeb Alsaleh";
const description = "Explore Mohammad Adeeb Alsaleh's software engineering case studies: full-stack MERN and Next.js platforms, Flutter apps, and AI-powered RAG systems.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/works" },
  openGraph: {
    title,
    description,
    url: "/works",
    type: "website",
    siteName: "Mohammad Adeeb Alsaleh",
    locale: "en_US",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Selected work by Mohammad Adeeb Alsaleh" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.png"] },
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
