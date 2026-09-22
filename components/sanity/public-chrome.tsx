import type { ReactNode } from "react";

import { getGlobalConfig } from "@/sanity/settings";

import { MaintenanceGate } from "./maintenance-gate";
import { SiteChrome } from "./site-chrome";

/**
 * Global chrome for the PUBLIC site: maintenance mode, the consent banner and
 * editor-pasted scripts.
 *
 * Deliberately not in the root layout. Everything global has to stay out of the
 * Studio's route prefix (AK-CMS-031, AK-ARCH-006), and maintenance mode
 * especially — an editor locked out of the document that disables maintenance
 * mode can only get back in with a deploy. Excluding /studio from the root
 * layout would have meant reading headers() there, which opts every route in
 * the app out of static rendering.
 *
 * This does its own fetch rather than being threaded down from a shell that has
 * no business knowing about it — the one exception AK-CMS-028 allows for a
 * component rendered from several route groups. sanityFetch dedupes per
 * request, so the repeat is free.
 */
export const PublicChrome = async ({ children }: { children: ReactNode }) => {
  const config = await getGlobalConfig();

  return (
    <>
      <MaintenanceGate config={config}>{children}</MaintenanceGate>
      <SiteChrome config={config} />
    </>
  );
};
