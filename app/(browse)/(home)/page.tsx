import { Suspense } from "react";
import { Metadata } from "next";
import { FeaturedCarousel, FeaturedCarouselSkeleton } from "./_components/featured-carousel-wrapper";
import { LiveChannels, LiveChannelsSkeleton } from "./_components/live-channels";
import { Categories, CategoriesSkeleton } from "./_components/categories";
import { RecommendedChannels, RecommendedChannelsSkeleton } from "./_components/recommended-channels";
import { getStreams } from "@/lib/feed-service";
import { Footer } from "@/components/footer";
import { contentConfig } from "@/lib/content-config";

export const metadata: Metadata = {
  title: "Discover Live Streams | OpenStream",
  description: "Watch live streams from your favorite creators. Browse gaming, creative, and entertainment content. Join the community and interact with streamers in real-time.",
  openGraph: {
    title: "OpenStream - Discover Live Streams",
    description: "Watch live streams and interact with creators in real-time",
    type: "website",
    url: contentConfig.project.baseUrl,
    images: [
      {
        url: `${contentConfig.project.baseUrl}/OpenStream.png`,
        width: 1200,
        height: 630,
        alt: "OpenStream - Live Streaming Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenStream - Discover Live Streams",
    description: "Watch live streams and interact with creators in real-time",
    images: [`${contentConfig.project.baseUrl}/OpenStream.png`],
  },
};

async function getHomeData() {
  const streams = await getStreams();
  return streams;
}

export default async function Home() {
  const streams = await getHomeData();

  // Organization + WebSite structured data. It is technical rather than
  // editorial, so it is hardcoded in the route rather than kept in the CMS
  // (AK-NXT-006). The SearchAction is what lets Google show a search box for
  // the site directly in results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${contentConfig.project.baseUrl}/#organization`,
        name: contentConfig.project.name,
        url: contentConfig.project.baseUrl,
        logo: `${contentConfig.project.baseUrl}/OpenStream.png`,
        sameAs: [contentConfig.project.githubUrl],
      },
      {
        "@type": "WebSite",
        "@id": `${contentConfig.project.baseUrl}/#website`,
        name: contentConfig.project.name,
        url: contentConfig.project.baseUrl,
        publisher: { "@id": `${contentConfig.project.baseUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${contentConfig.project.baseUrl}/search?term={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <main className="h-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense fallback={<FeaturedCarouselSkeleton />}>
        <FeaturedCarousel />
      </Suspense>

      <section className="max-w-screen-2xl mx-auto px-8 space-y-8 pb-10">
        <Suspense fallback={<LiveChannelsSkeleton />}>
          <LiveChannels data={streams} />
        </Suspense>

        <Suspense fallback={<CategoriesSkeleton />}>
          <Categories />
        </Suspense>

        <Suspense fallback={<RecommendedChannelsSkeleton />}>
          <RecommendedChannels data={streams} />
        </Suspense>
      </section>

      {/* Footer - ONLY on homepage */}
      <Footer />
    </main>
  );
}