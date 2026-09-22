import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { apiVersion, dataset, projectId, studioUrl } from "./sanity/env";
import { SINGLETON_TYPES, schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";

/**
 * The Studio is embedded in this app at /studio.
 *
 * Never run `sanity deploy` against this project (AK-SAN-060) — that publishes
 * a SECOND, separate Studio at sanity.studio, which then drifts from this one.
 * The Studio here ships with the app's own deployment.
 */
export default defineConfig({
  name: "open-stream",
  title: "OpenStream",
  basePath: studioUrl,
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  schema: {
    types: schemaTypes,
    // Singletons are reachable from the sidebar only, so editors cannot create
    // a second "Site settings" that silently does nothing.
    templates: (templates) =>
      templates.filter(({ schemaType }) => !SINGLETON_TYPES.has(schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType)
        ? actions.filter(({ action }) => action !== "duplicate" && action !== "delete")
        : actions,
  },
});
