import "server-only";

import { client } from "./client";
import { isSanityConfigured } from "./env";
import { sanityFetch } from "./live";

/**
 * Every CMS read goes through one of these (AK-CMS-032).
 *
 * A Sanity outage or a malformed query must never surface as an unhandled 500.
 * These log and degrade; the page then renders as though the content were
 * absent, which every component already has to survive because any CMS field
 * can be empty at read time (AK-CMS-021).
 *
 * They also short-circuit when no Sanity project is configured at all, so the
 * app runs normally before the CMS exists.
 */

type QueryParams = Record<string, unknown>;

/** A single document, or null when absent or unreachable. */
export const fetchOne = async <T>(
  query: string,
  params: QueryParams = {},
): Promise<T | null> => {
  if (!isSanityConfigured) return null;
  try {
    const { data } = await sanityFetch({ query, params });
    return (data as T | null) ?? null;
  } catch (error) {
    console.error("[sanity] query failed:", { query, params, error });
    return null;
  }
};

/** A list of documents, or [] when absent or unreachable. */
export const fetchMany = async <T>(
  query: string,
  params: QueryParams = {},
): Promise<T[]> => {
  if (!isSanityConfigured) return [];
  try {
    const { data } = await sanityFetch({ query, params });
    return (data as T[] | null) ?? [];
  } catch (error) {
    console.error("[sanity] query failed:", { query, params, error });
    return [];
  }
};

/**
 * For generateStaticParams only (AK-SAN-009).
 *
 * Deliberately bypasses sanityFetch, which calls draftMode() internally and so
 * cannot run during static generation. This is not an inconsistency to tidy up.
 */
export const fetchStaticPaths = async <T>(
  query: string,
  params: QueryParams = {},
): Promise<T[]> => {
  if (!isSanityConfigured) return [];
  try {
    return (await client.fetch<T[]>(query, params)) ?? [];
  } catch (error) {
    console.error("[sanity] static path query failed:", { query, error });
    return [];
  }
};
