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
import { LiveKitRoom, useLocalParticipant } from "@livekit/components-react";
import { AudioPresets, LocalAudioTrack, LocalVideoTrack, Track } from "livekit-client";
import { toast } from "sonner";

import { setBroadcastLive } from "@/actions/broadcast";
import { useStudio } from "@/components/studio/studio-provider";

const FPS = 30;

function StudioPublisher() {
  const { localParticipant } = useLocalParticipant();
  const { getOutputCanvas, getAudioStream } = useStudio();

  // Syncs with the LiveKit room; everything published comes back down on unmount.
  useEffect(() => {
    const published: (LocalVideoTrack | LocalAudioTrack)[] = [];
    let cancelled = false;

    const publish = async () => {
      const canvas = getOutputCanvas();
      if (!canvas) {
        toast.error("The studio canvas is not ready yet");
        return;
      }

      const [canvasTrack] = canvas.captureStream(FPS).getVideoTracks();
      const video = new LocalVideoTrack(canvasTrack);
      await localParticipant.publishTrack(video, {
        source: Track.Source.Camera,
        simulcast: true,
        videoEncoding: { maxBitrate: 2_500_000, maxFramerate: FPS },
        // Shared screens are full of text, which survives a dropped frame far
        // better than it survives being scaled down.
        degradationPreference: "maintain-resolution",
      });
      published.push(video);

      const audioStream = getAudioStream();
      const [mixedTrack] = audioStream?.getAudioTracks() ?? [];
      if (mixedTrack) {
        const audio = new LocalAudioTrack(mixedTrack);
        await localParticipant.publishTrack(audio, {
          source: Track.Source.Microphone,
          // The speech defaults are built for a phone call and make music and
          // game audio sound like one. This is the music-grade preset, with
          // silence detection off so quiet passages are not cut.
          audioPreset: AudioPresets.musicHighQualityStereo,
          dtx: false,
          red: true,
          forceStereo: true,
        });
        published.push(audio);
      }

      if (cancelled) return;
      await setBroadcastLive(true);
    };

    publish().catch((error: unknown) => {
      console.error("Could not publish the studio output", error);
      toast.error("Could not publish your stream");
    });

    return () => {
      cancelled = true;
      published.forEach((track) => {
        void localParticipant.unpublishTrack(track);
        track.stop();
      });
    };
  }, [localParticipant, getOutputCanvas, getAudioStream]);

  return null;
}

function StudioRoom({ token }: { token: string }) {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
      connect
      video={false}
      audio={false}
      onError={() => toast.error("Lost connection to the stream")}
    >
      <StudioPublisher />
    </LiveKitRoom>
  );
}

export default StudioRoom;
