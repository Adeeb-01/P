# Portfolio asset pack — integration

Copy `public/` and `src/` from this folder into the project root (paths match the target layout).
`scripts/build-assets.mjs` regenerates everything: `node scripts/build-assets.mjs <rawImagesDir> .` (needs `sharp`).

## Files

| Path | Size | Use |
|---|---|---|
| `public/assets/images/hero-portrait.webp` | 2484×1972, alpha | Hero / `PortraitSheen` mask. Face centre ≈ 37% from top, 7% headroom, shoulders bleed off the bottom edge |
| `public/assets/images/projects/easy-learning.webp` | 2880×2160 | Easy Learning (AI LMS) cover |
| `public/assets/images/projects/tawsela-vendor.webp` | 2880×2160 | Tawsela Vendor app cover |
| `public/assets/images/projects/sarafy.webp` | 2880×2160 | Sarafy (exchange-rate pricing app) cover |
| `public/assets/images/projects/zad-souq.webp` | 2880×2160 | ZAD Souq e-commerce cover |
| `public/assets/images/services/service-{fullstack,ai,backend}-{1..3}.webp` | 800×800, q82 | 9 service-card previews |
| `public/og-image.png` | 1200×630 | OpenGraph / Twitter card |
| `src/app/icon.png` | 512×512 | Favicon (Next file convention, auto-linked) |
| `src/app/apple-icon.png` | 180×180, opaque | Apple touch icon (auto-linked) |

## Alt text (drop-in)

| File | `alt` |
|---|---|
| `hero-portrait.webp` | Portrait of Adeeb smiling, wearing a white shirt |
| `projects/easy-learning.webp` | Easy Learning AI LMS — student homepage, admin dashboard, AI tutor and adaptive quiz screens |
| `projects/tawsela-vendor.webp` | Tawsela Vendor mobile app — store management, live orders and earnings report screens |
| `projects/sarafy.webp` | Sarafy pricing app — live USD exchange rate and product prices in Syrian pounds |
| `projects/zad-souq.webp` | ZAD Souq e-commerce storefront — category navigation, featured categories and popular products |
| `services/service-fullstack-1.webp` | ZAD Souq storefront category and product grid |
| `services/service-fullstack-2.webp` | Easy Learning student homepage |
| `services/service-fullstack-3.webp` | Sarafy exchange-rate pricing screen |
| `services/service-ai-1.webp` | AI tutor panel beside a video lesson |
| `services/service-ai-2.webp` | Adaptive IRT quiz, student view |
| `services/service-ai-3.webp` | AI feature list: RAG tutor, adaptive and oral assessment, remediation |
| `services/service-backend-1.webp` | Admin dashboard with users, courses, enrollments and revenue |
| `services/service-backend-2.webp` | Vendor order-status pipeline: pending, accepted, preparing, ready, en route |
| `services/service-backend-3.webp` | Vendor earnings analytics with daily bar chart |

Placeholder cleanup: after copying, delete the old placeholder images your components no longer reference
(e.g. any `placeholder-*`/`project-*` files under `public/assets/images/`), and the default `src/app/favicon.ico`.

All cover content sits inside the central 75% safe zone (x 360–2520, y 270–1890), so 16:9 crops
(`object-position: center`) and `Loupe` zoom stay well-framed.

If `src/app/favicon.ico` is still the default Next.js one, delete it so `icon.png` is used.

## Metadata (`src/app/layout.tsx`)

```ts
import type { Metadata } from "next";

const siteUrl = "https://adeeb-alsaleh.vercel.app";
const title = "Mohammad Adeeb Alsaleh — Software Engineer";
const description =
  "Software Engineer — Full-Stack MERN & AI Systems. Selected work: Easy Learning, Tawsela, Sarafy, ZAD Souq.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: "%s — Mohammad Adeeb Alsaleh" },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Mohammad Adeeb Alsaleh",
    title,
    description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Mohammad Adeeb Alsaleh — Software Engineer" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};
```

## Hero portrait (`next/image`)

```tsx
<Image
  src="/assets/images/hero-portrait.webp"
  alt="Mohammad Adeeb Alsaleh"
  width={2484}
  height={1972}
  priority
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```
