import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { ThemeProvider } from "@/components/theme-provider";
import { contentConfig } from "@/lib/content-config";

import { Toaster } from 'sonner'
import { OfflineIndicator } from "@/components/offline-indicator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Improve perceived load time
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Improve perceived load time
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ theme: dark }}>
      <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        >
          <ThemeProvider
            attribute="class"
            forcedTheme="dark"
            storageKey="open-stream-theme"
            disableTransitionOnChange
          >
            <Toaster theme="light" position="bottom-center" />
            <OfflineIndicator />
            {children}
          </ThemeProvider>
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
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenStream",
    description: "Live streaming platform",
    creator: "@CodesOfAkash",
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