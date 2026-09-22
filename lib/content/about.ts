import "server-only";

import { contentConfig } from "@/lib/content-config";
import { getAboutPage } from "@/sanity/pages";
import type { HeadingSegment, ResolvedCta, SeoFields, TechItem } from "@/sanity/types";

/**
 * One mapper for the About page, so a schema change touches one file.
 *
 * MIGRATION STATE — read this before "tidying it up".
 *
 * The page renders from Sanity when a document exists, and from the shipped
 * constants when it does not. That is deliberately NOT the per-field fallback
 * AK-CMS-001 forbids: it is a deployment-level switch for a CMS that has not
 * been provisioned yet. Once the About document is published in Sanity, the
 * `about` block in lib/content-config.ts should be DELETED and this mapper
 * reduced to the CMS branch — at that point a missing field must render
 * nothing, not fall back to a constant.
 */

export type AboutContent = {
  heading: HeadingSegment[];
  intro: string | null;
  missionTitle: string | null;
  /** Portable Text when from the CMS, plain paragraphs when from constants. */
  missionBody: unknown[] | null;
  missionParagraphs: string[];
  techStackTitle: string | null;
  techStack: TechItem[];
  keyFeaturesTitle: string | null;
  keyFeatures: string[];
  openSourceTitle: string | null;
  openSourceBody: unknown[] | null;
  openSourceText: string | null;
  openSourceBadges: string[];
  repositoryCta: ResolvedCta | null;
  ctaTitle: string | null;
  ctaSubtitle: string | null;
  ctaButtons: ResolvedCta[];
  seo: SeoFields | null;
  /** True when the content came from Sanity rather than the constants. */
  fromCms: boolean;
};

const asHeading = (text?: string | null): HeadingSegment[] =>
  text ? [{ text, style: "default", tag: "h1" }] : [];

export const resolveAboutContent = async (): Promise<AboutContent> => {
  const cms = await getAboutPage();

  if (cms) {
    return {
      heading: cms.heading ?? [],
      intro: cms.intro ?? null,
      missionTitle: cms.missionTitle ?? null,
      missionBody: cms.missionBody ?? null,
      missionParagraphs: [],
      techStackTitle: cms.techStackTitle ?? null,
      techStack: cms.techStack ?? [],
      keyFeaturesTitle: cms.keyFeaturesTitle ?? null,
      keyFeatures: cms.keyFeatures ?? [],
      openSourceTitle: cms.openSourceTitle ?? null,
      openSourceBody: cms.openSourceBody ?? null,
      openSourceText: null,
      openSourceBadges: cms.openSourceBadges ?? [],
      repositoryCta: cms.repositoryCta ?? null,
      ctaTitle: cms.ctaTitle ?? null,
      ctaSubtitle: cms.ctaSubtitle ?? null,
      ctaButtons: cms.ctaButtons ?? [],
      seo: cms.seo ?? null,
      fromCms: true,
    };
  }

  const { about, project } = contentConfig;

  return {
    heading: asHeading(about.hero.title),
    intro: about.hero.subtitle,
    missionTitle: about.mission.title,
    missionBody: null,
    missionParagraphs: about.mission.paragraphs,
    techStackTitle: about.techStack.title,
    techStack: about.techStack.items,
    keyFeaturesTitle: about.features.title,
    keyFeatures: about.features.items,
    openSourceTitle: about.openSource.title,
    openSourceBody: null,
    openSourceText: about.openSource.description,
    openSourceBadges: about.openSource.badges,
    repositoryCta: {
      label: about.openSource.githubButtonText,
      href: project.githubUrl,
      target: "_blank",
      isExternal: true,
      variant: "default",
    },
    ctaTitle: about.cta.title,
    ctaSubtitle: about.cta.subtitle,
    ctaButtons: [
      {
        label: about.cta.buttons.features,
        href: "/features",
        target: null,
        isExternal: false,
        variant: "default",
      },
      {
        label: about.cta.buttons.contact,
        href: "/contact",
        target: null,
        isExternal: false,
        variant: "outline",
      },
    ],
    seo: {
      title: about.title,
      description: about.description,
    },
    fromCms: false,
  };
};
