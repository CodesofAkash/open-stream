import type { Metadata } from "next";

import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { contentConfig } from "@/lib/content-config";

import { Toaster } from 'sonner'
import { OfflineIndicator } from "@/components/offline-indicator";

import { SpeedInsights } from "@vercel/speed-insights/next";

import StudioProvider from "@/components/studio/studio-provider";
import { SanityLive } from "@/sanity/live";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ theme: dark }}>
      <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
        {/*
          Geist and Geist_Mono used to be loaded here. Nothing referenced them:
          globals.css defines no --font-sans or --font-mono in @theme, so
          Tailwind's font-sans resolved to its default system stack and the
          --font-geist-* variables were dead. Two families, nine preloaded
          woff2 files, downloaded on every page and applied to nothing.

          Removing them changes no pixel — the site already rendered in the
          system stack. To actually adopt Geist, add
          `--font-sans: var(--font-geist-sans)` to @theme first; that is a
          design change, not a performance one.
        */}
        <body className="font-sans antialiased">
          {/*
            No theme provider: the theme is forced dark on <html> above, and
            next-themes injected a script during a client render, which React
            refuses to execute and reports as an error.
          */}
          <Toaster theme="light" position="bottom-center" />
          <OfflineIndicator />
          {/*
            Wraps the app so neither a broadcast nor a studio setup is torn
            down by navigation. Nothing loads until a streamer opens the
            studio, so a visitor pays nothing for it.
          */}
          <StudioProvider>{children}</StudioProvider>
          {/*
            Mounted unconditionally. Gating <SanityLive /> on draft mode freezes
            production at build time while dev looks perfect (AK-SAN-008), and
            gating it on maintenance mode would stop the publish that turns
            maintenance back off from ever arriving.

            The maintenance gate, consent banner and injected scripts live in
            <PublicChrome>, used by the public route groups. Keeping them out of
            the root layout keeps the Studio clear of all of it
            (AK-CMS-031, AK-ARCH-006) without reading headers() here — which
            would opt every route in the app out of static rendering.
          */}
          <SanityLive />
          {/*
            Cookieless, so it sits OUTSIDE the consent gate and measures every
            visitor rather than only those who accept. Field data and lab scores
            answer different questions — when they disagree neither is wrong
            (AK-ANL-008).
          */}
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}




export const metadata: Metadata = {
  metadataBase: new URL(contentConfig.project.baseUrl),
  title: {
    default: "OpenStream - Live Streaming Platform",
    template: "%s | OpenStream",
  },
  description: "Watch live streams, interact with your favorite creators, and join a thriving community",
  keywords: ["streaming", "live", "gaming", "entertainment", "community"],
  authors: [{ name: "Akash Sharma" }],
  creator: "Akash Sharma",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: contentConfig.project.baseUrl,
    siteName: "OpenStream",
    title: "OpenStream - Live Streaming Platform",
    description: "Watch live streams and interact with creators",
    // Inherited wholesale by every page that does not set its own openGraph
    // block, so the image belongs here rather than only on the home page.
    images: [
      {
        url: "/OpenStream.png",
        width: 1200,
        height: 630,
        alt: "OpenStream - Live Streaming Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenStream",
    description: "Live streaming platform",
    creator: "@CodesOfAkash",
    images: ["/OpenStream.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification=Ljf9QLc-TeK5cr7pmylRf3Yu2EtUy4HXaisNv4d0u_E",
  },
};