/**
 * Project + case-study content.
 *
 * ⚠️ SAMPLE CONTENT: everything under `caseStudy` is placeholder copy written to demonstrate the
 * layout. Metric values are deliberately marked placeholders, not real results. Replace them with
 * the real project story, numbers and imagery before publishing.
 */

const IMG = "/assets/images/framerusercontent.com";

export type ProjectImage = { src: string; width: number; height: number; alt: string };

/** A close-up "crop" of an image, produced in CSS (zoom + focal point) — no extra assets needed. */
export type GalleryCrop = { label: string; zoom: number; focus: string };

export type Project = {
  slug: string;
  title: string;
  tags: string[];
  /** Image used on the Home "Featured works" grid. */
  featuredImage: ProjectImage;
  /** Image used on the Works page and the case study. */
  image: ProjectImage;
  year: string;
  caseStudy: {
    summary: string;
    role: string;
    client: string;
    services: string[];
    challenge: string;
    approach: string[];
    deliverables: string[];
    metrics: { value: string; label: string }[];
    gallery: GalleryCrop[];
  };
};

const PLACEHOLDER_METRICS = [
  { value: "+00%", label: "Metric placeholder — e.g. conversion uplift" },
  { value: "0.0×", label: "Metric placeholder — e.g. faster publishing" },
  { value: "00k", label: "Metric placeholder — e.g. monthly visitors" },
];

export const PROJECTS: Project[] = [
  {
    slug: "pulma",
    title: "Pulma",
    tags: ["Framer Website", "Web Design"],
    year: "2025",
    featuredImage: { src: `${IMG}/fsM37QoHH0cBakZGS5loTZtWXQY-ee4b2b53e5.webp`, width: 3200, height: 2400, alt: "Pulma website project preview" },
    image: { src: `${IMG}/fsM37QoHH0cBakZGS5loTZtWXQY-ee4b2b53e5.webp`, width: 3200, height: 2400, alt: "Pulma creative agency website" },
    caseStudy: {
      summary: "Sample summary — a confident, editorial website for a creative agency that wanted its work to speak first.",
      role: "Design & Framer development",
      client: "Sample client",
      services: ["Web design", "Framer build", "Motion"],
      challenge:
        "Sample copy — The agency's previous site buried its strongest projects under generic marketing sections. Visitors left before reaching the work, and the team couldn't update case studies without a developer.",
      approach: [
        "Sample copy — Led with a full-bleed showcase so the first scroll is the portfolio itself.",
        "Sample copy — Built a reusable case-study template in Framer CMS so the team can publish independently.",
        "Sample copy — Added restrained motion to guide attention without slowing the experience down.",
      ],
      deliverables: ["Responsive website", "Framer CMS setup", "Component library", "Launch support"],
      metrics: PLACEHOLDER_METRICS,
      gallery: [
        { label: "Hero composition", zoom: 1, focus: "50% 50%" },
        { label: "Navigation detail", zoom: 2.2, focus: "50% 6%" },
        { label: "Headline typography", zoom: 2, focus: "18% 32%" },
        { label: "Illustration detail", zoom: 2.4, focus: "45% 62%" },
        { label: "Testimonial card", zoom: 2.6, focus: "88% 88%" },
      ],
    },
  },
  {
    slug: "lumex",
    title: "LumeX",
    tags: ["SaaS", "Dashboard Design"],
    year: "2025",
    featuredImage: { src: `${IMG}/0An7MEBSkTQoOHCavzg1cniIiw-44f6922f64.webp`, width: 904, height: 1200, alt: "LumeX SaaS dashboard project preview" },
    image: { src: `${IMG}/0An7MEBSkTQoOHCavzg1cniIiw-ce100f8119.webp`, width: 904, height: 1200, alt: "LumeX SaaS dashboard" },
    caseStudy: {
      summary: "Sample summary — a calm, data-dense dashboard for a SaaS analytics product.",
      role: "Product & UI design",
      client: "Sample client",
      services: ["Product design", "Design system", "Prototyping"],
      challenge:
        "Sample copy — Power users needed dense data at a glance, while new users found the interface overwhelming. The product had grown without a shared design language.",
      approach: [
        "Sample copy — Audited every screen and consolidated patterns into a single token-based design system.",
        "Sample copy — Introduced progressive disclosure so advanced controls appear only when needed.",
        "Sample copy — Prototyped key flows and validated them with a small group of customers.",
      ],
      deliverables: ["Dashboard UI", "Design system", "Interactive prototype", "Developer handoff"],
      metrics: PLACEHOLDER_METRICS,
      gallery: [
        { label: "Full composition", zoom: 1, focus: "50% 50%" },
        { label: "Upper detail", zoom: 2, focus: "50% 18%" },
        { label: "Centre detail", zoom: 2.2, focus: "50% 50%" },
        { label: "Lower detail", zoom: 2.4, focus: "40% 82%" },
      ],
    },
  },
  {
    slug: "planza",
    title: "Planza",
    tags: ["Framer Website"],
    year: "2024",
    featuredImage: { src: `${IMG}/78zztBdraLorK1R0rLCLLGkv4-6053ee275e.webp`, width: 2560, height: 2034, alt: "Planza event planning website project preview" },
    image: { src: `${IMG}/78zztBdraLorK1R0rLCLLGkv4-cba4611bbb.webp`, width: 2560, height: 2034, alt: "Planza event planning website" },
    caseStudy: {
      summary: "Sample summary — a joyful, conversion-focused website for an event planning studio.",
      role: "Design & Framer development",
      client: "Sample client",
      services: ["Web design", "Framer build", "Copy support"],
      challenge:
        "Sample copy — Enquiries were coming in without the details the team needed, and the old site didn't reflect the energy of the events they produce.",
      approach: [
        "Sample copy — Built the story around real moments from past events.",
        "Sample copy — Designed a guided enquiry flow that captures date, size and budget up front.",
        "Sample copy — Kept the build lightweight so pages load quickly on mobile.",
      ],
      deliverables: ["Marketing website", "Enquiry flow", "Framer CMS", "SEO setup"],
      metrics: PLACEHOLDER_METRICS,
      gallery: [
        { label: "Full composition", zoom: 1, focus: "50% 50%" },
        { label: "Left detail", zoom: 2, focus: "20% 40%" },
        { label: "Right detail", zoom: 2.2, focus: "80% 35%" },
        { label: "Lower detail", zoom: 2.4, focus: "50% 85%" },
      ],
    },
  },
  {
    slug: "horizon-atlas",
    title: "Horizon Atlas",
    tags: ["Travel", "Web Design"],
    year: "2024",
    featuredImage: { src: `${IMG}/VJR2tpvQTbtvxZmeAxF5UHQPx1U-45cd08373c.webp`, width: 1200, height: 800, alt: "Horizon Atlas travel website project preview" },
    image: { src: `${IMG}/VJR2tpvQTbtvxZmeAxF5UHQPx1U-9dea1a29b8.webp`, width: 1200, height: 800, alt: "Horizon Atlas travel website" },
    caseStudy: {
      summary: "Sample summary — an immersive travel website that makes planning feel like part of the trip.",
      role: "Web design",
      client: "Sample client",
      services: ["Art direction", "Web design", "Interaction design"],
      challenge:
        "Sample copy — Destination pages read like brochures. The brand wanted visitors to feel the place before booking, without sacrificing clarity.",
      approach: [
        "Sample copy — Led with large-format photography and short, evocative copy.",
        "Sample copy — Structured itineraries as scannable day-by-day timelines.",
        "Sample copy — Used subtle parallax to add depth without distracting from content.",
      ],
      deliverables: ["Website design", "Itinerary templates", "Interaction specs", "Style guide"],
      metrics: PLACEHOLDER_METRICS,
      gallery: [
        { label: "Full composition", zoom: 1, focus: "50% 50%" },
        { label: "Horizon detail", zoom: 2, focus: "30% 30%" },
        { label: "Centre detail", zoom: 2.3, focus: "60% 55%" },
        { label: "Foreground detail", zoom: 2.5, focus: "70% 85%" },
      ],
    },
  },
];

export function getProject(slug: string) {
  return PROJECTS.find((project) => project.slug === slug);
}

export function getNextProject(slug: string) {
  const index = PROJECTS.findIndex((project) => project.slug === slug);
  return PROJECTS[(index + 1) % PROJECTS.length];
}

export const projectHref = (slug: string) => `/works/${slug}`;
