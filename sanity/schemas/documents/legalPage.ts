import { defineArrayMember, defineField, defineType } from "sanity";
import { Scale } from "lucide-react";

/**
 * Privacy policy, terms — any page that is a heading plus a run of numbered
 * sections. Both existing legal pages share exactly this shape, so they share
 * one type rather than two near-identical ones.
 */
export const legalPage = defineType({
  name: "legalPage",
  title: "Legal page",
  type: "document",
  icon: Scale,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: {
        // A string path cannot reach into an array, so the source is a function
        // that joins the heading segments.
        source: (doc: Record<string, unknown>) => {
          const segments = doc.heading as { text?: string }[] | undefined;
          return (segments ?? []).map((segment) => segment?.text).filter(Boolean).join(" ");
        },
        maxLength: 96,
      },
      description:
        "The URL this page lives at. \"privacy\" serves /privacy. Changing it changes the public URL and breaks existing links.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heading",
      title: "Page heading",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "headingSegment" })],
      description: "The large heading at the top. Set the first segment's level to H1.",
      validation: (Rule) => Rule.min(1).warning("A page without a heading is hard to scan."),
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 3,
      group: "content",
      description: "The line under the heading. Leave empty and nothing renders there.",
    }),
    defineField({
      name: "notice",
      title: "Notice",
      type: "text",
      rows: 2,
      group: "content",
      description: "An optional highlighted box under the intro — for the one thing every reader must see. Leave empty and nothing renders.",
    }),
    defineField({
      name: "showLastUpdated",
      title: "Show the last-updated date",
      type: "boolean",
      group: "content",
      description:
        "Displays when this document was last published. Legal pages normally want this — it is how a reader knows which version they agreed to.",
      initialValue: true,
    }),
    defineField({
      name: "highlights",
      title: "Summary cards",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "highlight",
          fields: [
            defineField({
              name: "title",
              type: "string",
              title: "Title",
              description: "A few words, e.g. \"Your rights\".",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              type: "text",
              rows: 2,
              title: "Description",
              description: "One or two sentences in plain language.",
            }),
          ],
          preview: { select: { title: "title", subtitle: "description" } },
        }),
      ],
      description:
        "The plain-language summary above the legal text. Optional — leave the list empty and the whole block disappears.",
      validation: (Rule) => Rule.max(4).warning("More than four cards stops being a summary."),
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "legalSection",
          fields: [
            defineField({
              name: "title",
              type: "string",
              title: "Section title",
              description: "Numbered by hand, e.g. \"1. Information we collect\".",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "summary",
              type: "text",
              rows: 2,
              title: "Summary",
              description: "An optional one-liner under the section title.",
            }),
            defineField({
              name: "body",
              type: "richText",
              title: "Body",
              description:
                "The section text. Use bullet lists for anything that reads as a list — long paragraphs of legal prose go unread.",
            }),
          ],
          preview: { select: { title: "title", subtitle: "summary" } },
        }),
      ],
      description: "The body of the policy, in order.",
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: {
    select: { segments: "heading", slug: "slug.current" },
    prepare: ({ segments, slug }) => ({
      title:
        (segments as { text?: string }[] | undefined)
          ?.map((segment) => segment?.text)
          .filter(Boolean)
          .join(" ") || "Legal page",
      subtitle: slug ? `/${slug}` : undefined,
    }),
  },
});
