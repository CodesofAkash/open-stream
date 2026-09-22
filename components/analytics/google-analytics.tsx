"use client";

import Script from "next/script";

/**
 * GA4 and Google Tag Manager, rendered only after consent.
 *
 * Both go inside <body> via next/script with strategy="afterInteractive"
 * (AK-NXT-003) — rendering script components as a sibling of <body> under
 * <html> produces a real React warning.
 *
 * GTM needs BOTH the script and the <noscript><iframe> fallback; the iframe
 * belongs as early in the body as possible.
 *
 * Empty ID means nothing renders and no request is made, which is what makes
 * shipping the whole analytics surface free (AK-SAN-057).
 */
type Props = {
  measurementId?: string | null;
  containerId?: string | null;
};

export const GoogleAnalytics = ({ measurementId, containerId }: Props) => (
  <>
    {measurementId ? (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}');
          `}
        </Script>
      </>
    ) : null}

    {containerId ? (
      <>
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${containerId}');
          `}
        </Script>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${containerId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
      </>
    ) : null}
  </>
);
