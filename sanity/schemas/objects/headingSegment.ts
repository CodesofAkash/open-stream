import { defineField, defineType } from "sanity";
import { Heading1 } from "lucide-react";

import { HEADING_STYLES, HEADING_TAGS } from "../constants";

/**
 * Every heading field in the project is an array of these (AK-SAN-042), even a
 * plain one-segment heading. One shape means every consumer handles one shape.
 *
 * Only the FIRST segment's `tag` sets the semantic level for the whole heading;
 * the rest are styling spans inside it.
 */
export const headingSegment = defineType({
  name: "headingSegment",
  title: "Heading segment",
  type: "object",
  icon: Heading1,
  fields: [
    defineField({
      name: "text",
      title: "Text",
      type: "string",
      description:
        "One run of heading text. Split a heading into several segments only when part of it needs different styling — otherwise use one.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "style",
      title: "Style",
      type: "string",
      description:
        "Visual treatment for this run only. Accent picks up the brand colour; it does not change the heading level.",
      options: { list: [...HEADING_STYLES], layout: "radio" },
      initialValue: "default",
    }),
    defineField({
      name: "tag",
      title: "Heading level",
      type: "string",
      description:
        "Only read from the FIRST segment, where it sets the level for the whole heading. One h1 per page; going straight from h1 to h4 is a real accessibility fault, not a style choice.",
      options: { list: [...HEADING_TAGS] },
      initialValue: "h2",
    }),
  ],
  preview: {
    select: { title: "text", subtitle: "tag" },
  },
});
