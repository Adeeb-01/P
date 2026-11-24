/** Project + case-study content for Mohammad Adeeb Alsaleh. */
const IMG = "/assets/images/projects";

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

const cover = (slug: string, alt: string): ProjectImage => ({
  src: `${IMG}/${slug}.webp`,
  width: 2880,
  height: 2160,
  alt,
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
    featuredImage: cover("easy-learning", "Easy Learning AI LMS — student homepage, admin dashboard, AI tutor and adaptive quiz screens"),
    image: cover("easy-learning", "Easy Learning AI LMS — student homepage, admin dashboard, AI tutor and adaptive quiz screens"),
    caseStudy: {
      summary: "Full-stack adaptive Learning Management System integrating LLM-assisted content generation and Retrieval-Augmented Generation (RAG) semantic search.",
      role: "Full-stack & AI engineer",
      type: "AI-powered LMS",
      challenge: "Traditional educational platforms rely on static keyword search and manual content workflows, making personalized study guidance difficult.",
      approach: [
        "Built a full-stack Next.js, React, Node.js, and MongoDB platform integrated with VectorDB and LLMs.",
        "Delivered grounded semantic retrieval (RAG) and AI-assisted content creation.",
        "Implemented real-time student progress dashboards.",
      ],
      deliverables: ["Next.js Web Platform", "RAG Semantic Search", "AI Content Workflows", "Progress Dashboards"],
      metrics: [
        { value: "RAG", label: "Grounded Search" },
        { value: "MERN + Next.js", label: "Full-Stack" },
        { value: "VectorDB", label: "Semantic Indexing" },
      ],
      gallery: GALLERY,
    },
  },
  {
    slug: "tawsela-vendor",
    title: "Tawsela Vendor",
    tagline: "Merchant Operations & Order Management App",
    tags: ["Flutter", "Dart", "GetX", "Firebase", "Bilingual AR/EN"],
    featuredImage: cover("tawsela-vendor", "Tawsela Vendor mobile app — store management, live orders and earnings report screens"),
    image: cover("tawsela-vendor", "Tawsela Vendor mobile app — store management, live orders and earnings report screens"),
    caseStudy: {
      summary: "Production merchant mobile app for the Tawsela delivery platform enabling restaurants and stores to manage live orders, catalogs, revenue, and subscriptions.",
      role: "Mobile engineer",
      type: "Merchant operations app",
      challenge: "Store owners needed instantaneous incoming-order alerts, live order synchronization, and strict financial input validation across Arabic (RTL) and English interfaces.",
      approach: [
        "Engineered on Flutter 3.47 with GetX state management and Firebase integration.",
        "Delivered repeating incoming-order chimes, live order tracking, net income dashboards, and eligibility-filtered categories.",
        "Validated the interface with golden-image widget tests across 13 iterative release rounds.",
      ],
      deliverables: ["Flutter Android App", "Live Order Sync & Alerts", "Store & Catalog Manager", "Bilingual AR/EN UI"],
      metrics: [
        { value: "Flutter 3.47", label: "Cross-Platform" },
        { value: "Live Sync", label: "Real-Time Orders" },
        { value: "AR / EN", label: "Full RTL Support" },
      ],
      gallery: GALLERY,
    },
  },
  {
    slug: "sarafy",
    title: "Sarafy",
    tagline: "Offline-First POS, Pricing & Analytics App",
    tags: ["React Native", "Expo", "TypeScript", "SQLite", "Offline-First"],
    featuredImage: cover("sarafy", "Sarafy pricing app — live USD exchange rate and product prices in Syrian pounds"),
    image: cover("sarafy", "Sarafy pricing app — live USD exchange rate and product prices in Syrian pounds"),
    caseStudy: {
      summary: "Zero-server bilingual grocery pricing, invoicing, and business analytics mobile application with live USD-to-SYP exchange conversion and offline PDF/Excel reporting.",
      role: "Mobile & data engineer",
      type: "Offline-first POS & analytics app",
      challenge: "Retail stores operating without reliable internet needed instant multi-currency price conversion, historical profit accuracy, and portable backups without external cloud servers.",
      approach: [
        "Built with Expo, React Native, TypeScript, Zustand, and expo-sqlite (WAL mode).",
        "Stored immutable price, cost, and rate snapshots per invoice alongside automated rounding rules.",
        "Integrated native PDF invoice generation and SheetJS Excel import/export.",
      ],
      deliverables: ["Offline SQLite Engine", "USD→SYP Pricing Catalog", "PDF Invoicing & Analytics", "Excel & JSON Backup"],
      metrics: [
        { value: "100% Offline", label: "SQLite WAL" },
        { value: "PDF & Excel", label: "Native Export" },
        { value: "Real-Time", label: "Net Profit Analytics" },
      ],
      gallery: GALLERY,
    },
  },
  {
    slug: "zad-souq",
    title: "Zad Souq",
    tagline: "Full-Stack E-Commerce Platform",
    tags: ["MongoDB", "Express.js", "React.js", "Node.js"],
    featuredImage: cover("zad-souq", "ZAD Souq e-commerce storefront — category navigation, featured categories and popular products"),
    image: cover("zad-souq", "ZAD Souq e-commerce storefront — category navigation, featured categories and popular products"),
    caseStudy: {
      summary: "Full-stack MERN e-commerce web application engineered for responsive browsing, shopping cart state management, and reliable order processing.",
      role: "Full-stack engineer",
      type: "E-commerce platform",
      challenge: "Delivering a fast, intuitive storefront and consistent backend order pipeline across mobile, tablet, and desktop viewports.",
      approach: [
        "Architected modular RESTful APIs in Node.js and Express backed by MongoDB.",
        "Paired the backend with a responsive React storefront featuring dynamic product filtering.",
        "Delivered persistent cart workflows and end-to-end checkout stability.",
      ],
      deliverables: ["Responsive Storefront", "Cart & Checkout Pipeline", "Product & Order APIs", "MongoDB Data Models"],
      metrics: [
        { value: "MERN Stack", label: "End-to-End" },
        { value: "REST API", label: "Modular Core" },
        { value: "Responsive", label: "Multi-Device UI" },
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
