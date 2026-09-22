import { createClient } from "next-sanity";

import { apiVersion, dataset, isSanityConfigured, projectId, studioUrl } from "./env";

/**
 * Public, read-only client for published content (AK-SAN-007).
 *
 * Also the client to use for build-time path enumeration in
 * generateStaticParams — sanityFetch calls draftMode() internally, which cannot
 * be called during static generation (AK-SAN-009). Reach for this one there
 * deliberately; it looks like an inconsistency otherwise.
 *
 * The placeholder projectId is load-bearing. createClient() validates its
 * arguments at MODULE EVALUATION and throws "Configuration must contain
 * `projectId`" on an empty one — which happens during `next build` page-data
 * collection, long before any isSanityConfigured guard could run. Since every
 * read short-circuits on isSanityConfigured, this client is never actually
 * called while unconfigured; it just has to be constructible so the module can
 * load. Removing it makes the app unbuildable until someone creates a Sanity
 * project, which is the wrong failure mode for an optional content layer.
 */
export const client = createClient({
  projectId: isSanityConfigured ? projectId : "placeholder",
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  stega: {
    enabled: isSanityConfigured,
    studioUrl,
  },
});
