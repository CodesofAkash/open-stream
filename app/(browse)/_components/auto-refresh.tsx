"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Keeps live/offline status fresh while someone is actually looking.
 *
 * It used to refresh every 30s unconditionally, which meant every backgrounded
 * tab kept re-fetching the whole RSC payload forever — server work and mobile
 * battery spent on a page nobody is looking at.
 *
 * Now it only polls while the tab is visible, and refreshes once on becoming
 * visible again so returning to the tab shows current data immediately rather
 * than after up to a full interval.
 */
const REFRESH_INTERVAL_MS = 30_000;

export const AutoRefresh = () => {
  const router = useRouter();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = undefined;
      }
    };

    const start = () => {
      if (interval) return;
      interval = setInterval(() => router.refresh(), REFRESH_INTERVAL_MS);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  return null;
};
