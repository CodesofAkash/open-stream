"use client";

import { Participant, RemoteTrackPublication, Track } from "livekit-client";
import { useRef, useState, useEffect } from "react";
import { useTracks } from "@livekit/components-react";
import { Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FullscreenControl } from "./fullscreen-control";
import { QualityControl } from "./quality-control";
import { useEventListener } from "usehooks-ts";
import { VolumeControl } from "./volume-control";

interface LiveVideoProps {
  participant: Participant;
}

export const LiveVideo = ({ participant }: LiveVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(0);

  const onVolumeChange = (value: number) => {
    setVolume(+value);
    if (videoRef?.current) {
      videoRef.current.muted = value === 0;
      videoRef.current.volume = +value * 0.01;
    }
  };

  const toggleMute = () => {
    const isMuted = volume === 0;

    setVolume(isMuted ? 50 : 0);

    if (videoRef?.current) {
      videoRef.current.muted = !isMuted;
      videoRef.current.volume = isMuted ? 0.5 : 0;
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else if (wrapperRef?.current) {
      wrapperRef.current.requestFullscreen();
    }
  };

  const handleFullscreenChange = () => {
    const isCurrentlyFullscreen = document.fullscreenElement !== null;
    setIsFullscreen(isCurrentlyFullscreen);
  };

  useEventListener("fullscreenchange", handleFullscreenChange, wrapperRef as React.RefObject<HTMLElement>);
  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
    Track.Source.ScreenShare,
    Track.Source.ScreenShareAudio,
  ]).filter((track) => track.participant.identity === participant.identity);

  // When a screen is being shared it becomes the main picture and the camera
  // moves to a corner — the layout every streaming platform uses, and the one
  // a viewer expects. Publishing them as two tracks means neither is
  // re-encoded and the viewer sees each at its native quality.
  // The composed picture publishes as the camera source, so that is the one a
  // viewer would want smaller.
  const cameraPublication = tracks.find(
    (track) => track.publication.source === Track.Source.Camera,
  )?.publication;

  const screenTrack = tracks.find(
    (track) => track.publication.source === Track.Source.ScreenShare,
  );
  const isSharingScreen = Boolean(screenTrack);

  /**
   * Attaching in an effect, not during render.
   *
   * This used to run in the component body, so every re-render re-attached the
   * media stream to the <video> element and reset its decoding pipeline — which
   * shows up as stuttering video and audio drifting out of sync. React can
   * re-render for any reason at any time; media attachment is a side effect on
   * a DOM node and belongs in an effect with a matching detach.
   */
  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    // The main element carries the screen when there is one, plus all audio.
    const attached = tracks
      .filter((track) =>
        isSharingScreen
          ? track.publication.source !== Track.Source.Camera
          : track.publication.source !== Track.Source.ScreenShare,
      )
      .map((track) => track.publication.track)
      .filter((track): track is NonNullable<typeof track> => Boolean(track));

    attached.forEach((track) => track.attach(element));

    return () => {
      attached.forEach((track) => track.detach(element));
    };
    // Keyed by the track sids so this re-runs when the tracks actually change,
    // rather than on every render.
  }, [tracks.map((track) => track.publication.trackSid).join(","), isSharingScreen]);  // eslint-disable-line react-hooks/exhaustive-deps

  // The camera, shown inset while a screen is being shared.
  useEffect(() => {
    const element = cameraRef.current;
    const track = tracks.find(
      (item) => item.publication.source === Track.Source.Camera,
    )?.publication.track;

    if (!element || !track || !isSharingScreen) return;

    track.attach(element);
    return () => {
      track.detach(element);
    };
  }, [tracks.map((track) => track.publication.trackSid).join(","), isSharingScreen]);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={wrapperRef} className="relative h-full flex">
      <video
        ref={videoRef}
        width="100%"
        autoPlay
        playsInline
        muted
        className="h-full w-full object-contain"
      />
      {/*
        Browsers only autoplay muted video, so every viewer starts muted and
        the volume control is easy to miss — which reads as "this stream has no
        sound". One obvious button beats a slider nobody finds.
      */}
      {volume === 0 && (
        <Button
          size="sm"
          onClick={toggleMute}
          className="absolute inset-x-0 top-4 z-10 mx-auto w-fit rounded-full bg-black/80 text-white hover:bg-black"
        >
          <Volume2 className="mr-2 size-4" aria-hidden="true" />
          Click to unmute
        </Button>
      )}
      {isSharingScreen ? (
        <video
          ref={cameraRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-16 right-4 w-1/4 max-w-[220px] rounded-md border border-white/20 bg-black object-cover shadow-lg"
        />
      ) : null}
      <div className="absolute top-0 h-full w-full opacity-0 hover:opacity-100 hover:transition-all">
        <div className="absolute bottom-0 flex h-14 w-full items-center justify-between bg-gradient-to-r from-neutral-900 px-4">
          <VolumeControl
            onChange={onVolumeChange}
            value={volume}
            onToggle={toggleMute}
          />
          <div className="flex items-center gap-2">
            <QualityControl
              publication={
                cameraPublication instanceof RemoteTrackPublication
                  ? cameraPublication
                  : undefined
              }
            />
            <FullscreenControl
              isFullscreen={isFullscreen}
              onToggle={toggleFullscreen}
            />
          </div>
        </div>
      </div>
    </div>
  );
};