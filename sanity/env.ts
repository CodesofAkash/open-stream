/**
 * The one place Sanity environment variables are read (AK-ARCH-008).
 *
 * Deliberately does NOT throw when the project is unconfigured. Sanity is
 * additive here: until a project exists, every CMS read returns null/[] and
 * each screen renders exactly as it did before, because presence of data
 * already decides visibility (AK-CMS-001) and every fetch already degrades
 * (AK-CMS-032).
 *
 * The alternative — throwing on a missing projectId — makes the whole app
 * unbuildable until someone creates a Sanity project, which is the wrong
 * failure mode for an optional content layer.
 */

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

/**
 * Pinned, not floating. An unpinned API version lets Sanity change query
 * behaviour under a deployment that has not changed a line of code.
 */
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-09-22";

/** Where the embedded Studio is mounted — used by stega for click-to-edit. */
export const studioUrl = "/studio";

/**
 * Whether there is a Sanity project to talk to at all. Guard every read with
 * this; an unconfigured CMS is a normal state, not an error.
 */
export const isSanityConfigured = Boolean(projectId);

/**
 * Server-only (AK-SEC-010). Never prefixed NEXT_PUBLIC_, never imported into a
 * client component, and `false` rather than undefined so next-sanity treats it
 * as explicitly absent.
 */
export const serverToken = process.env.SANITY_API_READ_TOKEN || (false as const);
