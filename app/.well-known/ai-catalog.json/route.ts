import { buildAiCatalog } from "@/lib/ai-catalog";

/**
 * Agentic Resource Discovery manifest — see lib/ai-catalog.ts for the schema
 * and why the catalog contains what it does.
 *
 * It previously reported as "malformed JSON" for the dull reason that the file
 * did not exist: the request fell through to the HTML 404 page and the
 * validator tried to parse markup as JSON.
 */
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildAiCatalog(), {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
