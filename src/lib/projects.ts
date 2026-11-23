/**
 * Project + case-study content for Mohammad Adeeb Alsaleh.
 *
 * ⚠️ Cover images are TEMPORARY placeholders carried over from the original template (they are not
 * screenshots of these projects). Replace `image` / `featuredImage` with real screenshots, and the
 * `gallery` crops will follow automatically.
 */

const IMG = "/assets/images/framerusercontent.com";

export type ProjectImage = { src: string; width: number; height: number; alt: string };

/** A close-up "crop" of an image, produced in CSS (zoom + focal point) — no extra assets needed. */
export type GalleryCrop = { label: string; zoom: number; focus: string };

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  tags: string[];
  /** Image used on the Home "Featured works" grid. */
  featuredImage: ProjectImage;
  /** Image used on the Works page and the case study. */
  image: ProjectImage;
  caseStudy: {
    summary: string;
    role: string;
    type: string;
    challenge: string;
    approach: string[];
    deliverables: string[];
    metrics: { value: string; label: string }[];
    gallery: GalleryCrop[];
  };
};

const placeholder = (src: string, width: number, height: number, title: string): ProjectImage => ({
  src,
  width,
  height,
  alt: `Placeholder cover image for ${title}`,
});

const GALLERY: GalleryCrop[] = [
  { label: "Overview", zoom: 1, focus: "50% 50%" },
  { label: "Interface detail", zoom: 2, focus: "50% 18%" },
  { label: "Content detail", zoom: 2.2, focus: "30% 45%" },
  { label: "Component detail", zoom: 2.4, focus: "70% 80%" },
];

export const PROJECTS: Project[] = [
  {
    slug: "easy-learning",
    title: "easy:learning",
    tagline: "AI-Powered Learning Management System",
    tags: ["Next.js", "MERN Stack", "AI & RAG", "VectorDB"],
    featuredImage: placeholder(`${IMG}/fsM37QoHH0cBakZGS5loTZtWXQY-ee4b2b53e5.webp`, 3200, 2400, "easy:learning"),
    image: placeholder(`${IMG}/fsM37QoHH0cBakZGS5loTZtWXQY-ee4b2b53e5.webp`, 3200, 2400, "easy:learning"),
    caseStudy: {
      summary: "Full-stack adaptive Learning Management System integrating LLM-assisted content generation and RAG semantic search.",
      role: "Full-stack & AI engineer",
      type: "AI-powered LMS",
      challenge: "Traditional learning platforms suffer from static content discovery and manual educational workflow management.",
      approach: [
        "Built a full-stack MERN & Next.js platform backed by MongoDB and VectorDB.",
        "Implemented Retrieval-Augmented Generation (RAG) for accurate information retrieval and AI-assisted content creation.",
        "Delivered real-time student progress dashboards for learners and administrators.",
      ],
      deliverables: ["Next.js Web App", "RAG Search Engine", "Admin & Student Dashboards", "RESTful API"],
      metrics: [
        { value: "RAG", label: "Semantic search over course content" },
        { value: "Full-Stack", label: "MERN + Next.js" },
        { value: "100%", label: "End-to-end architecture" },
      ],
      gallery: GALLERY,
    },
  },
  {
    slug: "zad-souq",
    title: "Zad Souq",
    tagline: "Full-Stack E-Commerce Platform",
    tags: ["MongoDB", "Express.js", "React.js", "Node.js"],
    featuredImage: placeholder(`${IMG}/0An7MEBSkTQoOHCavzg1cniIiw-44f6922f64.webp`, 904, 1200, "Zad Souq"),
    image: placeholder(`${IMG}/0An7MEBSkTQoOHCavzg1cniIiw-ce100f8119.webp`, 904, 1200, "Zad Souq"),
    caseStudy: {
      summary: "End-to-end MERN e-commerce web application engineered for responsive shopping, cart management, and reliable order processing.",
      role: "Full-stack engineer",
      type: "E-commerce platform",
      challenge: "Delivering a fast, intuitive storefront and stable order pipeline across mobile and desktop devices.",
      approach: [
        "Architected a modular Node.js & Express backend connected to MongoDB.",
        "Paired it with a responsive React frontend featuring dynamic product catalogs.",
        "Implemented persistent shopping cart state and streamlined checkout workflows.",
      ],
      deliverables: ["Responsive Storefront", "Cart & Checkout Flow", "Product Management API", "Database Schema"],
      metrics: [
        { value: "MERN", label: "Full-stack core" },
        { value: "REST", label: "Modular APIs" },
        { value: "Multi-Device", label: "Responsive UI" },
      ],
      gallery: GALLERY,
    },
  },
  {
    slug: "rag-knowledge-engine",
    title: "RAG Knowledge Assistant",
    tagline: "Intelligent Document Retrieval Engine",
    tags: ["Python", "LLMs", "VectorDB", "Next.js"],
    featuredImage: placeholder(`${IMG}/78zztBdraLorK1R0rLCLLGkv4-6053ee275e.webp`, 2560, 2034, "RAG Knowledge Assistant"),
    image: placeholder(`${IMG}/78zztBdraLorK1R0rLCLLGkv4-cba4611bbb.webp`, 2560, 2034, "RAG Knowledge Assistant"),
    caseStudy: {
      summary: "Context-aware AI assistant pipeline enabling semantic querying and grounded content synthesis over structured technical documents.",
      role: "AI & backend engineer",
      type: "AI knowledge assistant",
      challenge: "Standard LLM prompts hallucinate or lack domain-specific context when querying private documentation.",
      approach: [
        "Engineered an embedding and chunking pipeline connected to a VectorDB store.",
        "Built a Next.js streaming chat interface on top of the retrieval layer.",
        "Ensured responses are strictly grounded in retrieved source passages.",
      ],
      deliverables: ["Vector Indexing Pipeline", "LLM Grounding API", "Streaming Chat UI", "Technical Docs"],
      metrics: [
        { value: "VectorDB", label: "Semantic index" },
        { value: "LLM", label: "Grounded synthesis" },
        { value: "Low-Latency", label: "Streaming UI" },
      ],
      gallery: GALLERY,
    },
  },
  {
    slug: "modular-rest-core",
    title: "Modular REST & Auth Core",
    tagline: "Scalable Backend Boilerplate",
    tags: ["Node.js", "Express.js", "MySQL", "System Design"],
    featuredImage: placeholder(`${IMG}/VJR2tpvQTbtvxZmeAxF5UHQPx1U-45cd08373c.webp`, 1200, 800, "Modular REST & Auth Core"),
    image: placeholder(`${IMG}/VJR2tpvQTbtvxZmeAxF5UHQPx1U-9dea1a29b8.webp`, 1200, 800, "Modular REST & Auth Core"),
    caseStudy: {
      summary: "Production-ready backend architecture featuring role-based authentication, relational/NoSQL data modeling, and automated API documentation.",
      role: "Backend engineer",
      type: "Backend architecture",
      challenge: "Eliminating repetitive setup and security bottlenecks when launching new data-driven web systems.",
      approach: [
        "Designed a clean, spec-driven Node.js/Express service layer with standardized error handling.",
        "Added JWT authentication with role-based access control and MySQL & MongoDB adapters.",
        "Covered the API with comprehensive Postman test suites and documentation.",
      ],
      deliverables: ["Auth & RBAC Layer", "Database Models", "REST API Suite", "Postman Documentation"],
      metrics: [
        { value: "RBAC", label: "Secure auth" },
        { value: "Dual-DB", label: "MySQL & MongoDB" },
        { value: "Spec-Driven", label: "Architecture" },
      ],
      gallery: GALLERY,
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
