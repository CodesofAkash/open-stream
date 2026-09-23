import { SITE_URL } from "@/lib/site-url";

/**
 * /llms.txt — what an AI agent reads to understand this site.
 *
 * It was returning the 404 page as HTML with a 200 status, so the audit tried
 * to parse markup and failed. The format is Markdown and needs at least one H1
 * and some links.
 *
 * Served from a route rather than public/ so the URLs follow the deployment
 * instead of being hardcoded (lib/site-url.ts).
 */
export const dynamic = "force-static";

export function GET() {
  const body = `# OpenStream

> An open-source live streaming platform: watch live channels, chat in real
> time, follow creators, and run your own channel from the creator dashboard.
> Built with Next.js, LiveKit, Clerk, Prisma and Sanity.

## Pages

- [Home](${SITE_URL}/): browse live channels and recommended creators
- [Search](${SITE_URL}/search): find channels by name, category or tag
- [Features & Roadmap](${SITE_URL}/features): what is built and what is planned
- [About](${SITE_URL}/about): what the project is and how it is built
- [Contact](${SITE_URL}/contact): how to reach the developer

## Legal

- [Privacy Policy](${SITE_URL}/privacy)
- [Terms of Service](${SITE_URL}/terms)

## Notes for agents

- Channel pages live at ${SITE_URL}/{username}.
- Creator dashboard routes under /u/ require authentication and are excluded
  in robots.txt.
- The project is open source: https://github.com/CodesofAkash/open-stream
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
