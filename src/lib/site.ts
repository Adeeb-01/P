/** Public canonical origin. Set at build time; omit a trailing slash in generated URLs. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://adeeb.dev").replace(/\/+$/, "");
