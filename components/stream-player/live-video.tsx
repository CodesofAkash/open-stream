"use client";

import { Participant, Track } from "livekit-client";
import { useRef, useState, useEffect } from "react";
import { useTracks } from "@livekit/components-react";
import { FullscreenControl } from "./fullscreen-control";
import { useEventListener } from "usehooks-ts";
import { VolumeControl } from "./volume-control";

interface LiveVideoProps {
  participant: Participant;
}

export const LiveVideo = ({ participant }: LiveVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    onVolumeChange(0);
  }, []);

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
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone]).filter(
    (track) => track.participant.identity === participant.identity,
  );

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

    const attached = tracks
      .map((track) => track.publication.track)
      .filter((track): track is NonNullable<typeof track> => Boolean(track));

    attached.forEach((track) => track.attach(element));

    return () => {
      attached.forEach((track) => track.detach(element));
    };
    // Keyed by the track sids so this re-runs when the tracks actually change,
    // rather than on every render.
  }, [tracks.map((track) => track.publication.trackSid).join(",")]);  // eslint-disable-line react-hooks/exhaustive-deps

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
      <div className="absolute top-0 h-full w-full opacity-0 hover:opacity-100 hover:transition-all">
        <div className="absolute bottom-0 flex h-14 w-full items-center justify-between bg-gradient-to-r from-neutral-900 px-4">
          <VolumeControl
            onChange={onVolumeChange}
            value={volume}
            onToggle={toggleMute}
          />
          <FullscreenControl
            isFullscreen={isFullscreen}
            onToggle={toggleFullscreen}
          />
        </div>
      </div>
    </div>
  );
};