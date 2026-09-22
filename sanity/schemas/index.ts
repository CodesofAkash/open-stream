import type { SchemaTypeDefinition } from "sanity";

// Objects — reusable field-level types
import { ctaBtn } from "./objects/ctaBtn";
import { headingSegment } from "./objects/headingSegment";
import { imageWithAlt } from "./objects/imageWithAlt";
import { link } from "./objects/link";
import { richText } from "./objects/richText";
import { seo } from "./objects/seo";

// Documents — singletons
import { aboutPage } from "./documents/aboutPage";
import { contactPage } from "./documents/contactPage";
import { featuresPage } from "./documents/featuresPage";
import { globalConfig } from "./documents/globalConfig";
import { legalPage } from "./documents/legalPage";
import { siteSettings } from "./documents/siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Objects
  headingSegment,
  richText,
  imageWithAlt,
  link,
  ctaBtn,
  seo,

  // Settings
  siteSettings,
  globalConfig,

  // Pages
  aboutPage,
  contactPage,
  featuresPage,
  legalPage,
];

/**
 * Document types that may only ever have one instance. The Studio hides their
 * create/duplicate/delete actions so an editor cannot end up with a second
 * "Site settings" that silently does nothing.
 *
 * legalPage is NOT here — privacy and terms are two documents of that type.
 */
export const SINGLETON_TYPES = new Set([
  "siteSettings",
  "globalConfig",
  "aboutPage",
  "contactPage",
  "featuresPage",
]);
