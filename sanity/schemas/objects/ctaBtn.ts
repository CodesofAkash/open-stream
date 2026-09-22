import { defineField, defineType } from "sanity";
import { MousePointerClick } from "lucide-react";

import { BUTTON_VARIANTS } from "../constants";
import { linkFields } from "./link";

/**
 * Every button field is this type (AK-SAN-042). Never hand-roll button fields.
 * Reuses linkFields so link behaviour is defined once.
 */
export const ctaBtn = defineType({
  name: "ctaBtn",
  title: "Button",
  type: "object",
  icon: MousePointerClick,
  fields: [
    ...linkFields,
    defineField({
      name: "variant",
      title: "Style",
      type: "string",
      description:
        "Primary is the main action on a screen — use one per section. The rest are for supporting actions.",
      options: { list: [...BUTTON_VARIANTS] },
      initialValue: "default",
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "variant" },
    prepare: ({ title, subtitle }) => ({ title: title || "Button", subtitle }),
  },
});
