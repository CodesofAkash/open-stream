/**
 * One-off: copies the shipped page copy from lib/content-config.ts and
 * lib/features-data.ts into Sanity, so the Studio opens with every page filled
 * in rather than empty.
 *
 * Idempotent — every document is createOrReplace'd under a fixed id, so running
 * it twice gives the same result. It DOES overwrite edits made in the Studio,
 * so run it once, at setup, and not again after editors start working.
 *
 *   SANITY_API_WRITE_TOKEN=sk... npx tsx scripts/seed-sanity.ts
 *
 * The token needs Editor (or higher) permission and is read from the
 * environment only — it is never written to a file.
 */
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { createClient } from "next-sanity";
import { config } from "dotenv";

import { contentConfig } from "../lib/content-config";
import { currentFeatures, futureFeatures } from "../lib/features-data";

config({ path: ".env", quiet: true });

const token = process.env.SANITY_API_WRITE_TOKEN;
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

if (!token || !projectId) {
  console.error("Set SANITY_API_WRITE_TOKEN and NEXT_PUBLIC_SANITY_PROJECT_ID first.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-09-22",
  token,
  useCdn: false,
});

// --- Portable Text builders -------------------------------------------------

type Span = { text: string; bold?: boolean };

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

const block = (spans: Span[], style = "normal", listItem?: "bullet") => ({
  _type: "block",
  _key: key(),
  style,
  markDefs: [],
  ...(listItem ? { listItem, level: 1 } : {}),
  children: spans.map((span) => ({
    _type: "span",
    _key: key(),
    text: span.text,
    marks: span.bold ? ["strong"] : [],
  })),
});

const paragraph = (text: string) => block([{ text }]);
const subheading = (text: string) => block([{ text }], "h3");
const bullet = (spans: Span[]) => block(spans, "normal", "bullet");

/** Bold a leading phrase if the text starts with it. */
const withBoldLead = (text: string, bold?: string): Span[] =>
  bold && text.startsWith(bold)
    ? [{ text: bold, bold: true }, { text: text.slice(bold.length) }]
    : [{ text }];

const heading = (text: string, tag = "h1") => [
  { _type: "headingSegment", _key: key(), text, style: "default", tag },
];

const externalCta = (label: string, url: string, variant = "default") => ({
  _type: "ctaBtn",
  label,
  linkType: "external",
  externalUrl: url,
  variant,
});

const internalCta = (label: string, path: string, variant = "default") => ({
  _type: "ctaBtn",
  label,
  linkType: "internal",
  internalPath: path,
  variant,
});

const seo = (title: string, description: string) => ({ _type: "seo", title, description });

// --- Legal sections: the constants use several shapes; flatten to rich text --

type LegalItem = string | { label?: string; text?: string };
type LegalSectionSource = {
  title: string;
  description?: string;
  intro?: string;
  text?: string;
  contactText?: string;
  shareText?: string;
  footer?: string;
  paragraphs?: { text: string; bold?: string }[];
  items?: LegalItem[];
  rights?: { title: string; description: string }[];
  subsections?: { title: string; intro?: string; items?: string[] }[];
};

const legalBody = (section: LegalSectionSource) => {
  const body: ReturnType<typeof block>[] = [];

  if (section.intro) body.push(paragraph(section.intro));
  if (section.text) body.push(paragraph(section.text));
  section.paragraphs?.forEach((p) => body.push(block(withBoldLead(p.text, p.bold))));
  if (section.shareText) body.push(paragraph(section.shareText));

  section.items?.forEach((item) => {
    if (typeof item === "string") body.push(bullet([{ text: item }]));
    else body.push(bullet([{ text: `${item.label ?? ""} `, bold: true }, { text: item.text ?? "" }]));
  });

  section.rights?.forEach((right) =>
    body.push(bullet([{ text: `${right.title}: `, bold: true }, { text: right.description }])),
  );

  section.subsections?.forEach((sub) => {
    body.push(subheading(sub.title));
    if (sub.intro) body.push(paragraph(sub.intro));
    sub.items?.forEach((item) => body.push(bullet([{ text: item }])));
  });

  if (section.contactText) body.push(paragraph(section.contactText));
  if (section.footer) body.push(paragraph(section.footer));

  return body;
};

const legalSections = (sections: LegalSectionSource[]) =>
  sections.map((section) => ({
    _type: "legalSection",
    _key: key(),
    title: section.title,
    summary: section.description,
    body: legalBody(section),
  }));

// --- Documents ---------------------------------------------------------------

async function main() {
  const { about, contact, privacy, terms, features, project } = contentConfig;

  console.log("Uploading the default share image...");
  const ogAsset = await client.assets.upload("image", readFileSync("public/OpenStream.png"), {
    filename: "OpenStream.png",
  });

  const siteSettings = {
    _id: "siteSettings",
    _type: "siteSettings",
    siteName: project.name,
    tagline: "An open-source live streaming platform",
    defaultSeoTitle: "Live Streaming Platform",
    defaultSeoDescription:
      "Watch live streams, interact with your favorite creators, and join a thriving community",
    defaultOgImage: {
      _type: "imageWithAlt",
      asset: { _type: "reference", _ref: ogAsset._id },
      alt: "OpenStream — live streaming platform",
    },
    notFoundHeading: "404",
    notFoundMessage: "We couldn't find the page you were looking for.",
    notFoundLinkLabel: "Go back home",
  };

  const globalConfig = {
    _id: "globalConfig",
    _type: "globalConfig",
    // Every analytics ID stays empty — empty means the tool never loads.
    scriptsRequireConsent: true,
    consentEnabled: false,
    consentMessage:
      "We use cookies to understand how OpenStream is used and to improve it. You can accept or decline.",
    consentAcceptLabel: "Accept",
    consentDeclineLabel: "Decline",
    consentPolicyUrl: "/privacy",
    maintenanceEnabled: false,
    maintenanceHeading: "We will be right back",
    maintenanceMessage: "OpenStream is getting an update. Please check back in a few minutes.",
  };

  const aboutPage = {
    _id: "aboutPage",
    _type: "aboutPage",
    heading: heading(about.hero.title),
    intro: about.hero.subtitle,
    missionTitle: about.mission.title,
    missionBody: about.mission.paragraphs.map(paragraph),
    techStackTitle: about.techStack.title,
    techStack: about.techStack.items.map((item) => ({ _type: "techItem", _key: key(), ...item })),
    keyFeaturesTitle: about.features.title,
    keyFeatures: about.features.items,
    openSourceTitle: about.openSource.title,
    openSourceBody: [paragraph(about.openSource.description)],
    openSourceBadges: about.openSource.badges,
    repositoryCta: externalCta(about.openSource.githubButtonText, project.githubUrl),
    ctaTitle: about.cta.title,
    ctaSubtitle: about.cta.subtitle,
    ctaButtons: [
      { _key: key(), ...internalCta(about.cta.buttons.features, "/features") },
      { _key: key(), ...internalCta(about.cta.buttons.contact, "/contact", "outline") },
    ],
    seo: seo("About", about.description),
  };

  const contactPage = {
    _id: "contactPage",
    _type: "contactPage",
    heading: heading(contact.hero.title),
    intro: contact.hero.subtitle,
    methods: contact.methods.map((method) => ({
      _type: "contactMethod",
      _key: key(),
      title: method.title,
      description: method.description,
      cta: externalCta(
        ("linkText" in method ? method.linkText : undefined) ??
          ("buttonText" in method ? method.buttonText : undefined) ??
          method.title,
        method.link,
        "outline",
      ),
    })),
    formTitle: contact.form.title,
    formDescription: contact.form.description,
    seo: seo("Contact", contact.description),
  };

  const featuresPage = {
    _id: "featuresPage",
    _type: "featuresPage",
    heading: heading(features.hero.title),
    intro: features.hero.subtitle,
    repositoryCta: externalCta(features.github.buttonText, project.githubUrl),
    contributeTitle: features.github.title,
    contributeDescription: features.github.description,
    currentTitle: features.currentFeatures.title,
    currentSubtitle: features.currentFeatures.subtitle,
    featureGroups: currentFeatures.map((group) => ({
      _type: "featureGroup",
      _key: key(),
      category: group.category,
      features: group.features.map((feature) => ({ _type: "feature", _key: key(), ...feature })),
    })),
    roadmapTitle: features.futureFeatures.title,
    roadmapSubtitle: features.futureFeatures.subtitle,
    roadmapGroups: futureFeatures.map((group) => ({
      _type: "roadmapGroup",
      _key: key(),
      priority: group.priority,
      blurb:
        features.futureFeatures.priorities[
          group.priority as keyof typeof features.futureFeatures.priorities
        ],
      features: group.features.map((feature) => ({
        _type: "plannedFeature",
        _key: key(),
        name: feature.name,
        description: feature.description,
        status: feature.status,
      })),
    })),
    suggestionTitle: features.suggestionForm.title,
    suggestionDescription: features.suggestionForm.description,
    seo: seo("Features & Roadmap", features.description),
  };

  const privacyPage = {
    _id: "legalPage-privacy",
    _type: "legalPage",
    slug: { _type: "slug", current: "privacy" },
    heading: heading(privacy.hero.title),
    intro: privacy.hero.subtitle,
    showLastUpdated: true,
    highlights: privacy.quickOverview.map((item) => ({
      _type: "highlight",
      _key: key(),
      title: item.title,
      description: item.description,
    })),
    sections: legalSections(privacy.sections as LegalSectionSource[]),
    seo: seo("Privacy Policy", privacy.description),
  };

  const termsPage = {
    _id: "legalPage-terms",
    _type: "legalPage",
    slug: { _type: "slug", current: "terms" },
    heading: heading(terms.hero.title),
    intro: terms.hero.subtitle,
    notice: terms.alert.message,
    showLastUpdated: true,
    sections: legalSections(terms.sections as LegalSectionSource[]),
    seo: seo("Terms of Service", terms.description),
  };

  const docs: { _id: string; _type: string; [field: string]: unknown }[] = [
    siteSettings,
    globalConfig,
    aboutPage,
    contactPage,
    featuresPage,
    privacyPage,
    termsPage,
  ];

  const transaction = client.transaction();
  docs.forEach((doc) => transaction.createOrReplace(doc));
  await transaction.commit();

  console.log(`Seeded ${docs.length} documents:`);
  docs.forEach((doc) => console.log(`  ${doc._type.padEnd(14)} ${doc._id}`));
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
