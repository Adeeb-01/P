/** Service offerings shown on the Home page (cards + expanded detail panels). */
const IMG = "/assets/images/framerusercontent.com";

export type Service = {
  key: string;
  title: string;
  subject: string;
  prominent?: boolean;
  icon: { src: string; tile: string; filter: string };
  description: string;
  previews: { src: string; width: number; height: number; alt: string }[];
  tags: string[];
};

export const SERVICES: Service[] = [
  {
    key: "branding",
    title: "Branding Design",
    subject: "Branding%20Design%20Project",
    icon: {
      src: "/assets/images/service-branding-icon.svg",
      tile: "bg-tile-yellow",
      filter: "[filter:invert(71%)_sepia(91%)_saturate(542%)_hue-rotate(1deg)_brightness(99%)_contrast(96%)]",
    },
    description:
      "A strong brand is more than just a logo—it’s the foundation of how your audience perceives you. I create cohesive and impactful brand identities that ensure consistency across all touchpoints",
    previews: [
      { src: `${IMG}/FTAZ2Zly1EytGDVYhAqfSwh75I-8d00532f46.png`, width: 1200, height: 1200, alt: "Monochrome landscape branding study" },
      { src: `${IMG}/1x6Kw84z16xT9kYkhOHSldsqAF4-4724d9b0db.png`, width: 1200, height: 904, alt: "Black and white pattern study" },
      { src: `${IMG}/KI7aSRP3L2vttQ79sArwUunvcBk-8859d6c6c6.png`, width: 1200, height: 673, alt: "Red packaging identity study" },
    ],
    tags: ["Logo design", "Brand guideline", "Brand strategy", "+more"],
  },
  {
    key: "framer-development",
    title: "Framer Development",
    subject: "Framer%20Development%20Project",
    prominent: true,
    icon: {
      src: "/assets/images/service-framer-icon.svg",
      tile: "bg-tile-purple",
      filter: "[filter:invert(24%)_sepia(99%)_saturate(5782%)_hue-rotate(258deg)_brightness(98%)_contrast(98%)]",
    },
    description:
      "Transforming designs into fully responsive, interactive websites with Framer. Whether it’s a landing page or a full-scale web experience, I build fast, modern sites optimized for seamless performance",
    previews: [
      { src: `${IMG}/At4lVgdsU3vOE8OU9MxhtrSyU-057761a71c.png`, width: 1200, height: 933, alt: "Responsive website collaboration example" },
      { src: `${IMG}/DxUbioKrcg6pEvPVPn8MKs3ShqY-a8c1689a65.png`, width: 1200, height: 800, alt: "Outdoor digital experience example" },
      { src: `${IMG}/b89txAvenwqESiiy4RmX2Rq3cqw-7f76c8b687.png`, width: 1200, height: 904, alt: "Product design workspace example" },
    ],
    tags: ["Landing page", "Multipages", "Web migration", "+more"],
  },
  {
    key: "ui-ux",
    title: "UI/UX Design",
    subject: "UI%2FUX%20Design%20Project",
    icon: {
      src: "/assets/images/service-uiux-icon.svg",
      tile: "bg-tile-green",
      filter: "[filter:invert(58%)_sepia(74%)_saturate(1076%)_hue-rotate(90deg)_brightness(91%)_contrast(94%)]",
    },
    description:
      "Designing user-centered experiences that are both functional and visually engaging. From concept to final prototype, I focus on intuitive interfaces that enhance experiences and usability",
    previews: [
      { src: `${IMG}/kFcT28JBAneTQjyVSMGiDyiwRlw-29d4f58ff0.png`, width: 1200, height: 600, alt: "Interface planning and color system example" },
      { src: `${IMG}/Fm5dfyOw1px3Dsxu5sZmvHsOrKw-83ae28c313.png`, width: 1200, height: 801, alt: "Website interface presented on a laptop" },
      { src: `${IMG}/6GwrKzXzNodjRpfhql82bLNul1E-737200f727.jpg`, width: 1200, height: 904, alt: "Interactive development workspace example" },
    ],
    tags: ["Web & app design", "Design system", "Prototyping", "+more"],
  },
];
