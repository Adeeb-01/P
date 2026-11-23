// Build all portfolio visual assets from raw uploads.
// Usage: node build-assets.mjs <uploadsDir> <outRoot>
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const [, , UP, OUT] = process.argv;
const src = {
  portrait: "80b3418d-image.png",
  el1: "b2ad64a6-image.png",
  el2: "b43c5fe8-image.png",
  sarafy: "12d89c51-image.jpg",
  twSplash: "67b140ea-image.jpg",
  twHome: "1decad28-image.jpg",
  twStore: "bdc530d2-image.jpg",
  twReports: "9c088b91-image.jpg",
  zad1: "05b41308-image.jpg",
  zad2: "f6acce3a-image.jpg",
};
const P = (k) => path.join(UP, src[k]);
const out = (rel) => path.join(OUT, rel);
const ensure = async (f) => fs.mkdir(path.dirname(f), { recursive: true });

// Palette — obsidian & violet
const C = {
  obsidian: "#09090E",
  obsidian2: "#12111A",
  violet: "#8B5CF6",
  violetDeep: "#5B21B6",
  lilac: "#C4B5FD",
  text: "#F5F3FF",
  muted: "#A1A1B5",
  bezel: "#1A1924",
};

// ---------- helpers ----------
async function resized(input, { extract, width, height, fit = "fill", sharpen = false }) {
  let s = sharp(input);
  if (extract) s = s.extract(extract);
  s = s.resize({ width, height, fit, kernel: "lanczos3" });
  if (sharpen) s = s.sharpen({ sigma: 0.7, m1: 0.6, m2: 1.2 });
  return s.png().toBuffer();
}
const b64 = (buf) => `data:image/png;base64,${buf.toString("base64")}`;
async function meta(input) {
  return sharp(input).metadata();
}

function backdrop(W, H, { glowX = 0.72, glowY = 0.2, id = "bg" } = {}) {
  const grid = 120 * (W / 2880);
  return `
  <defs>
    <radialGradient id="${id}g1" cx="${glowX}" cy="${glowY}" r="0.75">
      <stop offset="0" stop-color="${C.violet}" stop-opacity="0.38"/>
      <stop offset="0.45" stop-color="${C.violetDeep}" stop-opacity="0.14"/>
      <stop offset="1" stop-color="${C.obsidian}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${id}g2" cx="0.12" cy="0.95" r="0.6">
      <stop offset="0" stop-color="#4C1D95" stop-opacity="0.30"/>
      <stop offset="1" stop-color="${C.obsidian}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="${id}grid" width="${grid}" height="${grid}" patternUnits="userSpaceOnUse">
      <path d="M ${grid} 0 L 0 0 0 ${grid}" fill="none" stroke="#ffffff" stroke-opacity="0.035" stroke-width="${Math.max(1, W / 1440)}"/>
    </pattern>
    <radialGradient id="${id}vig" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.6" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.45"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${C.obsidian}"/>
  <rect width="${W}" height="${H}" fill="url(#${id}grid)"/>
  <rect width="${W}" height="${H}" fill="url(#${id}g1)"/>
  <rect width="${W}" height="${H}" fill="url(#${id}g2)"/>
  <rect width="${W}" height="${H}" fill="url(#${id}vig)"/>`;
}

const shadowFilter = (id, blur = 40, dy = 30, op = 0.55) => `
  <filter id="${id}" x="-20%" y="-20%" width="140%" height="150%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${blur}"/>
    <feOffset dy="${dy}" result="o"/>
    <feFlood flood-color="#000" flood-opacity="${op}"/>
    <feComposite in2="o" operator="in"/>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>`;

let uid = 0;
// Browser window. imgBuf must already be exactly w × imgH.
function browser({ x, y, w, imgBuf, imgH, url = "", scale = 1 }) {
  const id = `bw${uid++}`;
  const bar = Math.round(58 * scale);
  const r = Math.round(22 * scale);
  const H = bar + imgH;
  const dot = (cx, col) => `<circle cx="${x + cx * scale}" cy="${y + bar / 2}" r="${8 * scale}" fill="${col}"/>`;
  const pillW = Math.min(w * 0.42, 620 * scale);
  return `
  <defs>
    ${shadowFilter(id + "s", 46 * scale, 34 * scale, 0.6)}
    <clipPath id="${id}c"><rect x="${x}" y="${y}" width="${w}" height="${H}" rx="${r}"/></clipPath>
  </defs>
  <g filter="url(#${id}s)">
    <rect x="${x}" y="${y}" width="${w}" height="${H}" rx="${r}" fill="${C.bezel}"/>
  </g>
  <g clip-path="url(#${id}c)">
    <rect x="${x}" y="${y}" width="${w}" height="${bar}" fill="#1C1B26"/>
    ${dot(30, "#FF5F57")}${dot(56, "#FEBC2E")}${dot(82, "#28C840")}
    <rect x="${x + (w - pillW) / 2}" y="${y + bar * 0.22}" width="${pillW}" height="${bar * 0.56}" rx="${bar * 0.28}" fill="#262535"/>
    ${url ? `<text x="${x + w / 2}" y="${y + bar / 2 + 7 * scale}" font-family="Inter" font-size="${20 * scale}" fill="${C.muted}" text-anchor="middle">${url}</text>` : ""}
    <image href="${b64(imgBuf)}" x="${x}" y="${y + bar}" width="${w}" height="${imgH}"/>
  </g>
  <rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${H - 1}" rx="${r}" fill="none" stroke="#ffffff" stroke-opacity="0.10" stroke-width="${1.5 * scale}"/>`;
}

// Phone frame. screenBuf must be exactly sw × sh.
function phone({ x, y, sw, sh, screenBuf }) {
  const id = `ph${uid++}`;
  const bz = Math.round(sw * 0.035);
  const W = sw + bz * 2, H = sh + bz * 2;
  const R = Math.round(W * 0.13), r = R - bz;
  const islandW = sw * 0.28, islandH = sw * 0.075;
  return `
  <defs>
    ${shadowFilter(id + "s", 50, 40, 0.65)}
    <clipPath id="${id}c"><rect x="${x + bz}" y="${y + bz}" width="${sw}" height="${sh}" rx="${r}"/></clipPath>
    <linearGradient id="${id}e" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3A3850"/><stop offset="0.5" stop-color="#1A1924"/><stop offset="1" stop-color="#2E2B40"/>
    </linearGradient>
  </defs>
  <g filter="url(#${id}s)"><rect x="${x}" y="${y}" width="${W}" height="${H}" rx="${R}" fill="#0E0D14"/></g>
  <rect x="${x + 1}" y="${y + 1}" width="${W - 2}" height="${H - 2}" rx="${R}" fill="none" stroke="url(#${id}e)" stroke-width="4"/>
  <image href="${b64(screenBuf)}" x="${x + bz}" y="${y + bz}" width="${sw}" height="${sh}" clip-path="url(#${id}c)"/>
  <rect x="${x + bz + (sw - islandW) / 2}" y="${y + bz + sh * 0.012}" width="${islandW}" height="${islandH}" rx="${islandH / 2}" fill="#050507"/>`;
}
const phoneOuter = (sw, sh) => {
  const bz = Math.round(sw * 0.035);
  return { W: sw + bz * 2, H: sh + bz * 2 };
};

async function renderSVG(svg, W, H) {
  return sharp(Buffer.from(svg), { density: 72, limitInputPixels: false }).resize(W, H);
}
const wrap = (W, H, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`;

// Screen crop for phones: remove the device status bar so frames look clean.
async function phoneScreen(file, statusBarFrac, sw) {
  const m = await meta(file);
  const top = Math.round(m.height * statusBarFrac);
  const ch = m.height - top;
  const sh = Math.round((sw * ch) / m.width);
  const buf = await resized(file, { extract: { left: 0, top, width: m.width, height: ch }, width: sw, height: sh, sharpen: sw > m.width });
  return { buf, sh };
}

// ---------- 1. Hero portrait ----------
async function heroPortrait() {
  const W = 2484, H = 1972;
  // Snap near-opaque subject alpha (≈253) to 255 so the silhouette isn't translucent.
  const raw = await sharp(P("portrait")).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data, info } = raw;
  for (let i = 3; i < data.length; i += 4) if (data[i] >= 240) data[i] = 255;
  const fixed = sharp(data, { raw: info });
  const bbox = { left: 138, top: 36, width: 1299 - 138, height: 1122 - 36 };
  const topPad = Math.round(H * 0.07); // headroom for Hero3DCore
  const sh = H - topPad;
  const sw = Math.round((bbox.width * sh) / bbox.height);
  const subject = await sharp(await fixed.extract(bbox).png().toBuffer())
    .resize(sw, sh, { kernel: "lanczos3" })
    .sharpen({ sigma: 0.6, m1: 0.5, m2: 1.0 })
    .png()
    .toBuffer();
  // Face centre ≈ x 700 in source → centre it horizontally.
  const faceX = ((700 - bbox.left) / bbox.width) * sw;
  const left = Math.round(W / 2 - faceX);
  const f = out("public/assets/images/hero-portrait.webp");
  await ensure(f);
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: subject, left, top: topPad }])
    .webp({ quality: 90, alphaQuality: 100, smartSubsample: true, effort: 6 })
    .toFile(f);
  return f;
}

// ---------- 2. Project covers (2880×2160) ----------
const CW = 2880, CH = 2160; // safe zone: x 360–2520, y 270–1890

async function coverEasyLearning() {
  const w = 1480;
  const h1 = Math.round((w * 418) / 673), h2 = Math.round((w * 370) / 672);
  const i1 = await resized(P("el1"), { width: w, height: h1, sharpen: true });
  const i2 = await resized(P("el2"), { width: w, height: h2, sharpen: true });
  const bar = 58;
  const body =
    backdrop(CW, CH, { glowX: 0.75, glowY: 0.15, id: "el" }) +
    browser({ x: 390, y: 300, w, imgBuf: i1, imgH: h1 }) +
    browser({ x: 2520 - w - 10, y: 1890 - (h2 + bar) - 10, w, imgBuf: i2, imgH: h2 });
  return renderSVG(wrap(CW, CH, body), CW, CH);
}

async function coverZad() {
  const w = 1720;
  const h1 = Math.round((w * 833) / 1911), h2 = Math.round((w * 908) / 1908);
  const i1 = await resized(P("zad1"), { width: w, height: h1 });
  const i2 = await resized(P("zad2"), { width: w, height: h2 });
  const bar = 58;
  const body =
    backdrop(CW, CH, { glowX: 0.25, glowY: 0.15, id: "zd" }) +
    browser({ x: 380, y: 310, w, imgBuf: i1, imgH: h1, url: "zadsouq.com" }) +
    browser({ x: 2520 - w - 10, y: 1890 - (h2 + bar) - 20, w, imgBuf: i2, imgH: h2, url: "zadsouq.com" });
  return renderSVG(wrap(CW, CH, body), CW, CH);
}

async function coverTawsela() {
  const sb = 100 / 2280; // status bar fraction
  const sideW = 600, midW = 680;
  const L = await phoneScreen(P("twStore"), sb, sideW);
  const M = await phoneScreen(P("twHome"), sb, midW);
  const R = await phoneScreen(P("twReports"), sb, sideW);
  const oS = phoneOuter(sideW, L.sh), oM = phoneOuter(midW, M.sh);
  const gap = 56;
  const total = oS.W * 2 + oM.W + gap * 2;
  const x0 = (CW - total) / 2;
  const yM = (CH - oM.H) / 2, yS = (CH - oS.H) / 2 + 60;
  const body =
    backdrop(CW, CH, { glowX: 0.5, glowY: 0.1, id: "tw" }) +
    phone({ x: x0, y: yS, sw: sideW, sh: L.sh, screenBuf: L.buf }) +
    phone({ x: x0 + oS.W * 2 + oM.W + gap * 2 - oS.W, y: yS, sw: sideW, sh: R.sh, screenBuf: R.buf }) +
    phone({ x: x0 + oS.W + gap, y: yM, sw: midW, sh: M.sh, screenBuf: M.buf });
  return renderSVG(wrap(CW, CH, body), CW, CH);
}

async function coverSarafy() {
  const sw = 700;
  const S = await phoneScreen(P("sarafy"), 46 / 1280, sw);
  const o = phoneOuter(sw, S.sh);
  const px = (CW - o.W) / 2, py = (CH - o.H) / 2;
  // Floating detail cards cropped from the same screen (1.6× zoom)
  const card = async (extract, w) => {
    const h = Math.round((w * extract.height) / extract.width);
    return { buf: await resized(P("sarafy"), { extract, width: w, height: h, sharpen: true }), w, h };
  };
  const rate = await card({ left: 22, top: 145, width: 562, height: 215 }, 860);
  const prod = await card({ left: 312, top: 686, width: 284, height: 452 }, 440);
  const float = (c, x, y) => {
    const id = `fl${uid++}`;
    return `<defs>${shadowFilter(id + "s", 40, 30, 0.7)}<clipPath id="${id}c"><rect x="${x}" y="${y}" width="${c.w}" height="${c.h}" rx="34"/></clipPath></defs>
      <g filter="url(#${id}s)"><rect x="${x}" y="${y}" width="${c.w}" height="${c.h}" rx="34" fill="${C.bezel}"/></g>
      <image href="${b64(c.buf)}" x="${x}" y="${y}" width="${c.w}" height="${c.h}" clip-path="url(#${id}c)"/>
      <rect x="${x}" y="${y}" width="${c.w}" height="${c.h}" rx="34" fill="none" stroke="${C.lilac}" stroke-opacity="0.35" stroke-width="3"/>`;
  };
  const body =
    backdrop(CW, CH, { glowX: 0.5, glowY: 0.35, id: "sf" }) +
    phone({ x: px, y: py, sw, sh: S.sh, screenBuf: S.buf }) +
    float(rate, 400, 520) +
    float(prod, 2520 - prod.w - 20, 1050);
  return renderSVG(wrap(CW, CH, body), CW, CH);
}

// ---------- 3. Service previews (800×800) ----------
async function serviceTile(file, extract, name) {
  const T = 800, pad = 60, max = T - pad * 2;
  const ratio = extract.width / extract.height;
  let w = max, h = Math.round(max / ratio);
  if (h > max) { h = max; w = Math.round(max * ratio); }
  const buf = await resized(file, { extract, width: w, height: h, sharpen: w > extract.width });
  const x = (T - w) / 2, y = (T - h) / 2;
  const id = `sv${uid++}`;
  const body =
    backdrop(T, T, { glowX: 0.8, glowY: 0.1, id }) +
    `<defs>${shadowFilter(id + "s", 22, 16, 0.6)}<clipPath id="${id}c"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22"/></clipPath></defs>
     <g filter="url(#${id}s)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${C.bezel}"/></g>
     <image href="${b64(buf)}" x="${x}" y="${y}" width="${w}" height="${h}" clip-path="url(#${id}c)"/>
     <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="none" stroke="#fff" stroke-opacity="0.12" stroke-width="2"/>`;
  const f = out(`public/assets/images/services/${name}.webp`);
  await ensure(f);
  await (await renderSVG(wrap(T, T, body), T, T)).webp({ quality: 82, effort: 6 }).toFile(f);
  return f;
}

// ---------- 4. OG image + icons ----------
function monogramSVG(S, { solid = true, radius = 0.22 } = {}) {
  return wrap(S, S, `
    <defs>
      <linearGradient id="mg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#E9D5FF"/><stop offset="0.5" stop-color="${C.lilac}"/><stop offset="1" stop-color="${C.violet}"/>
      </linearGradient>
      <radialGradient id="mgl" cx="0.78" cy="0.15" r="0.9">
        <stop offset="0" stop-color="${C.violet}" stop-opacity="0.55"/><stop offset="1" stop-color="${C.obsidian}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${S}" height="${S}" rx="${solid ? 0 : S * radius}" fill="${C.obsidian2}"/>
    <rect width="${S}" height="${S}" rx="${solid ? 0 : S * radius}" fill="url(#mgl)"/>
    ${solid ? "" : `<rect x="${S * 0.008}" y="${S * 0.008}" width="${S * 0.984}" height="${S * 0.984}" rx="${S * radius}" fill="none" stroke="#fff" stroke-opacity="0.10" stroke-width="${S * 0.012}"/>`}
    <text x="${S / 2}" y="${S * 0.655}" font-family="Inter Display" font-weight="800" font-size="${S * 0.44}" letter-spacing="${-S * 0.02}" fill="url(#mg)" text-anchor="middle">MA</text>
    <rect x="${S * 0.36}" y="${S * 0.76}" width="${S * 0.28}" height="${S * 0.022}" rx="${S * 0.011}" fill="${C.violet}" opacity="0.9"/>`);
}

async function ogImage() {
  const W = 1200, H = 630;
  // cut-out portrait on the right, inside the 1000×530 safe zone (x 100–1100, y 50–580)
  const ph = 560;
  const por = await sharp(out("public/assets/images/hero-portrait.webp"))
    .resize({ height: ph, kernel: "lanczos3" })
    .png()
    .toBuffer();
  const pm = await sharp(por).metadata();
  const px = 1110 - pm.width + 40, py = H - ph;
  const body = `
    ${backdrop(W, H, { glowX: 0.78, glowY: 0.35, id: "og" })}
    <defs><radialGradient id="halo" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${C.violet}" stop-opacity="0.45"/><stop offset="1" stop-color="${C.violet}" stop-opacity="0"/></radialGradient></defs>
    <circle cx="${px + pm.width / 2}" cy="${py + 230}" r="300" fill="url(#halo)"/>
    <image href="${b64(por)}" x="${px}" y="${py}" width="${pm.width}" height="${ph}"/>
    <rect x="0" y="${H - 120}" width="${W}" height="120" fill="url(#fade)"/>
    <defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.obsidian}" stop-opacity="0"/><stop offset="1" stop-color="${C.obsidian}" stop-opacity="0.85"/></linearGradient></defs>
    <g font-family="Inter">
      <rect x="100" y="92" width="58" height="58" rx="14" fill="${C.obsidian2}" stroke="${C.violet}" stroke-opacity="0.55" stroke-width="2"/>
      <text x="129" y="131" font-family="Inter Display" font-weight="800" font-size="25" fill="${C.lilac}" text-anchor="middle">MA</text>
      <text x="176" y="128" font-size="17" letter-spacing="3" fill="${C.muted}" font-weight="500">PORTFOLIO · 2026</text>
      <text x="100" y="252" font-family="Inter Display" font-weight="700" font-size="66" letter-spacing="-1.5" fill="${C.text}">Mohammad Adeeb</text>
      <text x="100" y="330" font-family="Inter Display" font-weight="700" font-size="66" letter-spacing="-1.5" fill="${C.lilac}">Alsaleh</text>
      <rect x="100" y="372" width="72" height="4" rx="2" fill="${C.violet}"/>
      <text x="100" y="428" font-size="28" font-weight="500" fill="${C.text}">Software Engineer</text>
      <text x="100" y="468" font-size="24" font-weight="400" fill="${C.muted}">Full-Stack MERN &amp; AI Systems</text>
      <text x="100" y="548" font-size="19" font-weight="500" letter-spacing="0.5" fill="${C.lilac}" fill-opacity="0.85">adeeb-alsaleh.vercel.app</text>
    </g>`;
  const f = out("public/og-image.png");
  await ensure(f);
  await (await renderSVG(wrap(W, H, body), W, H)).flatten({ background: C.obsidian }).png({ compressionLevel: 9 }).toFile(f);
  return f;
}

async function icons() {
  const a = out("src/app/icon.png"), b = out("src/app/apple-icon.png");
  await ensure(a);
  await sharp(Buffer.from(monogramSVG(512, { solid: false }))).resize(512, 512).png().toFile(a);
  await sharp(Buffer.from(monogramSVG(180, { solid: true }))).resize(180, 180).flatten({ background: C.obsidian2 }).png().toFile(b);
  return [a, b];
}

// ---------- run ----------
const covers = {
  "easy-learning": coverEasyLearning,
  "tawsela-vendor": coverTawsela,
  sarafy: coverSarafy,
  "zad-souq": coverZad,
};

console.log(await heroPortrait());
for (const [slug, fn] of Object.entries(covers)) {
  const f = out(`public/assets/images/projects/${slug}.webp`);
  await ensure(f);
  await (await fn()).webp({ quality: 85, effort: 6, smartSubsample: true }).toFile(f);
  console.log(f);
}

// Service card previews — named per spec: service-{fullstack|ai|backend}-{1..3}
const services = [
  ["service-fullstack-1", P("zad1"), { left: 500, top: 0, width: 860, height: 833 }],   // ZAD Souq storefront
  ["service-fullstack-2", P("el1"), { left: 4, top: 4, width: 328, height: 183 }],      // Easy Learning student homepage
  ["service-fullstack-3", P("sarafy"), { left: 0, top: 46, width: 606, height: 640 }],  // Sarafy pricing app
  ["service-ai-1", P("el2"), { left: 4, top: 2, width: 328, height: 186 }],             // AI Tutor in lesson
  ["service-ai-2", P("el2"), { left: 379, top: 2, width: 290, height: 186 }],           // Adaptive (IRT) quiz
  ["service-ai-3", P("el1"), { left: 492, top: 190, width: 178, height: 225 }],         // AI feature pipeline
  ["service-backend-1", P("el1"), { left: 338, top: 4, width: 326, height: 183 }],      // Admin dashboard
  ["service-backend-2", P("twHome"), { left: 30, top: 285, width: 1020, height: 1020 }],// Tawsela order states
  ["service-backend-3", P("twReports"), { left: 40, top: 1110, width: 1000, height: 960 }], // Tawsela analytics
];
for (const [name, file, ex] of services) console.log(await serviceTile(file, ex, name));
console.log(await ogImage());
console.log(...(await icons()));
