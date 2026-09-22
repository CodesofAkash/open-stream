/**
 * The events this app captures, and why each one exists.
 *
 * Autocapture already gives page views and clicks. Every event here earns its
 * place by answering a question the page view cannot (AK-ANL-006) — open-stream
 * is an app with auth and a creator funnel, so the questions are about whether
 * people get through that funnel, not how many pages they saw.
 *
 * Names are snake_case and past-tense-ish, so they read as facts in PostHog's
 * event list rather than as intentions.
 */
export const ANALYTICS_EVENTS = {
  /** Did a visitor who landed on a channel actually start watching? */
  STREAM_VIEWED: "stream_viewed",
  /** The creator funnel's first real step: did they reach the dashboard? */
  CREATOR_DASHBOARD_OPENED: "creator_dashboard_opened",
  /** Did they get as far as generating stream keys — i.e. intent to go live? */
  STREAM_KEYS_VIEWED: "stream_keys_viewed",
  /** The conversion that matters for a streaming platform. */
  STREAM_WENT_LIVE: "stream_went_live",
  /** Social graph growth, and the strongest retention signal here. */
  CHANNEL_FOLLOWED: "channel_followed",
  /** Engagement depth while watching — chat is the reason to stay. */
  CHAT_MESSAGE_SENT: "chat_message_sent",
  /** Does search find people anything? Fired with a result count. */
  SEARCH_PERFORMED: "search_performed",
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
