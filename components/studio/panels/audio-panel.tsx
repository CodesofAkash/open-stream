"use client";

import { useEffect, useState } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useStudio } from "@/components/studio/studio-provider";

// What viewers hear is the sum of these faders, one row per input that exists
// — which is the answer to "is my screen's sound going out or not".

const METER_INTERVAL_MS = 100;

/** One bar, so a level is something a person can judge rather than a number. */
function LevelMeter({ label, level, muted }: { label: string; level: number; muted: boolean }) {
  const width = Math.round((muted ? 0 : level) * 100);

  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      role="meter"
      aria-label={`${label} level`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={width}
    >
      <div
        className="h-full rounded-full bg-emerald-500 transition-[width] duration-75"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function AudioPanel() {
  const { channels, getLevels, setChannelVolume, setChannelMuted, captures, toggleCapture } =
    useStudio();

  const [levels, setLevels] = useState<Record<string, number>>({});

  // Syncs with the Web Audio analysers, which have nothing to subscribe to.
  // Sampled here, not in the provider, where it re-rendered the canvas.
  useEffect(() => {
    if (channels.length === 0) return;

    const timer = setInterval(() => setLevels(getLevels()), METER_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [channels.length, getLevels]);

  return (
    <section className="space-y-4" aria-labelledby="audio-heading">
      <h2 id="audio-heading" className="text-sm font-semibold uppercase tracking-wide">
        Audio mixer
      </h2>

      {channels.map((channel) => (
        <div key={channel.id} className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor={`volume-${channel.id}`} className="flex items-center gap-2 text-sm">
              {channel.id === "microphone" ? (
                <Mic className="size-4" aria-hidden="true" />
              ) : (
                <Volume2 className="size-4" aria-hidden="true" />
              )}
              {channel.label}
            </Label>

            <Button
              variant="ghost"
              size="sm"
              aria-pressed={channel.muted}
              aria-label={channel.muted ? `Unmute ${channel.label}` : `Mute ${channel.label}`}
              onClick={() => setChannelMuted(channel.id, !channel.muted)}
            >
              {channel.muted ? (
                <VolumeX className="size-4 text-destructive" aria-hidden="true" />
              ) : (
                <Volume2 className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>

          <LevelMeter
            label={channel.label}
            level={levels[channel.id] ?? 0}
            muted={channel.muted}
          />

          <Slider
            id={`volume-${channel.id}`}
            value={[channel.volume]}
            min={0}
            max={1.5}
            step={0.01}
            disabled={channel.muted}
            onValueChange={([value]) => setChannelVolume(channel.id, value)}
          />
        </div>
      ))}

      {!captures.microphone && (
        <Button variant="outline" size="sm" onClick={() => void toggleCapture("microphone")}>
          <MicOff className="mr-2 size-4" aria-hidden="true" />
          Add microphone
        </Button>
      )}

      {/* The commonest cause of "my viewers cannot hear the video I am
          playing", and invisible unless something says it out loud. */}
      {captures.screen && !channels.some((channel) => channel.id === "screen") && (
        <p className="text-xs text-muted-foreground">
          This share carries no sound. Re-share and tick “Also share tab audio” (a Chrome tab) or
          “Share system audio” (a whole screen) to include it.
        </p>
      )}

      {channels.length === 0 && !captures.microphone && (
        <p className="text-xs text-muted-foreground">
          Nothing is producing sound yet. Viewers will hear silence.
        </p>
      )}
    </section>
  );
}

export default AudioPanel;
