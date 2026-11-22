import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { FeaturedWorks } from "@/components/home/FeaturedWorks";
import { SocialProof } from "@/components/home/SocialProof";
import { Services } from "@/components/home/Services";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FaqSection } from "@/components/home/FaqSection";
import { ClosingSection } from "@/components/ClosingSection";
import { VelocityMarquee } from "@/components/motion/VelocityMarquee";

export const metadata: Metadata = {
  title: "Michael Carter — Digital Product Designer",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <VelocityMarquee />
      <FeaturedWorks />
      <SocialProof />
      <Services />
      <HowItWorks />
      <FaqSection />
      <ClosingSection />
    </>
  );
}
