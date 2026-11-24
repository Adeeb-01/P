/** Service offerings shown on the Home page (cards + expanded detail panels). */
const IMG = "/assets/images/services";

export type ServiceKey = "full-stack" | "ai-rag" | "backend-api";

export type Service = {
  key: ServiceKey;
  title: string;
  subject: string;
  prominent?: boolean;
  icon: { src: string; tile: string; filter: string };
  description: string;
  /** Real project screenshots shown in the service cards. */
  previews: { src: string; width: number; height: number; alt: string }[];
  tags: string[];
};

export const CONTACT_EMAIL = "adeeb2002alsalh@gmail.com";

export const SERVICES: Service[] = [
  {
    key: "full-stack",
    title: "Full-Stack Web Engineering",
    subject: "Full-Stack%20Web%20Engineering%20Project",
    icon: {
      src: "/assets/images/service-fullstack-icon.svg",
      tile: "bg-tile-green",
      filter: "[filter:invert(58%)_sepia(74%)_saturate(1076%)_hue-rotate(90deg)_brightness(91%)_contrast(94%)]",
    },
    description:
      "Building scalable, responsive web applications from database modeling to modern React & Next.js interfaces using the MERN stack.",
    previews: [
      { src: `${IMG}/service-fullstack-1.webp`, width: 800, height: 800, alt: "ZAD Souq storefront category and product grid" },
      { src: `${IMG}/service-fullstack-2.webp`, width: 800, height: 800, alt: "Easy Learning student homepage" },
      { src: `${IMG}/service-fullstack-3.webp`, width: 800, height: 800, alt: "Sarafy exchange-rate pricing screen" },
    ],
    tags: ["React & Next.js", "Node & Express", "MongoDB", "+more"],
  },
  {
    key: "ai-rag",
    title: "AI & RAG Integration",
    subject: "AI%20%26%20RAG%20Integration%20Project",
    prominent: true,
    icon: {
      src: "/assets/images/service-ai-icon.svg",
      tile: "bg-tile-purple",
      filter: "[filter:invert(24%)_sepia(99%)_saturate(5782%)_hue-rotate(258deg)_brightness(98%)_contrast(98%)]",
    },
    description:
      "Integrating Large Language Models, VectorDB semantic search, and Retrieval-Augmented Generation (RAG) workflows into practical web platforms.",
    previews: [
      { src: `${IMG}/service-ai-1.webp`, width: 800, height: 800, alt: "AI tutor panel beside a video lesson" },
      { src: `${IMG}/service-ai-2.webp`, width: 800, height: 800, alt: "Adaptive IRT quiz, student view" },
      { src: `${IMG}/service-ai-3.webp`, width: 800, height: 800, alt: "AI feature list: RAG tutor, adaptive and oral assessment, remediation" },
    ],
    tags: ["LLM APIs", "RAG pipelines", "VectorDB", "+more"],
  },
  {
    key: "backend-api",
    title: "Backend & API Architecture",
    subject: "Backend%20%26%20API%20Architecture%20Project",
    icon: {
      src: "/assets/images/service-backend-icon.svg",
      tile: "bg-tile-yellow",
      filter: "[filter:invert(71%)_sepia(91%)_saturate(542%)_hue-rotate(1deg)_brightness(99%)_contrast(96%)]",
    },
    description:
      "Designing secure RESTful APIs, authentication systems, and relational/NoSQL database architectures (MongoDB & MySQL) built for reliability.",
    previews: [
      { src: `${IMG}/service-backend-1.webp`, width: 800, height: 800, alt: "Admin dashboard with users, courses, enrollments and revenue" },
      { src: `${IMG}/service-backend-2.webp`, width: 800, height: 800, alt: "Vendor order-status pipeline: pending, accepted, preparing, ready, en route" },
      { src: `${IMG}/service-backend-3.webp`, width: 800, height: 800, alt: "Vendor earnings analytics with daily bar chart" },
    ],
    tags: ["REST APIs", "JWT & RBAC", "MySQL & MongoDB", "+more"],
  },
];
