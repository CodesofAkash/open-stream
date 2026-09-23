"use client";

import Link from "next/link";
import { Mic, MonitorUp, Radio, Save, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useStudio } from "@/components/studio/studio-provider";

// Capture on the left, broadcasting on the right: setting up and going live
// are not the same act, and the layout should not suggest they are.
function ControlsPanel({ username }: { username: string }) {
  const {
    captures,
    toggleCapture,
    isLive,
    isStarting,
    goLive,
    stopLive,
    isDirty,
    isSaving,
    saveActiveScene,
  } = useStudio();

  const devices = [
    { kind: "camera", label: "Camera", icon: Video },
    { kind: "microphone", label: "Microphone", icon: Mic },
    { kind: "screen", label: "Screen", icon: MonitorUp },
  ] as const;

  return (
    <section className="flex flex-wrap items-center gap-2" aria-label="Studio controls">
      {devices.map(({ kind, label, icon: Icon }) => (
        <Button
          key={kind}
          variant={captures[kind] ? "secondary" : "outline"}
          size="sm"
          aria-pressed={captures[kind]}
          onClick={() => void toggleCapture(kind)}
        >
          <Icon className="mr-2 size-4" aria-hidden="true" />
          {label} {captures[kind] ? "on" : "off"}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        disabled={!isDirty || isSaving}
        onClick={() => void saveActiveScene()}
      >
        <Save className="mr-2 size-4" aria-hidden="true" />
        {isSaving ? "Saving…" : isDirty ? "Save scene" : "Saved"}
      </Button>

      <div className="ml-auto flex items-center gap-3">
        {isLive && (
          <Link
            href={`/${username}`}
            className="flex items-center gap-2 text-sm font-medium text-rose-500 underline-offset-4 hover:underline"
          >
            <Radio className="size-4 animate-pulse" aria-hidden="true" />
            Live — open your channel
          </Link>
        )}

        <Button
          variant={isLive ? "destructive" : "default"}
          disabled={isStarting}
          className={isLive ? undefined : "bg-rose-600 text-white hover:bg-rose-700"}
          onClick={() => void (isLive ? stopLive() : goLive())}
        >
          {isLive ? "End stream" : isStarting ? "Going live…" : "Go live"}
        </Button>
      </div>
    </section>
  );
}

export default ControlsPanel;
