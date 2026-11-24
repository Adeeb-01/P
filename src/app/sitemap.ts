import type { MetadataRoute } from "next";
import { PROJECTS } from "@/lib/projects";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, priority: 1.0, changeFrequency: "weekly" },
    { url: `${SITE_URL}/works`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${SITE_URL}/contact`, priority: 0.8, changeFrequency: "monthly" },
    ...PROJECTS.map((project) => ({
      url: `${SITE_URL}/works/${project.slug}`,
      priority: 0.85,
      changeFrequency: "monthly" as const,
    })),
  ];
}
