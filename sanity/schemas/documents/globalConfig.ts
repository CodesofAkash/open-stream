import { defineField, defineType } from "sanity";
import { SlidersHorizontal } from "lucide-react";

/**
 * Switches, third-party IDs and editor-pasted scripts (AK-SAN-058).
 *
 * Deliberately separate from siteSettings and never translated. An analytics ID
 * copied into several documents can drift, and then one of them double-counts
 * or stops reporting with nothing to show for it. A maintenance switch that
 * lives per-locale can be on in one language and off in another — the site is
 * half down and the Studio says everything is fine.
 *
 * The test: if someone translating the site would have no reason to change a
 * field, it belongs here.
 *
 * Every field is optional and empty means OFF. A blank analytics ID must load
 * no script and make no request — that is what makes shipping the whole surface
 * free (AK-SAN-057).
 */
export const globalConfig = defineType({
  name: "globalConfig",
  title: "Global configuration",
  type: "document",
  icon: SlidersHorizontal,
  groups: [
    { name: "analytics", title: "Analytics", default: true },
    { name: "scripts", title: "Custom scripts" },
    { name: "consent", title: "Cookie consent" },
    { name: "maintenance", title: "Maintenance mode" },
  ],
  fields: [
    // --- Analytics -------------------------------------------------------
    defineField({
      name: "ga4MeasurementId",
      title: "Google Analytics 4 measurement ID",
      type: "string",
      group: "analytics",
      description:
        "Looks like G-XXXXXXXXXX, from Google Analytics -> Admin -> Data streams. Leave empty and Google Analytics never loads at all.",
    }),
    defineField({
      name: "gtmContainerId",
      title: "Google Tag Manager container ID",
      type: "string",
      group: "analytics",
      description:
        "Looks like GTM-XXXXXXX. Only needed if you manage tags through GTM rather than adding them here. Leave empty and GTM never loads.",
    }),
    defineField({
      name: "metaPixelId",
      title: "Meta (Facebook) Pixel ID",
      type: "string",
      group: "analytics",
      description:
        "15-16 digits, from Meta Events Manager. Leave empty and the Pixel never loads. This one sets cookies, so it only fires after consent.",
    }),
    defineField({
      name: "posthogApiKey",
      title: "PostHog project API key",
      type: "string",
      group: "analytics",
      description:
        "Starts with phc_, from PostHog -> Project settings. Product analytics: funnels, retention, session behaviour. Leave empty and PostHog never loads.",
    }),

    // --- Custom scripts --------------------------------------------------
    defineField({
      name: "headScripts",
      title: "Scripts for <head>",
      type: "text",
      rows: 6,
      group: "scripts",
      description:
        "Raw script or embed markup pasted from a third party, injected into the page head. This runs code on every page — only paste from sources you trust.",
    }),
    defineField({
      name: "bodyScripts",
      title: "Scripts for end of <body>",
      type: "text",
      rows: 6,
      group: "scripts",
      description:
        "Same as above but injected at the end of the body, which is where most vendors ask for their snippet.",
    }),
    defineField({
      name: "scriptsRequireConsent",
      title: "These scripts need cookie consent",
      type: "boolean",
      group: "scripts",
      description:
        "Turn ON if the pasted scripts set cookies or track people. They then only run after a visitor accepts. When in doubt, leave this on.",
      initialValue: true,
    }),

    // --- Cookie consent --------------------------------------------------
    defineField({
      name: "consentEnabled",
      title: "Ask for cookie consent",
      type: "boolean",
      group: "consent",
      description:
        "Turn ON to show the consent banner. Required for visitors in the EU/UK. IMPORTANT: while this is OFF, no cookie-setting analytics loads at all — consent is never assumed from silence.",
      initialValue: false,
    }),
    defineField({
      name: "consentMessage",
      title: "Banner message",
      type: "text",
      rows: 3,
      group: "consent",
      description: "The text in the banner. Say plainly what is collected and why.",
    }),
    defineField({
      name: "consentAcceptLabel",
      title: "Accept button label",
      type: "string",
      group: "consent",
      initialValue: "Accept",
      description: "Shown on the button that grants consent.",
    }),
    defineField({
      name: "consentDeclineLabel",
      title: "Decline button label",
      type: "string",
      group: "consent",
      initialValue: "Decline",
      description: "Shown on the button that refuses. It must be as easy to refuse as to accept.",
    }),
    defineField({
      name: "consentPolicyUrl",
      title: "Privacy policy link",
      type: "string",
      group: "consent",
      initialValue: "/privacy",
      description: "Where the banner's \"read more\" goes. Usually /privacy.",
    }),

    // --- Maintenance mode ------------------------------------------------
    defineField({
      name: "maintenanceEnabled",
      title: "Site is in maintenance",
      type: "boolean",
      group: "maintenance",
      description:
        "Turn ON to replace every public page with the holding message below. The Studio stays reachable so you can turn it back off — you cannot lock yourself out.",
      initialValue: false,
    }),
    defineField({
      name: "maintenanceHeading",
      title: "Holding page heading",
      type: "string",
      group: "maintenance",
      initialValue: "We will be right back",
      description: "The large text on the holding page.",
    }),
    defineField({
      name: "maintenanceMessage",
      title: "Holding page message",
      type: "text",
      rows: 3,
      group: "maintenance",
      description: "The explanation underneath. Give people an idea of how long, if you can.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Global configuration" }),
  },
});
