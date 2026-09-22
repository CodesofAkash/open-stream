import { cn } from "@/lib/utils";
import type { HeadingSegment } from "@/sanity/types";

/**
 * Renders the CMS heading shape. The semantic level comes from the DATA (the
 * first segment's tag), the size from a token — the two are independent, so an
 * h2 can look large without a page growing a second h1.
 *
 * Presence of data decides visibility (AK-CMS-001): no segments, no element.
 */

const STYLE_CLASSES: Record<string, string> = {
  default: "",
  accent: "text-primary",
  muted: "text-muted-foreground",
};

type Props = {
  segments?: HeadingSegment[] | null;
  className?: string;
  /** Overrides the size only. The tag still comes from the data. */
  sizeClassName?: string;
};

export const Heading = ({ segments, className, sizeClassName }: Props) => {
  const items = (segments ?? []).filter((segment) => segment?.text);
  if (items.length === 0) return null;

  // Only the first segment's tag sets the level for the whole heading.
  const Tag = (items[0]?.tag ?? "h2") as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

  return (
    <Tag className={cn(sizeClassName, className)}>
      {items.map((segment, index) => (
        <span key={index} className={STYLE_CLASSES[segment.style ?? "default"] ?? ""}>
          {segment.text}
          {index < items.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
};
