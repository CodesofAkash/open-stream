import { defineLive } from "next-sanity/live";

import { client } from "./client";
import { serverToken } from "./env";

/**
 * Live revalidation (AK-SAN-008).
 *
 * defineLive() only CONFIGURES this. The exported <SanityLive /> must also be
 * RENDERED — the root layout does it. Imported and never mounted means Studio
 * publishes invalidate nothing and every query stays frozen until the next
 * deploy, with no error anywhere. That is the single most common silent
 * failure in a Sanity integration.
 *
 * <SanityLive /> is mounted unconditionally. Do NOT gate it on draft mode: that
 * looks right in `next dev`, where nothing is cached, and silently freezes
 * production. <VisualEditing /> is the one that genuinely belongs behind a
 * draft check, and it sits on an adjacent line — which is precisely how the
 * gate gets copied onto the wrong component.
 *
 * browserToken is false on purpose: passing a read token there ships a Sanity
 * credential to every visitor.
 */
export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken,
  browserToken: false,
});
