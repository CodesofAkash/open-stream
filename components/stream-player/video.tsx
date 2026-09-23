"use client";

import { ConnectionState, Track } from "livekit-client";
import {
  useConnectionState,
  useRemoteParticipant,
  useTracks,
} from "@livekit/components-react";
import { OfflineVideo } from "./offline-video";
import { LoadingVideo } from "./loading-video";
import { LiveVideo } from "./live-video";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

interface VideoProps {
  hostName: string;
  hostIdentity: string;
}

const CONNECT_TIMEOUT_MS = 10_000;

export const Video = ({ hostName, hostIdentity }: VideoProps) => {
  const connectionState = useConnectionState();
  const participant = useRemoteParticipant(hostIdentity);
  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
  ]).filter((track) => track.participant.identity === hostIdentity);

  /**
   * Give up connecting after ten seconds and show the offline state.
   *
   * A channel marked live whose room has no publisher never reaches
   * ConnectionState.Connected, so the "connecting" spinner below would run
   * forever. That happens whenever a stream ends without the LiveKit webhook
   * landing — and it is what every demo channel does today, since they were
   * seeded with isLive set but no ingress behind them.
   */
  const [connectTimedOut, setConnectTimedOut] = useState(false);

  useEffect(() => {
    if (participant) {
      setConnectTimedOut(false);
      return;
    }

    const timer = setTimeout(() => setConnectTimedOut(true), CONNECT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [participant, hostIdentity]);

  let content;

  // Render appropriate video component based on connection and stream state
  if (!participant && (connectionState === ConnectionState.Connected || connectTimedOut)) {
    content = <OfflineVideo username={hostName} />;
  } else if (!participant || tracks.length === 0) {
    content = <LoadingVideo label={connectionState} />;
  } else {
    content = <LiveVideo participant={participant} />;
  }

  return <div className="aspect-video border-b group relative">{content}</div>;
};

export const VideoSkeleton = () => {
  return (
    <div className="aspect-video border-x border-background">
      <Skeleton className="h-full w-full rounded-none" />
    </div>
  );
};