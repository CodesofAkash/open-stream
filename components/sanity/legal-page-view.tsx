import type { PortableTextBlock } from "@portabletext/types";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LegalPage } from "@/sanity/types";

import { Heading } from "./heading";
import { RichText } from "./rich-text";

/**
 * Renders a legal page that comes from the CMS.
 *
 * The shipped privacy and terms pages have bespoke nested structures built from
 * constants. Rather than flatten those into this shape and change how they
 * look, each route keeps its existing rendering and only uses this view once an
 * editor has actually created the document — see the note in lib/content/legal.ts.
 */
type Props = {
  page: LegalPage;
  /** The icon each route already shows above its heading. */
  icon?: React.ReactNode;
};

export const LegalPageView = ({ page, icon }: Props) => (
  <article className="space-y-8">
    <header className="text-center space-y-4">
      {icon ? (
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
          {icon}
        </div>
      ) : null}

      <Heading segments={page.heading} sizeClassName="text-4xl font-bold" />

      {page.intro ? (
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{page.intro}</p>
      ) : null}

      {page.showLastUpdated && page._updatedAt ? (
        <p className="text-sm text-muted-foreground">
          Last updated:{" "}
          <time dateTime={page._updatedAt}>
            {new Date(page._updatedAt).toLocaleDateString()}
          </time>
        </p>
      ) : null}
    </header>

    {page.notice ? (
      <Alert>
        <AlertDescription>{page.notice}</AlertDescription>
      </Alert>
    ) : null}

    {page.highlights && page.highlights.length > 0 ? (
      <div className="grid md:grid-cols-3 gap-4">
        {page.highlights.map((highlight, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{highlight.title}</CardTitle>
            </CardHeader>
            {highlight.description ? (
              <CardContent>
                <p className="text-sm text-muted-foreground">{highlight.description}</p>
              </CardContent>
            ) : null}
          </Card>
        ))}
      </div>
    ) : null}

    {page.sections && page.sections.length > 0 ? (
      <div className="space-y-6">
        {page.sections.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-xl">{section.title}</CardTitle>
              {section.summary ? <CardDescription>{section.summary}</CardDescription> : null}
            </CardHeader>
            {section.body ? (
              <CardContent className="text-muted-foreground">
                <RichText value={section.body as PortableTextBlock[]} />
              </CardContent>
            ) : null}
          </Card>
        ))}
      </div>
    ) : null}
  </article>
);
