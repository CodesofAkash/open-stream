import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

import { cn } from "@/lib/utils";

/**
 * Renders the CMS rich-text format with THIS project's link and mark styling
 * (AK-SAN-040) — never the library defaults left unchecked, which render
 * unstyled anchors that do not match anything else on the page.
 *
 * Internal links go through next/link (AK-NXT-009); external ones carry
 * rel="noopener noreferrer" (AK-SEC-006).
 */

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="leading-relaxed">{children}</p>,
    h2: ({ children }) => <h2 className="text-2xl font-semibold mt-8 mb-3">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-semibold mt-6 mb-2">{children}</h3>,
    h4: ({ children }) => <h4 className="text-lg font-semibold mt-4 mb-2">{children}</h4>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-primary pl-4 italic text-muted-foreground">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-6 space-y-1">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-6 space-y-1">{children}</ol>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{children}</code>
    ),
    link: ({ children, value }) => {
      const href: string = value?.href ?? "";
      if (!href) return <>{children}</>;

      const isExternal = /^https?:\/\//i.test(href);
      const className = "text-primary underline underline-offset-4 hover:no-underline";

      if (isExternal) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
            {children}
          </a>
        );
      }

      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      );
    },
  },
};

type Props = {
  value?: PortableTextBlock[] | null;
  className?: string;
};

export const RichText = ({ value, className }: Props) => {
  if (!value || value.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      <PortableText value={value} components={components} />
    </div>
  );
};
