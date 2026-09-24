"use client";

import { useEffect, useState } from "react";
import { Crop, FlipHorizontal, Pause, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { UploadButton } from "@/lib/uploadthing";
import { CANVAS_HEIGHT, CANVAS_WIDTH, createSource } from "@/lib/studio/scene";
import { useStudio } from "@/components/studio/studio-provider";

const PROGRESS_INTERVAL_MS = 250;

/** mm:ss, since a raw seconds count means nothing to look at. */
function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

/** Play/pause, seek and loop for a video or audio file source. */
function MediaControls({ id }: { id: string }) {
  const { isMediaPlaying, playMedia, pauseMedia, seekMedia, mediaProgress } = useStudio();
  const [progress, setProgress] = useState({ current: 0, duration: 0 });
  const [playing, setPlaying] = useState(false);

  // Syncs with the media element's own clock, which has no React-visible
  // event for "still playing" — it has to be sampled like the level meters.
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(mediaProgress(id));
      setPlaying(isMediaPlaying(id));
    }, PROGRESS_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [id, mediaProgress, isMediaPlaying]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => (playing ? pauseMedia(id) : playMedia(id))}
        >
          {playing ? (
            <Pause className="mr-2 size-4" aria-hidden="true" />
          ) : (
            <Play className="mr-2 size-4" aria-hidden="true" />
          )}
          {playing ? "Pause" : "Play"}
        </Button>
        <span className="text-xs text-muted-foreground">
          {formatTime(progress.current)} / {formatTime(progress.duration)}
        </span>
      </div>
      <Slider
        aria-label="Playback position"
        value={[progress.current]}
        min={0}
        max={progress.duration || 1}
        step={0.1}
        onValueChange={([value]) => seekMedia(id, value)}
      />
    </div>
  );
}

// Everything here can also be done by dragging on the canvas. The numbers are
// for the cases dragging is bad at: exact alignment, and text.
function PropertiesPanel() {
  const { activeScene, selectedSourceIds, updateSource, croppingSourceId, setCroppingSource } =
    useStudio();
  const source =
    selectedSourceIds.length === 1
      ? activeScene?.sources.find((item) => item.id === selectedSourceIds[0])
      : undefined;

  if (selectedSourceIds.length > 1) {
    return (
      <section className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
        {selectedSourceIds.length} sources selected. Drag them together on the canvas, or select
        one to edit it.
      </section>
    );
  }

  if (!source) {
    return (
      <section className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
        Select something on the canvas to edit it.
      </section>
    );
  }

  const patch = (next: Parameters<typeof updateSource>[1]) => updateSource(source.id, next);

  return (
    <section className="flex h-full flex-col gap-3 overflow-y-auto" aria-labelledby="properties-heading">
      <h2 id="properties-heading" className="text-sm font-semibold uppercase tracking-wide">
        Properties
      </h2>

      {/* Cropping and resizing are easy to get lost in; this is the way back. */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const fresh = createSource(source.kind, 0);
          patch({
            width: fresh.width,
            height: fresh.height,
            rotation: 0,
            ...("crop" in fresh ? { crop: fresh.crop } : {}),
            ...("flipHorizontal" in fresh ? { flipHorizontal: fresh.flipHorizontal } : {}),
          });
        }}
      >
        <RotateCcw className="mr-2 size-4" aria-hidden="true" />
        Reset size and crop
      </Button>

      <div className="space-y-1">
        <Label htmlFor="source-name">Name</Label>
        <Input
          id="source-name"
          value={source.name}
          maxLength={40}
          onChange={(event) => patch({ name: event.target.value })}
        />
      </div>

      {source.kind === "text" && (
        <>
          <div className="space-y-1">
            <Label htmlFor="source-text">Text</Label>
            <Input
              id="source-text"
              value={source.text}
              onChange={(event) => patch({ text: event.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="source-size">Size — {Math.round(source.fontSize)}px</Label>
            <Slider
              id="source-size"
              value={[source.fontSize]}
              min={12}
              max={160}
              step={1}
              onValueChange={([value]) => patch({ fontSize: value })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="source-bold">Bold</Label>
            <Switch
              id="source-bold"
              checked={source.bold}
              onCheckedChange={(checked) => patch({ bold: checked })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="source-colour">Colour</Label>
            <Input
              id="source-colour"
              type="color"
              className="h-10 p-1"
              value={source.fill}
              onChange={(event) => patch({ fill: event.target.value })}
            />
          </div>
        </>
      )}

      {source.kind === "color" && (
        <>
          <div className="space-y-1">
            <Label htmlFor="source-fill">Colour</Label>
            <Input
              id="source-fill"
              type="color"
              className="h-10 p-1"
              value={source.fill}
              onChange={(event) => patch({ fill: event.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="source-radius">Corner radius — {source.cornerRadius}px</Label>
            <Slider
              id="source-radius"
              value={[source.cornerRadius]}
              min={0}
              max={80}
              step={1}
              onValueChange={([value]) => patch({ cornerRadius: value })}
            />
          </div>
        </>
      )}

      {source.kind === "image" && (
        <div className="space-y-2">
          <Label>Image</Label>
          <UploadButton
            endpoint="sceneImageUploader"
            onClientUploadComplete={(files) => {
              const url = files[0]?.ufsUrl;
              if (url) patch({ url });
            }}
            onUploadError={(error: Error) => {
              console.error("Scene image upload failed", error);
              toast.error("Could not upload that image");
            }}
          />
          {source.url ? (
            <p className="truncate text-xs text-muted-foreground">{source.url}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              PNG with transparency works best for logos and overlays.
            </p>
          )}
        </div>
      )}

      {source.kind === "video" && (
        <div className="space-y-2">
          <Label>Video file</Label>
          <UploadButton
            endpoint="sceneVideoUploader"
            onClientUploadComplete={(files) => {
              const url = files[0]?.ufsUrl;
              if (url) patch({ url });
            }}
            onUploadError={(error: Error) => {
              console.error("Scene video upload failed", error);
              toast.error("Could not upload that video");
            }}
          />
          {source.url ? (
            <MediaControls id={source.id} />
          ) : (
            <p className="text-xs text-muted-foreground">
              Plays into the scene like a clip in OBS. Its sound joins the mixer.
            </p>
          )}
          <div className="flex items-center justify-between">
            <Label htmlFor="source-loop">Loop</Label>
            <Switch
              id="source-loop"
              checked={source.loop}
              onCheckedChange={(checked) => patch({ loop: checked })}
            />
          </div>
        </div>
      )}

      {source.kind === "audio" && (
        <div className="space-y-2">
          <Label>Audio file</Label>
          <UploadButton
            endpoint="sceneAudioUploader"
            onClientUploadComplete={(files) => {
              const url = files[0]?.ufsUrl;
              if (url) patch({ url });
            }}
            onUploadError={(error: Error) => {
              console.error("Scene audio upload failed", error);
              toast.error("Could not upload that audio");
            }}
          />
          {source.url ? (
            <MediaControls id={source.id} />
          ) : (
            <p className="text-xs text-muted-foreground">
              Plays with no picture. Volume and mute live in the audio mixer.
            </p>
          )}
          <div className="flex items-center justify-between">
            <Label htmlFor="source-loop-audio">Loop</Label>
            <Switch
              id="source-loop-audio"
              checked={source.loop}
              onCheckedChange={(checked) => patch({ loop: checked })}
            />
          </div>
        </div>
      )}

      {(source.kind === "camera" ||
        source.kind === "screen" ||
        source.kind === "image" ||
        source.kind === "video") && (
        <>
          <Button
            variant={croppingSourceId === source.id ? "secondary" : "outline"}
            size="sm"
            aria-pressed={croppingSourceId === source.id}
            onClick={() => setCroppingSource(croppingSourceId === source.id ? null : source.id)}
          >
            <Crop className="mr-2 size-4" aria-hidden="true" />
            {croppingSourceId === source.id ? "Done cropping" : "Crop on canvas"}
          </Button>

          <div className="flex items-center justify-between">
            <Label htmlFor="source-flip" className="flex items-center gap-2">
              <FlipHorizontal className="size-4" aria-hidden="true" />
              Mirror
            </Label>
            <Switch
              id="source-flip"
              checked={source.flipHorizontal}
              onCheckedChange={(checked) => patch({ flipHorizontal: checked })}
            />
          </div>
        </>
      )}

      {source.kind !== "audio" && (
      <fieldset className="grid grid-cols-2 gap-2">
        <legend className="mb-1 text-xs text-muted-foreground">Position and size</legend>
        <div className="space-y-1">
          <Label htmlFor="source-x">X</Label>
          <Input
            id="source-x"
            type="number"
            value={Math.round(source.x)}
            onChange={(event) => patch({ x: Number(event.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="source-y">Y</Label>
          <Input
            id="source-y"
            type="number"
            value={Math.round(source.y)}
            onChange={(event) => patch({ y: Number(event.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="source-width">Width</Label>
          <Input
            id="source-width"
            type="number"
            min={24}
            max={CANVAS_WIDTH * 2}
            value={Math.round(source.width)}
            onChange={(event) => patch({ width: Math.max(24, Number(event.target.value)) })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="source-height">Height</Label>
          <Input
            id="source-height"
            type="number"
            min={24}
            max={CANVAS_HEIGHT * 2}
            value={Math.round(source.height)}
            onChange={(event) => patch({ height: Math.max(24, Number(event.target.value)) })}
          />
        </div>
      </fieldset>
      )}
    </section>
  );
}

export default PropertiesPanel;
