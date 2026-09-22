import { defineField, defineType } from "sanity";
import { Link as LinkIcon } from "lucide-react";

import { LINK_TYPES } from "../constants";

/**
 * Shared link behaviour. A type that needs link behaviour PLUS extra sibling
 * fields imports and spreads `linkFields` rather than duplicating them
 * (AK-SAN-042) — ctaBtn does exactly that.
 *
 * Links are resolved to { href, target } at the data layer, never in the
 * rendering component (AK-CMS-025).
 */
export const linkFields = [
  defineField({
    name: "label",
    title: "Label",
    type: "string",
    description: "The visible text. Say where it goes — \"Browse streams\" beats \"Click here\".",
    validation: (Rule) => Rule.required(),
  }),
  defineField({
    name: "linkType",
    title: "Link type",
    type: "string",
    description:
      "Internal links stay inside the app and navigate without a full page reload. External links open in a new tab.",
    options: { list: [...LINK_TYPES], layout: "radio" },
    initialValue: "internal",
  }),
  defineField({
    name: "internalPath",
    title: "Internal path",
    type: "string",
    description: "A path on this site, starting with a slash — /about, /search.",
    hidden: ({ parent }) => parent?.linkType !== "internal",
    validation: (Rule) =>
      Rule.custom((value, context) => {
        const parent = context.parent as { linkType?: string } | undefined;
        if (parent?.linkType !== "internal") return true;
        if (!value) return "An internal link needs a path.";
        return value.startsWith("/") || "Internal paths must start with /.";
      }),
  }),
  defineField({
    name: "externalUrl",
    title: "External URL",
    type: "url",
    description: "The full URL including https://. mailto: and tel: links work too.",
    hidden: ({ parent }) => parent?.linkType !== "external",
    validation: (Rule) =>
      Rule.uri({ scheme: ["http", "https", "mailto", "tel"] }).custom((value, context) => {
        const parent = context.parent as { linkType?: string } | undefined;
        if (parent?.linkType !== "external") return true;
        return value ? true : "An external link needs a URL.";
      }),
  }),
];

export const link = defineType({
  name: "link",
  title: "Link",
  type: "object",
  icon: LinkIcon,
  fields: linkFields,
  preview: {
    select: { title: "label", linkType: "linkType", internal: "internalPath", external: "externalUrl" },
    prepare: ({ title, linkType, internal, external }) => ({
      title: title || "Link",
      subtitle: linkType === "external" ? external : internal,
    }),
  },
});
