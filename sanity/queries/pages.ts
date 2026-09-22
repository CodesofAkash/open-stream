import { groq } from "next-sanity";

import { CTA_FRAGMENT, HEADING_FRAGMENT, SEO_FRAGMENT } from "./fragments";

export const ABOUT_PAGE_QUERY = groq`
  *[_type == "aboutPage"][0]{
    heading[]{ ${HEADING_FRAGMENT} },
    intro,
    missionTitle,
    missionBody,
    techStackTitle,
    techStack[]{ name, description },
    keyFeaturesTitle,
    keyFeatures,
    openSourceTitle,
    openSourceBody,
    openSourceBadges,
    repositoryCta{ ${CTA_FRAGMENT} },
    ctaTitle,
    ctaSubtitle,
    ctaButtons[]{ ${CTA_FRAGMENT} },
    seo{ ${SEO_FRAGMENT} }
  }
`;

export const CONTACT_PAGE_QUERY = groq`
  *[_type == "contactPage"][0]{
    heading[]{ ${HEADING_FRAGMENT} },
    intro,
    methods[]{
      title,
      description,
      cta{ ${CTA_FRAGMENT} }
    },
    formTitle,
    formDescription,
    seo{ ${SEO_FRAGMENT} }
  }
`;

export const FEATURES_PAGE_QUERY = groq`
  *[_type == "featuresPage"][0]{
    heading[]{ ${HEADING_FRAGMENT} },
    intro,
    repositoryCta{ ${CTA_FRAGMENT} },
    currentTitle,
    featureGroups[]{
      category,
      features[]{ name, description, tech }
    },
    roadmapTitle,
    roadmapGroups[]{
      priority,
      blurb,
      features[]{ name, description }
    },
    seo{ ${SEO_FRAGMENT} }
  }
`;

export const LEGAL_PAGE_QUERY = groq`
  *[_type == "legalPage" && slug.current == $slug][0]{
    "slug": slug.current,
    heading[]{ ${HEADING_FRAGMENT} },
    intro,
    showLastUpdated,
    _updatedAt,
    highlights[]{ title, description },
    sections[]{ title, summary, body },
    seo{ ${SEO_FRAGMENT} }
  }
`;

/**
 * Build-time path enumeration. Consumed through fetchStaticPaths, which uses
 * the raw client rather than sanityFetch (AK-SAN-009).
 */
export const LEGAL_PAGE_SLUGS_QUERY = groq`
  *[_type == "legalPage" && defined(slug.current)]{ "slug": slug.current }
`;
