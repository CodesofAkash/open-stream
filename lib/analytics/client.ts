"use client";

import type { AnalyticsEvent } from "./events";

/**
 * The only way the app sends an event.
 *
 * Deliberately does NOT import posthog-js. A single static import of the SDK
 * anywhere in a rendered module puts all ~176 kB in the bundle whether or not
 * anyone consents, and then the consent gate controls init() rather than the
 * download (AK-ANL-004, the same failure as AK-PERF-014). The provider is the
 * one place that dynamically imports it; everything else talks to the instance
 * it parks on window.
 *
 * Capturing before consent is a no-op rather than an error, so call sites do
 * not each have to know whether analytics is live.
 */

type PostHogLike = {
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (id: string, properties?: Record<string, unknown>) => void;
  reset: () => void;
};

declare global {
  interface Window {
    __posthog?: PostHogLike;
  }
}

export const capture = (
  event: AnalyticsEvent,
  properties?: Record<string, unknown>,
) => {
  if (typeof window === "undefined") return;
  try {
    window.__posthog?.capture(event, properties);
  } catch (error) {
    // Analytics must never take a page down with it.
    console.error("[analytics] capture failed:", error);
  }
};

export const identify = (id: string, properties?: Record<string, unknown>) => {
  if (typeof window === "undefined") return;
  try {
    window.__posthog?.identify(id, properties);
  } catch (error) {
    console.error("[analytics] identify failed:", error);
  }
};

/** Call on sign-out so the next visitor on this browser is a new person. */
export const resetAnalytics = () => {
  if (typeof window === "undefined") return;
  try {
    window.__posthog?.reset();
  } catch (error) {
    console.error("[analytics] reset failed:", error);
  }
};
