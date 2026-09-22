import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { ResolvedCta, ResolvedLink } from "@/sanity/types";

/**
 * Renders an already-resolved { href, target } (AK-CMS-025) — resolution
 * happens in the GROQ projection, not here.
 *
 * Internal navigation goes through next/link (AK-NXT-009): a raw <a href="/…">
 * is a full page reload with no prefetch. A link that should look like a button
 * is <Button asChild><Link>, never a <button onClick={router.push}> — that
 * breaks middle-click and open-in-new-tab and announces the wrong role.
 */

type LinkProps = { link?: ResolvedLink | null; className?: string };

export const CmsLink = ({ link, className }: LinkProps) => {
  if (!link?.href || !link.label) return null;

  if (link.isExternal) {
    return (
      <a
        href={link.href}
        target={link.target ?? "_blank"}
        rel="noopener noreferrer"
        className={className}
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
};

type CtaProps = { cta?: ResolvedCta | null; className?: string };

const VARIANTS = new Set(["default", "secondary", "outline", "ghost", "link"]);

export const CmsCta = ({ cta, className }: CtaProps) => {
  if (!cta?.href || !cta.label) return null;

  const variant = (VARIANTS.has(cta.variant ?? "") ? cta.variant : "default") as
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "link";

  return (
    <Button asChild variant={variant} className={className}>
      {cta.isExternal ? (
        <a href={cta.href} target={cta.target ?? "_blank"} rel="noopener noreferrer">
          {cta.label}
        </a>
      ) : (
        <Link href={cta.href}>{cta.label}</Link>
      )}
    </Button>
  );
};
