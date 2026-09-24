"use client";

import Link from "next/link";
import { Mic, MonitorUp, Radio, Save, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { QUALITY_PRESETS, type QualityHeight } from "@/lib/studio/quality";
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
    quality,
    setQuality,
    adaptive,
    setAdaptive,
    directMode,
    setDirectMode,
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

      {/* Changing this while live re-sizes the canvas viewers receive, so it
          is offered only before going live. */}
      <Select
        value={String(quality)}
        disabled={isLive}
        onValueChange={(value) => setQuality(Number(value) as QualityHeight)}
      >
        <SelectTrigger className="w-32" aria-label="Output quality">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(QUALITY_PRESETS).map(([height, preset]) => (
            <SelectItem key={height} value={height}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Skips the canvas entirely when the scene is one full-frame capture:
          no compositing, no re-encode, native resolution. */}
      <div className="flex items-center gap-2">
        <Switch
          id="direct"
          checked={directMode}
          disabled={isLive}
          onCheckedChange={setDirectMode}
        />
        <Label htmlFor="direct" className="text-xs text-muted-foreground">
          Direct mode
        </Label>
      </div>

      {/* Several sizes means several encodes, which is the streamer's CPU
          paying for the viewer's choice. */}
      <div className="flex items-center gap-2">
        <Switch
          id="adaptive"
          checked={adaptive}
          disabled={isLive}
          onCheckedChange={setAdaptive}
        />
        <Label htmlFor="adaptive" className="text-xs text-muted-foreground">
          Viewer quality choice
        </Label>
      </div>

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
