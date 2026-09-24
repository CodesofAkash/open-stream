/**
 * The broadcast half: a LiveKit room that publishes what the studio already
 * produces, and nothing else.
 *
 * It takes no camera and no microphone of its own — `video` and `audio` are
 * off — because the studio owns every capture. What goes out is one composed
 * video track from the scene canvas and one mixed audio track from the mixer.
 *
 * Publishing a single mixed audio track is what makes a shared tab's sound
 * audible to viewers: as separate tracks the player could only reliably play
 * one of them, and it played the microphone.
 */

"use client";

import { useEffect } from "react";
import { LiveKitRoom, useConnectionState, useLocalParticipant } from "@livekit/components-react";
import {
  ConnectionState,
  LocalAudioTrack,
  LocalVideoTrack,
  Track,
} from "livekit-client";
import { toast } from "sonner";

import { setBroadcastLive } from "@/actions/broadcast";
import { useStudio } from "@/components/studio/studio-provider";

const FPS = 30;
const STATS_INTERVAL_MS = 2000;

/** The receiver's own report back to us; lib.dom does not declare this one. */
interface RemoteInboundStats extends RTCStats {
  packetsLost?: number;
  roundTripTime?: number;
}

// Choosing 1080p is a request, not a promise: WebRTC lowers it silently when
// the CPU or uplink cannot keep up, and `limitation` is its word for why.
interface StreamHealth {
  width: number;
  height: number;
  fps: number;
  kbps: number;
  limitation: string;
  packetLoss: number;
  rtt: number;
  /** True when a capture is published as-is, with no compositing. */
  direct: boolean;
}

async function readHealth(track: LocalVideoTrack, previous: { bytes: number; at: number }) {
  const report = await track.getRTCStatsReport();
  if (!report) return null;

  const entries = Array.from(report.values()) as RTCStats[];

  const outbound = entries.find(
    (entry): entry is RTCOutboundRtpStreamStats =>
      entry.type === "outbound-rtp" && (entry as RTCOutboundRtpStreamStats).kind === "video",
  );
  if (!outbound) return null;

  const remote = entries.find(
    (entry): entry is RemoteInboundStats => entry.type === "remote-inbound-rtp",
  );

  const bytes = outbound.bytesSent ?? 0;
  const elapsed = Math.max(1, Date.now() - previous.at) / 1000;

  const health: StreamHealth = {
    width: outbound.frameWidth ?? 0,
    height: outbound.frameHeight ?? 0,
    fps: Math.round(outbound.framesPerSecond ?? 0),
    kbps: Math.round(((bytes - previous.bytes) * 8) / elapsed / 1000),
    limitation: outbound.qualityLimitationReason ?? "none",
    packetLoss: remote?.packetsLost ?? 0,
    rtt: Math.round((remote?.roundTripTime ?? 0) * 1000),
    direct: false,
  };

  return { health, bytes };
}

function StudioPublisher({
  maxBitrate,
  adaptive,
  directMode,
  getPassthroughTrack,
  onHealth,
  onPublishError,
}: {
  maxBitrate: number;
  adaptive: boolean;
  directMode: boolean;
  getPassthroughTrack: () => MediaStreamTrack | null;
  onHealth: (health: StreamHealth | null) => void;
  onPublishError: (message: string | null) => void;
}) {
  const { localParticipant } = useLocalParticipant();
  const { getOutputCanvas, getAudioStream } = useStudio();

  // Connecting is asynchronous, and publishing to a room that has not finished
  // connecting throws. Nothing is published until the room says it is ready.
  const isConnected = useConnectionState() === ConnectionState.Connected;

  // Syncs with the LiveKit room; everything published comes back down on unmount.
  useEffect(() => {
    if (!isConnected) return;

    const published: (LocalVideoTrack | LocalAudioTrack)[] = [];
    let statsTimer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    let publishedDirectly = false;

    const publish = async () => {
      onPublishError(null);

      const canvas = getOutputCanvas();
      if (!canvas) {
        onPublishError("The studio canvas is not ready yet.");
        return;
      }

      const publishVideo = async (simulcast: boolean) => {
        // Captured per attempt: a failed publish stops the track it was handed,
        // and re-using it published a dead track that sent 0x0 at 0fps.
        const direct = directMode ? getPassthroughTrack() : null;
        const source = direct ?? canvas.captureStream(FPS).getVideoTracks()[0];

        // Sharp edges matter for a shared screen; a camera would rather keep
        // its motion smooth.
        source.contentHint = direct && direct.label.toLowerCase().includes("camera")
          ? "motion"
          : "detail";

        publishedDirectly = Boolean(direct);

        const track = new LocalVideoTrack(source);
        await localParticipant.publishTrack(track, {
          source: Track.Source.Camera,
          // Several sizes cost several encodes on a machine already
          // compositing every frame; one size is the safe default.
          simulcast,
          // VP9 carries screen text better per bit but has no hardware encoder
          // on most machines. Here, bits are cheaper than CPU.
          videoCodec: "h264",
          videoEncoding: { maxBitrate, maxFramerate: FPS },
          // Balanced, not maintain-resolution: holding 1080p on a CPU that
          // cannot keep up produced a real, measured 1fps.
          degradationPreference: "balanced",
        });
        return track;
      };

      let video: LocalVideoTrack;
      try {
        video = await publishVideo(adaptive);
      } catch (error) {
        // Publishing several sizes is the fragile part. Losing the stream
        // entirely over it is far worse than losing the viewer's choice.
        if (!adaptive) throw error;

        console.warn("Simulcast publish failed; retrying with one size", error);
        onPublishError(
          "Viewer quality choice could not be started, so a single size is going out.",
        );
        video = await publishVideo(false);
      }

      published.push(video);

      // Polled: WebRTC has no event for "your quality just dropped".
      let previous = { bytes: 0, at: Date.now() };
      statsTimer = setInterval(() => {
        void readHealth(video, previous).then((result) => {
          if (!result) return;
          previous = { bytes: result.bytes, at: Date.now() };
          onHealth({ ...result.health, direct: publishedDirectly });
        });
      }, STATS_INTERVAL_MS);

      const audioStream = getAudioStream();
      const [mixedTrack] = audioStream?.getAudioTracks() ?? [];
      if (mixedTrack) {
        // Stops the browser applying voice-call processing to a mix that is
        // usually music, a game, or a video as well as a voice.
        mixedTrack.contentHint = "music";

        const audio = new LocalAudioTrack(mixedTrack);
        await localParticipant.publishTrack(audio, {
          source: Track.Source.Microphone,
          // Double the music-grade preset: this mix carries a voice and
          // whatever is being shared, and 64k is audibly thin for both.
          audioPreset: { maxBitrate: 128_000 },
          dtx: false,
          red: true,
        });
        published.push(audio);
      }

      if (cancelled) return;
      await setBroadcastLive(true);
    };

    publish().catch((error: unknown) => {
      console.error("Could not publish the studio output", error);

      // Held on screen, not just toasted: the last time this failed, the
      // studio went on saying "you are live" with nothing going out.
      onPublishError(
        error instanceof Error ? error.message : "Your stream could not be published.",
      );
      toast.error("Could not publish your stream");
    });

    return () => {
      cancelled = true;
      clearInterval(statsTimer);
      onHealth(null);
      published.forEach((track) => {
        void localParticipant.unpublishTrack(track);
        track.stop();
      });
    };
  }, [
    isConnected,
    localParticipant,
    getOutputCanvas,
    getAudioStream,
    maxBitrate,
    adaptive,
    directMode,
    getPassthroughTrack,
    onHealth,
    onPublishError,
  ]);

  return null;
}

function StudioRoom({
  token,
  maxBitrate,
  adaptive,
  directMode,
  getPassthroughTrack,
  onHealth,
  onPublishError,
  onDisconnected,
}: {
  token: string;
  maxBitrate: number;
  adaptive: boolean;
  directMode: boolean;
  getPassthroughTrack: () => MediaStreamTrack | null;
  onHealth: (health: StreamHealth | null) => void;
  onPublishError: (message: string | null) => void;
  onDisconnected: () => void;
}) {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
      connect
      video={false}
      audio={false}
      onDisconnected={onDisconnected}
      onError={(error) => {
        console.error("LiveKit room error", error);
        toast.error("Lost connection to the stream");
      }}
    >
      <StudioPublisher
        maxBitrate={maxBitrate}
        adaptive={adaptive}
        directMode={directMode}
        getPassthroughTrack={getPassthroughTrack}
        onHealth={onHealth}
        onPublishError={onPublishError}
      />
    </LiveKitRoom>
  );
}

export default StudioRoom;
export type { StreamHealth };
