"use client";

import { useEffect, useRef, useState } from "react";
import { useLocalParticipant, useMediaDeviceSelect } from "@livekit/components-react";
import { Track } from "livekit-client";
import { Mic, MicOff, MonitorUp, Radio, Video, VideoOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setBroadcastLive } from "@/actions/broadcast";

import { useBroadcast } from "./broadcast-provider";

/** Picker for one class of input device. */
const DeviceSelect = ({
  kind,
  label,
}: {
  kind: MediaDeviceKind;
  label: string;
}) => {
  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({ kind });

  if (devices.length <= 1) return null;

  return (
    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
      {label}
      <Select value={activeDeviceId} onValueChange={(id) => setActiveMediaDevice(id)}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {devices.map((device) => (
            <SelectItem key={device.deviceId} value={device.deviceId}>
              {device.label || "Unnamed device"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
};

/**
 * The controls a streamer actually needs: preview, camera and microphone
 * toggles, device pickers and screen sharing.
 *
 * Screen share is published as its own track rather than replacing the camera,
 * which is how every platform does it — the viewer can then be shown the
 * screen with the camera over it, and neither has to be re-encoded here.
 */
export const BroadcastStudio = () => {
  const { stop } = useBroadcast();
  const {
    localParticipant,
    isCameraEnabled,
    isMicrophoneEnabled,
    isScreenShareEnabled,
  } = useLocalParticipant();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    const element = videoRef.current;
    const track = localParticipant?.getTrackPublication(Track.Source.Camera)?.track;
    if (!element || !track) return;

    track.attach(element);
    return () => {
      track.detach(element);
    };
  }, [localParticipant, isCameraEnabled]);

  // The channel counts as live while anything is being published — a streamer
  // who turns their camera off to show only their screen is still streaming.
  const isPublishing = isCameraEnabled || isScreenShareEnabled || isMicrophoneEnabled;

  useEffect(() => {
    void setBroadcastLive(Boolean(isPublishing)).catch(() => {
      toast.error("Could not update your live status");
    });
  }, [isPublishing]);

  const guard = async (action: () => Promise<unknown>, message: string) => {
    setIsBusy(true);
    try {
      await action();
    } catch {
      toast.error(message);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="aspect-video w-full rounded-md bg-black object-contain"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={isCameraEnabled ? "secondary" : "outline"}
          disabled={isBusy}
          onClick={() =>
            guard(
              () => localParticipant.setCameraEnabled(!isCameraEnabled),
              "Could not switch the camera",
            )
          }
        >
          {isCameraEnabled ? <Video className="mr-2 size-4" /> : <VideoOff className="mr-2 size-4" />}
          {isCameraEnabled ? "Camera on" : "Camera off"}
        </Button>

        <Button
          variant={isMicrophoneEnabled ? "secondary" : "outline"}
          disabled={isBusy}
          onClick={() =>
            guard(
              () => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled),
              "Could not switch the microphone",
            )
          }
        >
          {isMicrophoneEnabled ? <Mic className="mr-2 size-4" /> : <MicOff className="mr-2 size-4" />}
          {isMicrophoneEnabled ? "Mic on" : "Mic off"}
        </Button>

        <Button
          variant={isScreenShareEnabled ? "default" : "outline"}
          disabled={isBusy}
          onClick={() =>
            guard(
              // audio: true also captures tab audio where the browser allows it.
              () => localParticipant.setScreenShareEnabled(!isScreenShareEnabled, { audio: true }),
              "Could not share your screen",
            )
          }
        >
          <MonitorUp className="mr-2 size-4" />
          {isScreenShareEnabled ? "Stop sharing" : "Share screen"}
        </Button>

        <span className="ml-auto flex items-center gap-2 text-sm font-medium text-rose-500">
          <Radio className="size-4 animate-pulse" aria-hidden="true" />
          Live
        </span>

        <Button variant="destructive" onClick={() => void stop()}>
          Stop broadcasting
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <DeviceSelect kind="videoinput" label="Camera" />
        <DeviceSelect kind="audioinput" label="Microphone" />
      </div>
    </div>
  );
};
