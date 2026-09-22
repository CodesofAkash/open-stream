import { defineArrayMember, defineField, defineType } from "sanity";
import { Settings } from "lucide-react";

/**
 * Site-wide identity, navigation, SEO defaults and 404 copy — the words half of
 * the settings surface (AK-SAN-058). Switches and third-party IDs live in
 * globalConfig instead, so a translated copy of this document can never
 * disagree with another about whether the site is in maintenance.
 *
 * The whole surface ships at setup, not on request (AK-SAN-057). Each field is
 * individually easy to defer and deferring it is invisible: a missing OG image
 * is not an error, every share is just a blank card.
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: Settings,
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "navigation", title: "Navigation" },
    { name: "seo", title: "SEO defaults" },
    { name: "notFound", title: "404 page" },
  ],
  fields: [
    // --- Identity --------------------------------------------------------
    defineField({
      name: "siteName",
      title: "Site name",
      type: "string",
      group: "identity",
      description:
        "The brand name. Appears in the browser tab after every page title, and wherever the site refers to itself.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "identity",
      description: "One short line describing what the site is. Shown under the name in the footer.",
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "imageWithAlt",
      group: "identity",
      description: "Shown in the header. An SVG or a transparent PNG works best.",
    }),

    // --- Navigation ------------------------------------------------------
    defineField({
      name: "headerLinks",
      title: "Header links",
      type: "array",
      group: "navigation",
      of: [defineArrayMember({ type: "link" })],
      description: "The main navigation. Keep it short — four or five at most before it stops being scannable.",
      validation: (Rule) => Rule.max(6).warning("More than six header links is hard to scan."),
    }),
    defineField({
      name: "footerLinks",
      title: "Footer links",
      type: "array",
      group: "navigation",
      of: [defineArrayMember({ type: "link" })],
      description: "Secondary links in the footer — legal pages, about, contact.",
    }),
    defineField({
      name: "socialLinks",
      title: "Social profiles",
      type: "array",
      group: "navigation",
      of: [defineArrayMember({ type: "link" })],
      description:
        "Profiles on other platforms. These also become the sameAs list in the site's structured data, which is how search engines connect this site to those accounts.",
    }),

    // --- SEO defaults ----------------------------------------------------
    defineField({
      name: "defaultSeoTitle",
      title: "Default meta title",
      type: "string",
      group: "seo",
      description:
        "Used by any page that does not set its own. Do NOT include the site name — it is appended automatically.",
      validation: (Rule) => Rule.max(60).warning("Longer than 60 characters will be truncated in search results."),
    }),
    defineField({
      name: "defaultSeoDescription",
      title: "Default meta description",
      type: "text",
      rows: 3,
      group: "seo",
      description: "Used by any page that does not set its own. Around 155 characters.",
      validation: (Rule) => Rule.max(155).warning("Longer than 155 characters will be truncated in search results."),
    }),
    defineField({
      name: "defaultOgImage",
      title: "Default social share image",
      type: "imageWithAlt",
      group: "seo",
      description:
        "The fallback card shown whenever a page is shared and has no image of its own. 1200x630. Without this every share is a blank rectangle.",
    }),

    // --- 404 -------------------------------------------------------------
    defineField({
      name: "notFoundHeading",
      title: "404 heading",
      type: "string",
      group: "notFound",
      initialValue: "Page not found",
      description: "Shown when someone reaches a URL that does not exist.",
    }),
    defineField({
      name: "notFoundMessage",
      title: "404 message",
      type: "text",
      rows: 2,
      group: "notFound",
      description: "The explanation underneath. Keep it human — the visitor did not do anything wrong.",
    }),
    defineField({
      name: "notFoundLinkLabel",
      title: "404 link label",
      type: "string",
      group: "notFound",
      initialValue: "Back to home",
      description: "The label on the button that takes them somewhere useful.",
    }),
  ],
  preview: {
    select: { title: "siteName" },
    prepare: ({ title }) => ({ title: title || "Site settings" }),
  },
});
