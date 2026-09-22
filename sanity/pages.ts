import "server-only";

import { fetchOne, fetchStaticPaths } from "./fetch";
import {
  ABOUT_PAGE_QUERY,
  CONTACT_PAGE_QUERY,
  FEATURES_PAGE_QUERY,
  LEGAL_PAGE_QUERY,
  LEGAL_PAGE_SLUGS_QUERY,
} from "./queries/pages";
import type { AboutPage, ContactPage, FeaturesPage, LegalPage } from "./types";

/**
 * Page reads.
 *
 * Each returns null when Sanity is unconfigured, unreachable, or simply has no
 * document yet. Callers treat null as "the CMS has nothing to say about this
 * page" and fall back to the shipped constants — see the note in each route.
 */

export const getAboutPage = () => fetchOne<AboutPage>(ABOUT_PAGE_QUERY);

export const getContactPage = () => fetchOne<ContactPage>(CONTACT_PAGE_QUERY);

export const getFeaturesPage = () => fetchOne<FeaturesPage>(FEATURES_PAGE_QUERY);

export const getLegalPage = (slug: string) =>
  fetchOne<LegalPage>(LEGAL_PAGE_QUERY, { slug });

export const getLegalPageSlugs = () =>
  fetchStaticPaths<{ slug: string }>(LEGAL_PAGE_SLUGS_QUERY);
