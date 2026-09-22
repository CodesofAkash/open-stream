import type { Metadata } from "next";

import { SITE_URL } from "@/lib/site-url";

import type { SeoFields, SiteSettings } from "./types";

/**
 * The one function turning CMS SEO fields into Next's Metadata shape
 * (AK-CMS-029). Never reimplemented per route.
 *
 * Three traps this exists to avoid, each of which has shipped somewhere:
 *
 * 1. Fallback is PER FIELD, not all-or-nothing. A page missing only an OG image
 *    still keeps its own title and description.
 * 2. A CMS title that already ends in the site name renders doubled under a
 *    title template — "About | OpenStream | OpenStream". Editors type it; strip
 *    it rather than trusting them not to.
 * 3. noIndex/noFollow are the INVERSE of Next's index/follow. Wiring them
 *    straight through silently deindexes the site with no visible symptom.
 */

type BuildArgs = {
  seo?: SeoFields | null;
  settings?: SiteSettings | null;
  /** Route-supplied fallbacks, for pages that are not fully CMS-driven. */
  fallbackTitle?: string;
  fallbackDescription?: string;
  /** Path from the site root, e.g. "/about". */
  path?: string;
};

const stripSiteNameSuffix = (title: string, siteName?: string | null) => {
  if (!siteName) return title;
  const suffix = new RegExp(`\s*[|\-–]\s*${siteName}\s*$`, "i");
  return title.replace(suffix, "").trim();
};

export const buildPageMetadata = ({
  seo,
  settings,
  fallbackTitle,
  fallbackDescription,
  path = "",
}: BuildArgs): Metadata => {
  const siteName = settings?.siteName ?? "OpenStream";

  const rawTitle = seo?.title || fallbackTitle || settings?.defaultSeoTitle || undefined;
  const title = rawTitle ? stripSiteNameSuffix(rawTitle, siteName) : undefined;

  const description =
    seo?.description || fallbackDescription || settings?.defaultSeoDescription || undefined;

  // Per-field fallback: the page's own image, else the site default from the
  // CMS, else the image shipped in /public. The last step is not optional:
  // this function always returns a full openGraph block, and a child's block
  // replaces the parent's wholesale (AK-NXT-011) — so returning no image here
  // would strip the root layout's image from every page that calls it.
  const cmsImage = seo?.ogImage?.url ? seo.ogImage : settings?.defaultOgImage;
  const ogImage = cmsImage?.url
    ? cmsImage
    : { url: "/OpenStream.png", width: 1200, height: 630, alt: siteName };

  const canonical = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: { canonical },
    // Inverted deliberately — see trap 3 above.
    robots: {
      index: !seo?.noIndex,
      follow: !seo?.noFollow,
    },
    openGraph: {
      // Set the whole block: a child declaring any openGraph field replaces the
      // parent's entire block (AK-NXT-011).
      type: "website",
      siteName,
      title: title ?? undefined,
      description: description ?? undefined,
      url: canonical,
      images: ogImage?.url
        ? [
            {
              url: ogImage.url,
              width: ogImage.width ?? undefined,
              height: ogImage.height ?? undefined,
              alt: ogImage.alt ?? undefined,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? undefined,
      description: description ?? undefined,
      images: ogImage?.url ? [ogImage.url] : undefined,
    },
  };
};
