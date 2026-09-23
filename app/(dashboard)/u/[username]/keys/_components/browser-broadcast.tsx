"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { LiveKitRoom, useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Radio, Video as VideoIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createBroadcastToken, setBroadcastLive } from "@/actions/broadcast";

/**
 * Publishes the local camera and microphone into the host's own room.
 *
 * Unlike the RTMP/WHIP key flow beside it, this is not an ingress: the host
 * joins as an ordinary participant. It therefore avoids the free plan's cap of
 * two concurrent ingresses and its 60 monthly transcode minutes entirely.
 */
const LocalPreview = ({ onLiveChange }: { onLiveChange: (live: boolean) => void }) => {
  const { localParticipant, isCameraEnabled } = useLocalParticipant();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = videoRef.current;
    const publication = localParticipant?.getTrackPublication(Track.Source.Camera);
    const track = publication?.track;

    if (!element || !track) return;

    track.attach(element);
    return () => {
      track.detach(element);
    };
  }, [localParticipant, isCameraEnabled]);

  // Tell the server once the camera is actually publishing, not when the
  // component mounts — otherwise the channel shows as live while the browser
  // is still asking for permission.
  useEffect(() => {
    onLiveChange(Boolean(isCameraEnabled));
  }, [isCameraEnabled, onLiveChange]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="aspect-video w-full rounded-md bg-black object-contain"
    />
  );
};

export const BrowserBroadcast = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const start = () => {
    startTransition(async () => {
      try {
        setToken(await createBroadcastToken());
      } catch {
        toast.error("Could not start the broadcast");
      }
    });
  };

  const stop = () => {
    setToken(null);
    startTransition(async () => {
      try {
        await setBroadcastLive(false);
        toast.success("You are offline");
      } catch {
        toast.error("Could not end the broadcast");
      }
    });
  };

  const handleLiveChange = (live: boolean) => {
    void setBroadcastLive(live).catch(() => {
      toast.error("Could not update your live status");
    });
  };

  // Leaving the page without pressing Stop would otherwise leave the channel
  // advertised as live. The webhook's participant_left is the server-side
  // safety net; this covers the common case immediately.
  useEffect(() => {
    if (!token) return;

    const onLeave = () => {
      void setBroadcastLive(false);
    };

    window.addEventListener("pagehide", onLeave);
    return () => {
      window.removeEventListener("pagehide", onLeave);
      onLeave();
    };
  }, [token]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <VideoIcon className="size-5" />
          Go live from your browser
        </CardTitle>
        <CardDescription>
          Stream straight from your camera — no OBS, no stream key. Use the RTMP or
          WHIP keys below instead if you want to stream from OBS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
            <LocalPreview onLiveChange={handleLiveChange} />
            <div className="mt-4 flex items-center gap-3">
              <span className="flex items-center gap-2 text-sm font-medium text-rose-500">
                <Radio className="size-4 animate-pulse" aria-hidden="true" />
                Live
              </span>
              <Button variant="destructive" onClick={stop} className="ml-auto">
                Stop broadcasting
              </Button>
            </div>
          </LiveKitRoom>
        ) : (
          <Button onClick={start} disabled={isPending}>
            {isPending ? "Starting…" : "Start broadcasting"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
