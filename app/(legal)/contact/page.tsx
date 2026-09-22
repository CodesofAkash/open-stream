import { Metadata } from "next";
import { Mail, MessageSquare, Send } from "lucide-react";

import { Github } from "@/components/icons/github";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Heading } from "@/components/sanity/heading";
import { CmsCta } from "@/components/sanity/cms-link";
import { contentConfig } from "@/lib/content-config";
import { getContactPage } from "@/sanity/pages";
import { buildPageMetadata } from "@/sanity/seo";
import { getSiteSettings } from "@/sanity/settings";

import { ContactForm } from "./_components/contact-form";

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getContactPage(), getSiteSettings()]);

  return buildPageMetadata({
    seo: page?.seo,
    settings,
    fallbackTitle: contentConfig.contact.title,
    fallbackDescription: contentConfig.contact.description,
    path: "/contact",
  });
}

/** The icon shown on each shipped contact card, by position. */
const FALLBACK_ICONS = [Mail, MessageSquare, Github];

export default async function ContactPage() {
  const { contact } = contentConfig;
  const page = await getContactPage();

  const heading = page?.heading?.length
    ? page.heading
    : [{ text: contact.hero.title, style: "default", tag: "h1" }];
  const intro = page?.intro ?? contact.hero.subtitle;
  const formTitle = page?.formTitle ?? contact.form.title;
  const formDescription = page?.formDescription ?? contact.form.description;

  return (
    <article className="space-y-12">
      {/* Hero */}
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
          <Send className="size-8 text-primary" />
        </div>
        <Heading segments={heading} sizeClassName="text-4xl font-bold" />
        {intro ? (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{intro}</p>
        ) : null}
      </header>

      {/* Contact methods */}
      <div className="grid md:grid-cols-3 gap-6">
        {page?.methods?.length
          ? page.methods.map((method, index) => (
              <Card
                key={index}
                className="hover:border-primary/50 transition-all hover:shadow-md"
              >
                <CardHeader className="text-center">
                  <CardTitle>{method.title}</CardTitle>
                  {method.description ? (
                    <CardDescription>{method.description}</CardDescription>
                  ) : null}
                </CardHeader>
                {method.cta ? (
                  <CardContent className="text-center">
                    <CmsCta cta={method.cta} className="w-full" />
                  </CardContent>
                ) : null}
              </Card>
            ))
          : contact.methods.map((method, index) => {
              const Icon = FALLBACK_ICONS[index] ?? Mail;
              const isPlainLink = "linkText" in method;

              return (
                <Card
                  key={method.title}
                  className="hover:border-primary/50 transition-all hover:shadow-md"
                >
                  <CardHeader className="text-center">
                    <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 mx-auto mb-4">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <CardTitle>{method.title}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    {isPlainLink ? (
                      <a
                        href={method.link}
                        className="text-primary hover:underline font-medium"
                      >
                        {(method as { linkText: string }).linkText}
                      </a>
                    ) : (
                      <Button variant="outline" asChild className="w-full">
                        <a href={method.link} target="_blank" rel="noopener noreferrer">
                          {(method as { buttonText: string }).buttonText}
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <ContactForm title={formTitle} description={formDescription} />
    </article>
  );
}
