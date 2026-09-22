import { Metadata } from "next";
import { CurrentFeatures } from "./_components/current-features";
import { FutureFeatures } from "./_components/future-features";
import { SuggestionForm } from "./_components/suggestion-form";
import { contentConfig } from "@/lib/content-config";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github } from "@/components/icons/github";

export const metadata: Metadata = {
  title: contentConfig.features.title,
  description: contentConfig.features.description,
};

export default function FeaturesPage() {
  const { features, project } = contentConfig;

  return (
    <main className="container max-w-7xl mx-auto py-10 px-4">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{features.hero.title}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {features.hero.subtitle}
        </p>
      </header>

      <CurrentFeatures />
      <FutureFeatures />

      {/* GitHub Contribution Section */}
      <section className="mb-20">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mx-auto mb-4">
              <Github className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{features.github.title}</CardTitle>
            <CardDescription className="text-base max-w-2xl mx-auto">
              {features.github.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button size="lg" asChild>
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-5 w-5" />
                {features.github.buttonText}
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      <SuggestionForm />
    </main>
  );
}