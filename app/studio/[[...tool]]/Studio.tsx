"use client";

import { NextStudio } from "next-sanity/studio";

import config from "../../../sanity.config";

/**
 * This client boundary is load-bearing, not stylistic (AK-SAN-048).
 *
 * Sanity 6 depends on swr, whose `react-server` conditional entry exports no
 * default. Importing sanity.config from a SERVER component pulls sanity through
 * the RSC graph, resolves that entry, and the build fails with
 * "Export default doesn't exist in target module .../swr/react-server.mjs".
 *
 * Keeping the import inside the client graph selects swr's main entry, which
 * does export a default. Turbopack resolveAlias, serverExternalPackages and
 * --webpack all fail identically; this is the fix.
 */
export default function Studio() {
  return <NextStudio config={config} />;
}
