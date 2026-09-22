"use client";

import { useEffect } from "react";

/**
 * Loads PostHog, and only once consent has actually been granted.
 *
 * The import is dynamic and inside the effect on purpose (AK-ANL-004). A static
 * `import posthog from "posthog-js"` at the top of any rendered module ships
 * ~176 kB to every visitor regardless of consent, leaving the gate controlling
 * init() rather than the download. Verify by confirming the vendor chunk is
 * absent from the served HTML's script tags — not by reading the code and
 * deciding it "looks lazy".
 *
 * Session replay is a separate, reversible decision (AK-ANL-007): another
 * ~108 kB, and it records what people do on screen. It stays off unless an
 * editor turns it on.
 *
 * Note when verifying: PostHog silently drops events from user agents matching
 * its bot list, which includes headlesschrome (AK-ANL-009). The SDK will
 * initialise, its assets will download, and no event will ever arrive. Test in
 * a real browser before concluding the integration is broken.
 */
type Props = {
  apiKey?: string | null;
  /** Ingestion host. EU projects use https://eu.i.posthog.com — note the `i.`. */
  apiHost?: string;
  enableSessionReplay?: boolean;
};

export const PostHogProvider = ({
  apiKey,
  apiHost = "https://eu.i.posthog.com",
  enableSessionReplay = false,
}: Props) => {
  useEffect(() => {
    if (!apiKey) return;

    let cancelled = false;

    void import("posthog-js")
      .then(({ default: posthog }) => {
        if (cancelled) return;

        posthog.init(apiKey, {
          api_host: apiHost,
          // Consent is handled by our own gate, so the SDK should not also try
          // to manage opt-in state and end up disagreeing with the banner.
          persistence: "localStorage",
          disable_session_recording: !enableSessionReplay,
          capture_pageview: true,
          capture_pageleave: true,
        });

        // Parked on window so lib/analytics/client.ts can send events without
        // importing the SDK and dragging it back into the main bundle.
        window.__posthog = posthog;
      })
      .catch((error) => {
        console.error("[analytics] PostHog failed to load:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, apiHost, enableSessionReplay]);

  return null;
};
