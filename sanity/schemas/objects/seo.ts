import { defineField, defineType } from "sanity";
import { Search } from "lucide-react";

/**
 * Per-page SEO overrides. Every field falls back to the site default
 * individually, not all-or-nothing (AK-CMS-029) — a page missing only an OG
 * image still keeps its own title and description.
 */
export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  icon: Search,
  fields: [
    defineField({
      name: "title",
      title: "Meta title",
      type: "string",
      description:
        "Shown in the browser tab and as the search result headline. Around 60 characters before Google truncates it. Do NOT add \"| OpenStream\" — that is appended automatically, and typing it here gives you it twice. Empty falls back to the site default.",
      validation: (Rule) => Rule.max(60).warning("Longer than 60 characters will be truncated in search results."),
    }),
    defineField({
      name: "description",
      title: "Meta description",
      type: "text",
      rows: 3,
      description:
        "The grey text under the search result. Around 155 characters. It does not affect ranking, but it decides whether anyone clicks. Empty falls back to the site default.",
      validation: (Rule) => Rule.max(155).warning("Longer than 155 characters will be truncated in search results."),
    }),
    defineField({
      name: "ogImage",
      title: "Social share image",
      type: "imageWithAlt",
      description:
        "Shown when this page is shared on social media or in chat. 1200x630 works everywhere. Empty falls back to the site-wide share image.",
    }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines",
      type: "boolean",
      description:
        "Turn ON to keep this page OUT of Google. Leave off for anything you want found. This is the opposite polarity to how it appears in the page source, so read it as written here.",
      initialValue: false,
    }),
    defineField({
      name: "noFollow",
      title: "Tell search engines not to follow links on this page",
      type: "boolean",
      description:
        "Rarely needed. Turn ON only for pages full of untrusted or user-submitted links.",
      initialValue: false,
    }),
  ],
  options: { collapsible: true, collapsed: true },
});
