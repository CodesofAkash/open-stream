/**
 * The single source of truth for cookie consent.
 *
 * Stored per browser rather than in a cookie, and read through
 * useSyncExternalStore with a server snapshot of "unknown" so the server and
 * the first client render agree — no setState-in-effect, and no hydration
 * mismatch.
 *
 * Every localStorage access is wrapped: private mode and blocked site data
 * both throw, and a throw must read as "no answer given", never as consent
 * (AK-ANL-003).
 */

export type ConsentState = "granted" | "denied" | "unknown";

const STORAGE_KEY = "open-stream-cookie-consent";

const listeners = new Set<() => void>();

/** Cached so getSnapshot returns a stable reference between notifications. */
let cached: ConsentState | null = null;

const readFromStorage = (): ConsentState => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : "unknown";
  } catch {
    return "unknown";
  }
};

export const subscribe = (onStoreChange: () => void) => {
  listeners.add(onStoreChange);

  // Another tab deciding should update this one.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cached = null;
      onStoreChange();
    }
  };

  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
};

export const getSnapshot = (): ConsentState => {
  if (cached === null) cached = readFromStorage();
  return cached;
};

/** Before hydration nobody has answered, whatever is in storage. */
export const getServerSnapshot = (): ConsentState => "unknown";

export const setConsent = (state: ConsentState) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, state);
  } catch {
    // Storage unavailable — the decision still applies for this page view.
  }
  cached = state;
  listeners.forEach((listener) => listener());
};
