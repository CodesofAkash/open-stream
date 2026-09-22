/**
 * Hand-written result types, kept next to the queries they describe.
 *
 * These are a promise, not a guarantee (AK-CMS-033). They describe what we
 * expect Sanity to return, not what it did. Every field is optional on purpose:
 * any CMS field can be empty at read time whatever the schema says
 * (AK-CMS-021), and a type asserting otherwise walks straight past tsc and
 * fails in production.
 *
 * Move to real typegen (`sanity schema extract` + `sanity typegen generate`)
 * once there are more than a couple of queries.
 */

export type SanityImage = {
  url?: string | null;
  lqip?: string | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
};

export type ResolvedLink = {
  label?: string | null;
  href?: string | null;
  target?: string | null;
  isExternal?: boolean | null;
};

export type ResolvedCta = ResolvedLink & {
  variant?: string | null;
};

export type HeadingSegment = {
  text?: string | null;
  style?: string | null;
  tag?: string | null;
};

export type SeoFields = {
  title?: string | null;
  description?: string | null;
  noIndex?: boolean | null;
  noFollow?: boolean | null;
  ogImage?: SanityImage | null;
};

export type SiteSettings = {
  siteName?: string | null;
  tagline?: string | null;
  logo?: SanityImage | null;
  headerLinks?: ResolvedLink[] | null;
  footerLinks?: ResolvedLink[] | null;
  socialLinks?: ResolvedLink[] | null;
  defaultSeoTitle?: string | null;
  defaultSeoDescription?: string | null;
  defaultOgImage?: SanityImage | null;
  notFoundHeading?: string | null;
  notFoundMessage?: string | null;
  notFoundLinkLabel?: string | null;
};

export type GlobalConfig = {
  ga4MeasurementId?: string | null;
  gtmContainerId?: string | null;
  metaPixelId?: string | null;
  posthogApiKey?: string | null;
  headScripts?: string | null;
  bodyScripts?: string | null;
  scriptsRequireConsent?: boolean | null;
  consentEnabled?: boolean | null;
  consentMessage?: string | null;
  consentAcceptLabel?: string | null;
  consentDeclineLabel?: string | null;
  consentPolicyUrl?: string | null;
  maintenanceEnabled?: boolean | null;
  maintenanceHeading?: string | null;
  maintenanceMessage?: string | null;
};

// --- Page documents ---------------------------------------------------------

export type TechItem = { name?: string | null; description?: string | null };

export type AboutPage = {
  heading?: HeadingSegment[] | null;
  intro?: string | null;
  missionTitle?: string | null;
  missionBody?: unknown[] | null;
  techStackTitle?: string | null;
  techStack?: TechItem[] | null;
  keyFeaturesTitle?: string | null;
  keyFeatures?: string[] | null;
  openSourceTitle?: string | null;
  openSourceBody?: unknown[] | null;
  openSourceBadges?: string[] | null;
  repositoryCta?: ResolvedCta | null;
  ctaTitle?: string | null;
  ctaSubtitle?: string | null;
  ctaButtons?: ResolvedCta[] | null;
  seo?: SeoFields | null;
};

export type ContactMethod = {
  title?: string | null;
  description?: string | null;
  cta?: ResolvedCta | null;
};

export type ContactPage = {
  heading?: HeadingSegment[] | null;
  intro?: string | null;
  methods?: ContactMethod[] | null;
  formTitle?: string | null;
  formDescription?: string | null;
  seo?: SeoFields | null;
};

export type Feature = {
  name?: string | null;
  description?: string | null;
  tech?: string[] | null;
  status?: string | null;
};

export type FeaturesPage = {
  heading?: HeadingSegment[] | null;
  intro?: string | null;
  repositoryCta?: ResolvedCta | null;
  currentTitle?: string | null;
  currentSubtitle?: string | null;
  featureGroups?: { category?: string | null; features?: Feature[] | null }[] | null;
  roadmapTitle?: string | null;
  roadmapSubtitle?: string | null;
  contributeTitle?: string | null;
  contributeDescription?: string | null;
  suggestionTitle?: string | null;
  suggestionDescription?: string | null;
  roadmapGroups?:
    | { priority?: string | null; blurb?: string | null; features?: Feature[] | null }[]
    | null;
  seo?: SeoFields | null;
};

export type LegalSection = {
  title?: string | null;
  summary?: string | null;
  body?: unknown[] | null;
};

export type LegalPage = {
  slug?: string | null;
  heading?: HeadingSegment[] | null;
  intro?: string | null;
  notice?: string | null;
  showLastUpdated?: boolean | null;
  _updatedAt?: string | null;
  highlights?: { title?: string | null; description?: string | null }[] | null;
  sections?: LegalSection[] | null;
  seo?: SeoFields | null;
};
