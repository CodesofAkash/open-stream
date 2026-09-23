"use client";

import { Mic, MicOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useStudio } from "@/components/studio/studio-provider";

// What viewers hear is the sum of these faders — including the shared tab's
// audio, which is why it is audible to them at all.
function AudioPanel() {
  const { channels, levels, setChannelVolume, setChannelMuted } = useStudio();

  return (
    <section className="flex h-full flex-col gap-3" aria-labelledby="audio-heading">
      <h2 id="audio-heading" className="text-sm font-semibold uppercase tracking-wide">
        Audio mixer
      </h2>

      {channels.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Turn on your microphone, or share a screen with its sound, and it will appear here.
        </p>
      ) : (
        <ul className="space-y-4">
          {channels.map((channel) => (
            <li key={channel.id} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor={`volume-${channel.id}`} className="text-sm">
                  {channel.label}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={channel.muted ? `Unmute ${channel.label}` : `Mute ${channel.label}`}
                  aria-pressed={channel.muted}
                  onClick={() => setChannelMuted(channel.id, !channel.muted)}
                >
                  {channel.muted ? (
                    <MicOff className="size-4 text-destructive" aria-hidden="true" />
                  ) : (
                    <Mic className="size-4" aria-hidden="true" />
                  )}
                </Button>
              </div>

              {/* A number nobody can judge, made into something they can. */}
              <div
                className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                role="meter"
                aria-label={`${channel.label} level`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round((levels[channel.id] ?? 0) * 100)}
              >
                <div
                  className="h-full rounded-full bg-emerald-500 transition-[width] duration-75"
                  style={{ width: `${Math.round((channel.muted ? 0 : levels[channel.id] ?? 0) * 100)}%` }}
                />
              </div>

              <Slider
                id={`volume-${channel.id}`}
                value={[channel.volume]}
                min={0}
                max={1.5}
                step={0.01}
                disabled={channel.muted}
                onValueChange={([value]) => setChannelVolume(channel.id, value)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default AudioPanel;
