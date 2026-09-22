import { defineArrayMember, defineField, defineType } from "sanity";
import { Mail } from "lucide-react";

/**
 * Note the line drawn here (AK-CMS-011): editorial copy — headings, the contact
 * methods, the form's own title and description — lives in the CMS. The form's
 * field labels and placeholders stay frontend constants, because they are
 * functional microcopy wired to validation and reworking them breaks the form.
 */
export const contactPage = defineType({
  name: "contactPage",
  title: "Contact page",
  type: "document",
  icon: Mail,
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "methods", title: "Contact methods" },
    { name: "form", title: "Form" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "heading",
      title: "Page heading",
      type: "array",
      group: "hero",
      of: [defineArrayMember({ type: "headingSegment" })],
      description: "The large heading at the top. Set the first segment's level to H1.",
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 2,
      group: "hero",
      description: "The line under the heading.",
    }),
    defineField({
      name: "methods",
      title: "Ways to get in touch",
      type: "array",
      group: "methods",
      of: [
        defineArrayMember({
          type: "object",
          name: "contactMethod",
          fields: [
            defineField({
              name: "title",
              type: "string",
              title: "Title",
              description: "For example: Email, or GitHub issues.",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              type: "string",
              title: "Description",
              description: "One line on when someone should use this route rather than another.",
            }),
            defineField({
              name: "cta",
              type: "ctaBtn",
              title: "Link",
              description:
                "Where it goes. Use an external link for mailto: addresses and off-site URLs.",
            }),
          ],
          preview: { select: { title: "title", subtitle: "description" } },
        }),
      ],
      description: "Shown as cards above the form. Leave the list empty and the block disappears.",
    }),
    defineField({
      name: "formTitle",
      title: "Form heading",
      type: "string",
      group: "form",
      description: "Heading above the message form.",
    }),
    defineField({
      name: "formDescription",
      title: "Form description",
      type: "text",
      rows: 2,
      group: "form",
      description:
        "Shown above the form. Field labels and placeholders are deliberately not editable here — they are wired to the form's validation.",
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Contact page" }) },
});
