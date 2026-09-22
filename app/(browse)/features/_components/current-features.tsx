import { currentFeatures } from "@/lib/features-data";
import { contentConfig } from "@/lib/content-config";
import type { FeaturesPage } from "@/sanity/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

type Props = {
  title?: string | null;
  groups?: FeaturesPage["featureGroups"];
};

export const CurrentFeatures = ({ title, groups }: Props) => {
  const { features } = contentConfig;

  // CMS content wins whole, rather than field by field, so a published page
  // never renders half from Sanity and half from the shipped constants.
  const heading = title ?? features.currentFeatures.title;
  const categories = groups?.length ? groups : currentFeatures;

  return (
    <section className="mb-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">{heading}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {features.currentFeatures.subtitle}
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.category} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-8 bg-linear-to-r from-primary to-primary/50 rounded-full" />
              <h3 className="text-xl font-bold">
                {category.category}
              </h3>
            </div>
            
            <div className="space-y-3">
              {(category.features ?? []).map((feature) => (
                <Card key={feature.name} className="border-muted hover:border-primary/50 transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{feature.name}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {(feature.tech ?? []).map((tech) => (
                        <Badge 
                          key={tech} 
                          variant="secondary" 
                          className="text-xs font-normal bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};