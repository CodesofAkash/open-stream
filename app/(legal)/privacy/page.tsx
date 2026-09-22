import { Metadata } from "next";
import { Shield, Lock, Eye, FileText, Mail } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { contentConfig } from "@/lib/content-config";
import { LegalPageView } from "@/components/sanity/legal-page-view";
import { getLegalPage } from "@/sanity/pages";
import { buildPageMetadata } from "@/sanity/seo";
import { getSiteSettings } from "@/sanity/settings";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([
    getLegalPage("privacy"),
    getSiteSettings(),
  ]);

  return buildPageMetadata({
    seo: page?.seo,
    settings,
    fallbackTitle: contentConfig.privacy.title,
    fallbackDescription: contentConfig.privacy.description,
    path: "/privacy",
  });
}

export default async function PrivacyPage() {
  const { privacy, project } = contentConfig;

  // Once an editor publishes a "privacy" legal page, it takes over entirely.
  // Until then the shipped copy renders exactly as before.
  const cmsPage = await getLegalPage("privacy");
  if (cmsPage) {
    return <LegalPageView page={cmsPage} icon={<Shield className="size-8 text-primary" />} />;
  }

  return (
    <article className="space-y-8">
      {/* Hero Section */}
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold">{privacy.hero.title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {privacy.hero.subtitle}
        </p>
        {privacy.hero.lastUpdated && (
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        )}
      </header>

      {/* Quick Overview Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {privacy.quickOverview.map((item) => {
          const Icon = item.icon === "Lock" ? Lock : item.icon === "Eye" ? Eye : FileText;
          return (
            <Card key={item.title}>
              <CardHeader>
                <Icon className="w-8 h-8 text-primary mb-2" />
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{privacy.sections[0].title}</CardTitle>
            <CardDescription>{privacy.sections[0].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {privacy.sections[0].subsections?.map((subsection) => (
              <div key={subsection.title}>
                <h4 className="font-semibold mb-2">{subsection.title}</h4>
                <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                  {subsection.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{privacy.sections[1].title}</CardTitle>
            <CardDescription>{privacy.sections[1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2">
              {privacy.sections[1].items?.map((item, idx) => (
                <li key={idx}>{typeof item === 'string' ? item : ''}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{privacy.sections[2].title}</CardTitle>
            <CardDescription>{privacy.sections[2].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">{privacy.sections[2].intro}</p>
              <p>{privacy.sections[2].shareText}</p>
              <ul className="list-disc pl-6 space-y-1">
                {privacy.sections[2].items?.map((item, idx) => (
                  <li key={idx}>
                    <strong>{typeof item === 'object' && 'label' in item ? item.label : ''}</strong> {typeof item === 'object' && 'text' in item ? item.text : item}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{privacy.sections[3].title}</CardTitle>
            <CardDescription>{privacy.sections[3].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {privacy.sections[3].rights?.map((right) => (
                <div key={right.title}>
                  <h4 className="font-semibold mb-2">{right.title}</h4>
                  <p className="text-muted-foreground">{right.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{privacy.sections[4].title}</CardTitle>
            <CardDescription>{privacy.sections[4].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="text-sm">
                  For privacy-related inquiries, please visit our{" "}
                  <Link href="/contact" className="text-primary hover:underline">
                    contact page
                  </Link>{" "}
                  or email us at{" "}
                  <a href={`mailto:${project.email.privacy}`} className="text-primary hover:underline">
                    {project.email.privacy}
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </article>
  );
}