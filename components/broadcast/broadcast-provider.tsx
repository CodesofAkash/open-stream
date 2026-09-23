"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { toast } from "sonner";

import { createBroadcastToken, setBroadcastLive } from "@/actions/broadcast";
import CompositorProvider from "@/components/broadcast/compositor-provider";

/**
 * Keeps a broadcast alive across navigation.
 *
 * This used to live inside the Keys page, so moving anywhere in the app
 * unmounted it and dropped the stream — which also meant a streamer could not
 * open their own channel to read chat without going offline. Mounting it at
 * the root means the connection survives client-side navigation, and the
 * broadcaster can use the whole site while live.
 *
 * It renders nothing until a broadcast starts, so it costs a visitor nothing.
 */
type BroadcastContextValue = {
  isBroadcasting: boolean;
  isStarting: boolean;
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

const BroadcastContext = createContext<BroadcastContextValue | null>(null);

export const useBroadcast = () => {
  const context = useContext(BroadcastContext);
  if (!context) {
    throw new Error("useBroadcast must be used inside <BroadcastProvider>");
  }
  return context;
};

export const BroadcastProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const start = useCallback(async () => {
    setIsStarting(true);
    try {
      setToken(await createBroadcastToken());
    } catch {
      toast.error("Could not start the broadcast");
    } finally {
      setIsStarting(false);
    }
  }, []);

  const stop = useCallback(async () => {
    setToken(null);
    try {
      await setBroadcastLive(false);
    } catch {
      toast.error("Could not update your live status");
    }
  }, []);

  /**
   * Closing the tab or the browser gives no chance to run an async action, so
   * this is best effort: sendBeacon-style fire and forget. The LiveKit
   * webhook's participant_left is the reliable server-side backstop.
   */
  useEffect(() => {
    if (!token) return;

    const onPageHide = () => {
      void setBroadcastLive(false);
    };

    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [token]);

  const value = useMemo(
    () => ({ isBroadcasting: Boolean(token), isStarting, start, stop }),
    [token, isStarting, start, stop],
  );

  return (
    <BroadcastContext.Provider value={value}>
      {token ? (
        <LiveKitRoom
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
          connect
          video
          audio
          onDisconnected={() => setToken(null)}
          onError={() => toast.error("Lost connection to the stream")}
        >
          {/*
            Studio mode needs the room's local participant, so it is nested
            here rather than beside this provider — and like the broadcast, it
            has to outlive navigation between dashboard tabs.
          */}
          <CompositorProvider>{children}</CompositorProvider>
        </LiveKitRoom>
      ) : (
        children
      )}
    </BroadcastContext.Provider>
  );
};
