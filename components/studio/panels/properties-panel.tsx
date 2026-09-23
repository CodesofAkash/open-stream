"use client";

import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { UploadButton } from "@/lib/uploadthing";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/lib/studio/scene";
import { useStudio } from "@/components/studio/studio-provider";

// Everything here can also be done by dragging on the canvas. The numbers are
// for the cases dragging is bad at: exact alignment, and text.
function PropertiesPanel() {
  const { activeScene, selectedSourceId, updateSource } = useStudio();
  const source = activeScene?.sources.find((item) => item.id === selectedSourceId);

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
    </section>
  );
}

export default PropertiesPanel;
