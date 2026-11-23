/** Service offerings shown on the Home page (cards + expanded detail panels). */
const IMG = "/assets/images/framerusercontent.com";

export type ServiceKey = "full-stack" | "ai-rag" | "backend-api";

export type Service = {
  key: ServiceKey;
  title: string;
  subject: string;
  prominent?: boolean;
  icon: { src: string; tile: string; filter: string };
  description: string;
  /** ⚠️ Temporary placeholder images carried over from the original template. */
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
      { src: `${IMG}/kFcT28JBAneTQjyVSMGiDyiwRlw-29d4f58ff0.png`, width: 1200, height: 600, alt: "Placeholder preview image" },
      { src: `${IMG}/Fm5dfyOw1px3Dsxu5sZmvHsOrKw-83ae28c313.png`, width: 1200, height: 801, alt: "Placeholder preview image" },
      { src: `${IMG}/6GwrKzXzNodjRpfhql82bLNul1E-737200f727.jpg`, width: 1200, height: 904, alt: "Placeholder preview image" },
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
      { src: `${IMG}/At4lVgdsU3vOE8OU9MxhtrSyU-057761a71c.png`, width: 1200, height: 933, alt: "Placeholder preview image" },
      { src: `${IMG}/DxUbioKrcg6pEvPVPn8MKs3ShqY-a8c1689a65.png`, width: 1200, height: 800, alt: "Placeholder preview image" },
      { src: `${IMG}/b89txAvenwqESiiy4RmX2Rq3cqw-7f76c8b687.png`, width: 1200, height: 904, alt: "Placeholder preview image" },
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
      { src: `${IMG}/FTAZ2Zly1EytGDVYhAqfSwh75I-8d00532f46.png`, width: 1200, height: 1200, alt: "Placeholder preview image" },
      { src: `${IMG}/1x6Kw84z16xT9kYkhOHSldsqAF4-4724d9b0db.png`, width: 1200, height: 904, alt: "Placeholder preview image" },
      { src: `${IMG}/KI7aSRP3L2vttQ79sArwUunvcBk-8859d6c6c6.png`, width: 1200, height: 673, alt: "Placeholder preview image" },
    ],
    tags: ["REST APIs", "JWT & RBAC", "MySQL & MongoDB", "+more"],
  },
];
