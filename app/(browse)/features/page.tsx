import { Metadata } from "next";
import { CurrentFeatures } from "./_components/current-features";
import { FutureFeatures } from "./_components/future-features";
import { SuggestionForm } from "./_components/suggestion-form";
import { contentConfig } from "@/lib/content-config";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github } from "@/components/icons/github";

import { Heading } from "@/components/sanity/heading";
import { getFeaturesPage } from "@/sanity/pages";
import { buildPageMetadata } from "@/sanity/seo";
import { getSiteSettings } from "@/sanity/settings";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getFeaturesPage(), getSiteSettings()]);

  return buildPageMetadata({
    seo: page?.seo,
    settings,
    fallbackTitle: contentConfig.features.title,
    fallbackDescription: contentConfig.features.description,
    path: "/features",
  });
}

export default async function FeaturesPage() {
  const { features, project } = contentConfig;
  const page = await getFeaturesPage();

  const heading = page?.heading?.length
    ? page.heading
    : [{ text: features.hero.title, style: "default", tag: "h1" }];
  const intro = page?.intro ?? features.hero.subtitle;

  return (
    <main className="container max-w-7xl mx-auto py-10 px-4">
      <header className="text-center mb-12">
        <Heading segments={heading} sizeClassName="text-4xl font-bold mb-4" />
        {intro ? (
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{intro}</p>
        ) : null}
      </header>

      <CurrentFeatures
        title={page?.currentTitle}
        subtitle={page?.currentSubtitle}
        groups={page?.featureGroups}
      />
      <FutureFeatures
        title={page?.roadmapTitle}
        subtitle={page?.roadmapSubtitle}
        groups={page?.roadmapGroups}
      />

      {/* GitHub Contribution Section */}
      <section className="mb-20">
        <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-primary/10">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/20 mx-auto mb-4">
              <Github className="size-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{page?.contributeTitle ?? features.github.title}</CardTitle>
            <CardDescription className="text-base max-w-2xl mx-auto">
              {page?.contributeDescription ?? features.github.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button size="lg" asChild>
              <a
                href={page?.repositoryCta?.href ?? project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 size-5" />
                {page?.repositoryCta?.label ?? features.github.buttonText}
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      <SuggestionForm title={page?.suggestionTitle} description={page?.suggestionDescription} />
    </main>
  );
}