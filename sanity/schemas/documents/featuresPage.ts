import { defineArrayMember, defineField, defineType } from "sanity";
import { Sparkles } from "lucide-react";

export const featuresPage = defineType({
  name: "featuresPage",
  title: "Features page",
  type: "document",
  icon: Sparkles,
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "current", title: "Shipped" },
    { name: "roadmap", title: "Roadmap" },
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
      name: "repositoryCta",
      title: "Repository button",
      type: "ctaBtn",
      group: "hero",
      description: "Links to the source code. Leave empty and no button renders.",
    }),
    defineField({
      name: "currentTitle",
      title: "Shipped heading",
      type: "string",
      group: "current",
      description: "Heading above the list of features that already exist.",
    }),
    defineField({
      name: "featureGroups",
      title: "Feature groups",
      type: "array",
      group: "current",
      of: [
        defineArrayMember({
          type: "object",
          name: "featureGroup",
          fields: [
            defineField({
              name: "category",
              type: "string",
              title: "Category",
              description: "For example: Core platform, or User features.",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "features",
              type: "array",
              title: "Features",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "feature",
                  fields: [
                    defineField({
                      name: "name",
                      type: "string",
                      title: "Name",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: "description",
                      type: "string",
                      title: "Description",
                      description: "One line on what it does for the person using it.",
                    }),
                    defineField({
                      name: "tech",
                      type: "array",
                      title: "Technologies",
                      of: [defineArrayMember({ type: "string" })],
                      description: "Small pills under the feature, naming what it is built on.",
                    }),
                  ],
                  preview: { select: { title: "name", subtitle: "description" } },
                }),
              ],
            }),
          ],
          preview: { select: { title: "category" } },
        }),
      ],
      description: "Grouped by category, in the order shown here.",
    }),
    defineField({
      name: "roadmapTitle",
      title: "Roadmap heading",
      type: "string",
      group: "roadmap",
      description: "Heading above the planned work.",
    }),
    defineField({
      name: "roadmapGroups",
      title: "Roadmap groups",
      type: "array",
      group: "roadmap",
      of: [
        defineArrayMember({
          type: "object",
          name: "roadmapGroup",
          fields: [
            defineField({
              name: "priority",
              type: "string",
              title: "Priority",
              description: "Groups the list into bands. Order them here as you want them read.",
              options: {
                list: [
                  { title: "High", value: "High" },
                  { title: "Medium", value: "Medium" },
                  { title: "Low", value: "Low" },
                ],
                layout: "radio",
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "blurb",
              type: "string",
              title: "Blurb",
              description: "One line explaining what this priority band means.",
            }),
            defineField({
              name: "features",
              type: "array",
              title: "Planned features",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "plannedFeature",
                  fields: [
                    defineField({
                      name: "name",
                      type: "string",
                      title: "Name",
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({ name: "description", type: "string", title: "Description" }),
                  ],
                  preview: { select: { title: "name", subtitle: "description" } },
                }),
              ],
            }),
          ],
          preview: { select: { title: "priority", subtitle: "blurb" } },
        }),
      ],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Features page" }) },
});
