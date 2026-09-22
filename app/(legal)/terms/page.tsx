import { Metadata } from "next";
import { Scale, FileText, AlertTriangle, UserCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { contentConfig } from "@/lib/content-config";
import { LegalPageView } from "@/components/sanity/legal-page-view";
import { getLegalPage } from "@/sanity/pages";
import { buildPageMetadata } from "@/sanity/seo";
import { getSiteSettings } from "@/sanity/settings";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    getLegalPage("terms"),
    getSiteSettings(),
  ]);

  return buildPageMetadata({
    seo: page?.seo,
    settings,
    fallbackTitle: contentConfig.terms.title,
    fallbackDescription: contentConfig.terms.description,
    path: "/terms",
  });
}

export default async function TermsPage() {
  const { terms } = contentConfig;

  // Once an editor publishes a "terms" legal page, it takes over entirely.
  const cmsPage = await getLegalPage("terms");
  if (cmsPage) {
    return <LegalPageView page={cmsPage} icon={<Scale className="size-8 text-primary" />} />;
  }

  return (
    <article className="space-y-8">
      {/* Hero */}
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Scale className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold">{terms.hero.title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {terms.hero.subtitle}
        </p>
        {terms.hero.lastUpdated && (
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        )}
      </header>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {terms.alert.message}
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {terms.sections.map((section, index) => {
          const IconComponent = section.icon === "UserCheck" ? UserCheck : section.icon === "FileText" ? FileText : null;
          
          return (
            <Card key={section.title}>
              <CardHeader>
                {IconComponent && <IconComponent className="w-8 h-8 text-primary mb-2" />}
                <CardTitle>{section.title}</CardTitle>
                {section.description && <CardDescription>{section.description}</CardDescription>}
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                {section.intro && <p>{section.intro}</p>}
                {section.paragraphs && section.paragraphs.map((para, pIdx) => (
                  <p key={pIdx}>
                    {para.bold && <strong className="text-foreground">{para.bold}</strong>}
                    {para.text && ` ${para.text}`}
                  </p>
                ))}
                {section.items && (
                  <ul className="list-disc pl-6 space-y-1">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {section.subsections && section.subsections.map((subsection) => (
                  <div key={subsection.title}>
                    <h4 className="font-semibold mb-2">{subsection.title}</h4>
                    {subsection.intro && <p className="text-muted-foreground mb-2">{subsection.intro}</p>}
                    {subsection.items && (
                      <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                        {subsection.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                {section.text && <p>{section.text}</p>}
                {section.footer && <p className="pt-2">{section.footer}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </article>
  );
}