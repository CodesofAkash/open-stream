/**
 * Reusable GROQ projections (AK-CMS-007).
 *
 * Every query that needs a link, an image or an SEO block spreads one of these
 * rather than re-listing fields, so a schema change touches one place.
 *
 * Links are resolved to { href, target } HERE, at the data layer, not in the
 * rendering component (AK-CMS-025). Components render what they are handed.
 */

export const IMAGE_FRAGMENT = /* groq */ `
  "url": asset->url,
  "lqip": asset->metadata.lqip,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  alt
`;

export const LINK_FRAGMENT = /* groq */ `
  label,
  "href": select(
    linkType == "external" => externalUrl,
    internalPath
  ),
  "target": select(
    linkType == "external" => "_blank",
    null
  ),
  "isExternal": linkType == "external"
`;

export const CTA_FRAGMENT = /* groq */ `
  ${LINK_FRAGMENT},
  variant
`;

export const HEADING_FRAGMENT = /* groq */ `
  text,
  style,
  tag
`;

export const SEO_FRAGMENT = /* groq */ `
  title,
  description,
  noIndex,
  noFollow,
  ogImage{ ${IMAGE_FRAGMENT} }
`;
