import { groq } from "next-sanity";

import { IMAGE_FRAGMENT, LINK_FRAGMENT } from "./fragments";

export const SITE_SETTINGS_QUERY = groq`
  *[_type == "siteSettings"][0]{
    siteName,
    tagline,
    logo{ ${IMAGE_FRAGMENT} },
    headerLinks[]{ ${LINK_FRAGMENT} },
    footerLinks[]{ ${LINK_FRAGMENT} },
    socialLinks[]{ ${LINK_FRAGMENT} },
    defaultSeoTitle,
    defaultSeoDescription,
    defaultOgImage{ ${IMAGE_FRAGMENT} },
    notFoundHeading,
    notFoundMessage,
    notFoundLinkLabel
  }
`;

export const GLOBAL_CONFIG_QUERY = groq`
  *[_type == "globalConfig"][0]{
    ga4MeasurementId,
    gtmContainerId,
    metaPixelId,
    posthogApiKey,
    headScripts,
    bodyScripts,
    scriptsRequireConsent,
    consentEnabled,
    consentMessage,
    consentAcceptLabel,
    consentDeclineLabel,
    consentPolicyUrl,
    maintenanceEnabled,
    maintenanceHeading,
    maintenanceMessage
  }
`;
