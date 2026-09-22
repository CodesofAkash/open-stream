/**
 * The canonical origin for this deployment.
 *
 * Every piece of the SEO surface is built from this one value — sitemap URLs,
 * the robots.txt sitemap pointer, metadataBase, canonicals, OG image URLs and
 * the JSON-LD contentUrl/embedUrl. A hardcoded string here that does not match
 * the deployment means Google crawls URLs that do not exist, so it is derived
 * from the environment rather than written down.
 *
 * Precedence:
 *  1. NEXT_PUBLIC_SITE_URL          — set this to the real custom domain.
 *  2. VERCEL_PROJECT_PRODUCTION_URL — Vercel's stable production domain.
 *  3. VERCEL_URL                    — the per-deployment preview domain.
 *  4. localhost                     — local development.
 */
const withProtocol = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;

const stripTrailingSlash = (value: string) =>
  value.endsWith("/") ? value.slice(0, -1) : value;

const resolveSiteUrl = () => {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (candidate) {
    return stripTrailingSlash(withProtocol(candidate));
  }

  return "http://localhost:3000";
};

export const SITE_URL = resolveSiteUrl();

/** Build an absolute URL against the deployment's own origin. */
export const absoluteUrl = (path = "") =>
  `${SITE_URL}${path.startsWith("/") || path === "" ? path : `/${path}`}`;
