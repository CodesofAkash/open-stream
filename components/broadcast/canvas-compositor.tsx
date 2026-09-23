"use client";

import { useEffect, useRef } from "react";
import { Layers, MonitorUp, MonitorX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useCompositor, type CameraCorner } from "@/components/broadcast/compositor-provider";

// Only the control surface: the composition runs in <CompositorProvider> at the
// root, so leaving this page changes nothing about what viewers receive.
const CORNERS: { value: CameraCorner; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-right", label: "Bottom right" },
];

function CanvasCompositor() {
  const { isComposing, isStarting, composedTrack, layout, setLayout, start, stop } = useCompositor();
  const previewRef = useRef<HTMLVideoElement>(null);

  // Syncs with the LiveKit track: attaching is a side effect on a DOM node, and
  // doing it during render resets the decoder on every re-render.
  useEffect(() => {
    const element = previewRef.current;
    if (!element || !composedTrack) return;

    composedTrack.attach(element);
    return () => {
      composedTrack.detach(element);
    };
  }, [composedTrack]);

  return (
    <section className="space-y-4 rounded-md border border-border p-4" aria-labelledby="studio-mode">
      <div className="flex flex-wrap items-center gap-3">
        <Layers className="size-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="mr-auto">
          <h2 id="studio-mode" className="font-semibold">
            Studio mode
          </h2>
          <p className="text-sm text-muted-foreground">
            Compose your screen and camera into a single picture, the way OBS does.
            Your viewers see exactly the preview below.
          </p>
        </div>
        <Button
          variant={isComposing ? "destructive" : "default"}
          disabled={isStarting}
          onClick={() => void (isComposing ? stop() : start())}
        >
          {isComposing ? (
            <>
              <MonitorX className="mr-2 size-4" aria-hidden="true" />
              Exit studio mode
            </>
          ) : (
            <>
              <MonitorUp className="mr-2 size-4" aria-hidden="true" />
              {isStarting ? "Starting…" : "Start studio mode"}
            </>
          )}
        </Button>
      </div>

      {isComposing && (
        <>
          <video
            ref={previewRef}
            autoPlay
            playsInline
            muted
            className="aspect-video w-full rounded-md bg-black object-contain"
          />

          <fieldset className="space-y-2">
            <legend className="text-sm text-muted-foreground">Camera position</legend>
            <div className="flex flex-wrap gap-2">
              {CORNERS.map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={layout.corner === option.value ? "secondary" : "outline"}
                  aria-pressed={layout.corner === option.value}
                  onClick={() => setLayout({ corner: option.value })}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </fieldset>

          <div className="max-w-sm space-y-2">
            <Label htmlFor="camera-size" className="block text-sm text-muted-foreground">
              Camera size — {layout.cameraScale}% of the frame
            </Label>
            <Slider
              id="camera-size"
              value={[layout.cameraScale]}
              onValueChange={([value]) => setLayout({ cameraScale: value })}
              min={12}
              max={45}
              step={1}
              aria-label="Camera size as a percentage of the frame"
            />
          </div>
        </>
      )}
    </section>
  );
}

export default CanvasCompositor;
