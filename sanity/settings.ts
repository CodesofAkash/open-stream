import "server-only";

import { fetchOne } from "./fetch";
import { GLOBAL_CONFIG_QUERY, SITE_SETTINGS_QUERY } from "./queries/settings";
import type { GlobalConfig, SiteSettings } from "./types";

/**
 * Fetched once at layout level and threaded down (AK-CMS-028, AK-SAN-029) —
 * not separately in the header, the footer and generateMetadata. Client
 * components cannot fetch; the server layout resolves these and passes the
 * objects down.
 */
export const getSiteSettings = () => fetchOne<SiteSettings>(SITE_SETTINGS_QUERY);

export const getGlobalConfig = () => fetchOne<GlobalConfig>(GLOBAL_CONFIG_QUERY);

export const getLayoutData = async () => {
  const [settings, config] = await Promise.all([getSiteSettings(), getGlobalConfig()]);
  return { settings, config };
};
