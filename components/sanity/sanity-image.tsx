import Image from "next/image";

import { cn } from "@/lib/utils";
import type { SanityImage as SanityImageType } from "@/sanity/types";

/**
 * The one way a CMS image reaches the page (AK-CMS-027, AK-PERF-010).
 *
 * Explicit dimensions come from the asset metadata so the browser reserves the
 * space and nothing shifts on load. Alt comes from the media item itself, and
 * is passed explicitly rather than through the spread so it is statically
 * visible to the a11y lint rule.
 *
 * No image, no element (AK-CMS-001) — never a placeholder standing in for
 * content an editor did not supply.
 */
type Props = {
  image?: SanityImageType | null;
  className?: string;
  sizes?: string;
  /** Only for an image that is genuinely the LCP element (AK-NXT-010). */
  preload?: boolean;
  fill?: boolean;
};

export const SanityImage = ({ image, className, sizes, preload, fill }: Props) => {
  if (!image?.url) return null;

  const alt = image.alt ?? "";
  const blur = image.lqip
    ? { placeholder: "blur" as const, blurDataURL: image.lqip }
    : {};

  // Without real dimensions there is nothing to reserve space with, so fall
  // back to fill rather than guessing numbers that would cause a shift.
  const useFill = fill || !image.width || !image.height;

  if (useFill) {
    return (
      <Image
        src={image.url}
        alt={alt}
        fill
        className={cn(className)}
        sizes={sizes}
        preload={preload}
        {...blur}
      />
    );
  }

  return (
    <Image
      src={image.url}
      alt={alt}
      width={image.width as number}
      height={image.height as number}
      className={cn(className)}
      sizes={sizes}
      preload={preload}
      {...blur}
    />
  );
};
