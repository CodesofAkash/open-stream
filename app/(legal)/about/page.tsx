import { Metadata } from "next";
import { Sparkles, Code2, Users, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Heading } from "@/components/sanity/heading";
import { RichText } from "@/components/sanity/rich-text";
import { CmsCta } from "@/components/sanity/cms-link";
import { resolveAboutContent } from "@/lib/content/about";
import { buildPageMetadata } from "@/sanity/seo";
import { getSiteSettings } from "@/sanity/settings";
import type { PortableTextBlock } from "@portabletext/types";

export async function generateMetadata(): Promise<Metadata> {
  const [content, settings] = await Promise.all([
    resolveAboutContent(),
    getSiteSettings(),
  ]);

  return buildPageMetadata({
    seo: content.seo,
    settings,
    path: "/about",
  });
}

export default async function AboutPage() {
  const content = await resolveAboutContent();

  return (
    <article className="space-y-12">
      {/* Hero */}
      <header className="text-center space-y-6">
        <div className="inline-flex items-center justify-center size-20 rounded-full bg-linear-to-br from-primary to-primary/50 mb-4">
          <Sparkles className="size-10 text-white" />
        </div>
        <div>
          <Heading
            segments={content.heading}
            sizeClassName="text-5xl font-bold mb-4 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
          />
          {content.intro ? (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {content.intro}
            </p>
          ) : null}
        </div>
      </header>

      {/* Mission */}
      {content.missionTitle || content.missionBody || content.missionParagraphs.length > 0 ? (
        <Card className="border-primary/20">
          {content.missionTitle ? (
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Users className="size-6 text-primary" />
                <CardTitle className="text-2xl">{content.missionTitle}</CardTitle>
              </div>
            </CardHeader>
          ) : null}
          <CardContent className="text-muted-foreground leading-relaxed space-y-4">
            {content.missionBody ? (
              <RichText value={content.missionBody as PortableTextBlock[]} />
            ) : (
              content.missionParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Tech Stack */}
      {content.techStack.length > 0 ? (
        <div>
          {content.techStackTitle ? (
            <div className="flex items-center gap-3 mb-6">
              <Code2 className="size-6 text-primary" />
              <h2 className="text-2xl font-bold">{content.techStackTitle}</h2>
            </div>
          ) : null}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.techStack.map((tech) => (
              <Card key={tech.name} className="hover:border-primary/50 transition-all">
                <CardHeader>
                  <CardTitle className="text-base">{tech.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tech.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      {/* Key features */}
      {content.keyFeatures.length > 0 ? (
        <div>
          {content.keyFeaturesTitle ? (
            <div className="flex items-center gap-3 mb-6">
              <Zap className="size-6 text-primary" />
              <h2 className="text-2xl font-bold">{content.keyFeaturesTitle}</h2>
            </div>
          ) : null}
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                {content.keyFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Open source */}
      {content.openSourceTitle || content.openSourceBody || content.openSourceText ? (
        <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
          {content.openSourceTitle ? (
            <CardHeader>
              <CardTitle className="text-2xl">{content.openSourceTitle}</CardTitle>
            </CardHeader>
          ) : null}
          <CardContent className="space-y-4">
            {content.openSourceBody ? (
              <RichText
                value={content.openSourceBody as PortableTextBlock[]}
                className="text-muted-foreground"
              />
            ) : content.openSourceText ? (
              <p className="text-muted-foreground">{content.openSourceText}</p>
            ) : null}

            {content.openSourceBadges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {content.openSourceBadges.map((badge) => (
                  <Badge key={badge} variant="secondary">
                    {badge}
                  </Badge>
                ))}
              </div>
            ) : null}

            {content.repositoryCta ? (
              <div className="pt-4">
                <CmsCta cta={content.repositoryCta} />
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {/* Closing CTA */}
      {content.ctaTitle || content.ctaButtons.length > 0 ? (
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            {content.ctaTitle ? (
              <h3 className="text-2xl font-bold mb-4">{content.ctaTitle}</h3>
            ) : null}
            {content.ctaSubtitle ? (
              <p className="text-muted-foreground mb-6">{content.ctaSubtitle}</p>
            ) : null}
            {content.ctaButtons.length > 0 ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {content.ctaButtons.map((cta, index) => (
                  <CmsCta key={index} cta={cta} className="h-11 px-8" />
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </article>
  );
}
