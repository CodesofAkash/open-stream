"use client";

import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import {
  getServerSnapshot,
  getSnapshot,
  setConsent,
  subscribe,
  type ConsentState,
} from "@/lib/analytics/consent-store";
import type { GlobalConfig } from "@/sanity/types";

export type { ConsentState };

/**
 * Read the stored decision. Hydration-safe: the server snapshot is always
 * "unknown", so the banner never renders on the server and then disappears.
 */
export const useConsent = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

type Props = {
  config?: GlobalConfig | null;
};

/**
 * The consent banner.
 *
 * Declining is as prominent as accepting — same size, same number of clicks.
 * One "Accept" button with an X in the corner is not consent (AK-ANL-003).
 */
export const CookieConsent = ({ config }: Props) => {
  const consent = useConsent();

  if (!config?.consentEnabled) return null;
  if (consent !== "unknown") return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 backdrop-blur"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {config.consentMessage}
          {config.consentPolicyUrl ? (
            <>
              {" "}
              <a href={config.consentPolicyUrl} className="underline underline-offset-4">
                Learn more
              </a>
            </>
          ) : null}
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => setConsent("denied")}>
            {config.consentDeclineLabel || "Decline"}
          </Button>
          <Button size="sm" onClick={() => setConsent("granted")}>
            {config.consentAcceptLabel || "Accept"}
          </Button>
        </div>
      </div>
    </div>
  );
};
