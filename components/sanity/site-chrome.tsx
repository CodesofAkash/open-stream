"use client";

import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import type { GlobalConfig } from "@/sanity/types";

import { CookieConsent, useConsent } from "./cookie-consent";
import { InjectedScripts } from "./injected-scripts";

/**
 * The consent-aware half of the global chrome: analytics and editor-pasted
 * scripts, plus the banner that gates them.
 *
 * Two properties this exists to guarantee (AK-ANL-003):
 *
 * 1. It FAILS CLOSED. `granted` is `consentEnabled ? state === "granted" : false`
 *    — never `state !== "denied"`. Silence is not agreement, and a banner
 *    switched off while analytics IDs are filled in means nothing loads at all.
 * 2. It only ASKS when there is something to consent to. With every analytics
 *    field empty the banner never renders; a cookie banner on a site that sets
 *    no cookies is theatre, and regulators name it as a dark pattern.
 *
 * Speed Insights is deliberately NOT here — it is cookieless, so it sits
 * outside the gate in the root layout and measures every visitor.
 */
type Props = { config?: GlobalConfig | null };

export const SiteChrome = ({ config }: Props) => {
  const consent = useConsent();

  const scriptsNeedConsent = config?.scriptsRequireConsent !== false;

  // Is there anything here that would set a cookie or track someone?
  const hasTrackingConfigured = Boolean(
    config?.ga4MeasurementId ||
      config?.gtmContainerId ||
      config?.metaPixelId ||
      config?.posthogApiKey ||
      (scriptsNeedConsent && (config?.headScripts || config?.bodyScripts)),
  );

  // Fails closed: no banner configured means there is no way to obtain consent,
  // so nothing that needs it may load.
  const granted = config?.consentEnabled ? consent === "granted" : false;

  const mayRunGatedScripts = scriptsNeedConsent ? granted : true;

  return (
    <>
      {granted ? (
        <>
          <PostHogProvider apiKey={config?.posthogApiKey} />
          <GoogleAnalytics
            measurementId={config?.ga4MeasurementId}
            containerId={config?.gtmContainerId}
          />
          <MetaPixel pixelId={config?.metaPixelId} />
        </>
      ) : null}

      {mayRunGatedScripts ? (
        <>
          <InjectedScripts html={config?.headScripts} target="head" />
          <InjectedScripts html={config?.bodyScripts} target="body" />
        </>
      ) : null}

      {hasTrackingConfigured ? <CookieConsent config={config} /> : null}
    </>
  );
};
