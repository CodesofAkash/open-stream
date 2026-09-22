import { defineField, defineType } from "sanity";
import { Image as ImageIcon } from "lucide-react";

/**
 * Every image field in the project is this type (AK-SAN-042). Never a bare
 * `type: "image"` — one exception means every consumer handles two shapes
 * forever.
 *
 * Alt text is enforced via Rule.custom rather than Rule.required so that an
 * empty image field stays valid; it is only required once an asset is set.
 */
export const imageWithAlt = defineType({
  name: "imageWithAlt",
  title: "Image",
  type: "image",
  icon: ImageIcon,
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description:
        "What the image shows, for screen readers and for when it fails to load. Describe the content, not the file — \"a streamer at a desk\", not \"hero image\". Leave empty only if the image is purely decorative.",
      validation: (Rule) =>
        Rule.custom((alt, context) => {
          const parent = context.parent as { asset?: { _ref?: string } } | undefined;
          if (parent?.asset?._ref && !alt) {
            return "Alt text is required once an image is set.";
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: { title: "alt", media: "asset" },
    prepare: ({ title, media }) => ({ title: title || "Image", media }),
  },
});
