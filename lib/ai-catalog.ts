import { SITE_URL } from "@/lib/site-url";

/**
 * The Agentic Resource Discovery manifest.
 *
 * ARD is to AI agents what robots.txt is to crawlers: a predictable URL saying
 * which machine-readable resources a domain offers, so an agent can discover
 * them before trying to call anything.
 *
 * Schema (ards-project/ard-spec v1.0): `specVersion` and `entries` are required
 * at the top level; each entry needs `identifier` (an RFC 8141 URN),
 * `displayName`, `type` (an IANA media type), and exactly one of `url`/`data`.
 *
 * OpenStream publishes no MCP server or agent API, so the catalog honestly
 * lists the one machine-readable resource it does have — the llms.txt site
 * guide. Inventing entries would be worse than having none.
 *
 * Shared by two routes: the specification's /.well-known/ai-catalog.json, and
 * the root /ai-catalog.json that validators also probe. Route segment config
 * such as `dynamic` cannot be re-exported between route files, so each route
 * declares its own and calls this.
 */
export const buildAiCatalog = () => ({
  specVersion: "1.0",
  entries: [
    {
      identifier: "urn:air:codesofakash:open-stream:site-guide",
      displayName: "OpenStream site guide",
      type: "text/markdown",
      url: `${SITE_URL}/llms.txt`,
      description:
        "Markdown overview of OpenStream — an open-source live streaming platform — listing its public pages and how channel URLs are structured.",
      tags: ["live-streaming", "open-source", "nextjs"],
      capabilities: ["site-overview", "page-index"],
      representativeQueries: [
        "What is OpenStream?",
        "Which pages does OpenStream have?",
        "How are OpenStream channel URLs structured?",
      ],
    },
  ],
});
