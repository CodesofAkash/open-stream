"use client";

import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Lock,
  MonitorUp,
  Palette,
  Trash2,
  Type,
  Unlock,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { useStudio } from "@/components/studio/studio-provider";
import type { SourceKind } from "@/lib/studio/scene";

const KINDS: { kind: SourceKind; label: string; icon: typeof Video }[] = [
  { kind: "camera", label: "Camera", icon: Video },
  { kind: "screen", label: "Screen", icon: MonitorUp },
  { kind: "image", label: "Image", icon: ImageIcon },
  { kind: "text", label: "Text", icon: Type },
  { kind: "color", label: "Colour", icon: Palette },
];

function SourcesPanel() {
  const {
    activeScene,
    selectedSourceId,
    selectSource,
    addSource,
    updateSource,
    removeSource,
    moveSource,
    captures,
    toggleCapture,
  } = useStudio();

  const add = async (kind: SourceKind) => {
    addSource(kind);

    // Adding a camera or screen source and then being told the device is off
    // would be a pointless second step, so the capture starts with it.
    if ((kind === "camera" || kind === "screen") && !captures[kind]) {
      await toggleCapture(kind);
    }
  };

  const sources = activeScene?.sources ?? [];

  return (
    <section className="flex h-full flex-col gap-3" aria-labelledby="sources-heading">
      <h2 id="sources-heading" className="text-sm font-semibold uppercase tracking-wide">
        Sources
      </h2>

      {/* Topmost in the list is drawn last, so it sits in front. */}
      <ul className="flex-1 space-y-1 overflow-y-auto">
        {[...sources].reverse().map((source) => (
          <li
            key={source.id}
            className={
              source.id === selectedSourceId
                ? "flex items-center gap-1 rounded-md bg-muted px-1"
                : "flex items-center gap-1 rounded-md px-1"
            }
          >
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start truncate"
              onClick={() => selectSource(source.id)}
            >
              {source.name}
            </Button>

            <Hint label={source.visible ? "Hide" : "Show"} asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateSource(source.id, { visible: !source.visible })}
              >
                {source.visible ? (
                  <Eye className="size-4" aria-hidden="true" />
                ) : (
                  <EyeOff className="size-4" aria-hidden="true" />
                )}
              </Button>
            </Hint>

            <Hint label={source.locked ? "Unlock" : "Lock"} asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateSource(source.id, { locked: !source.locked })}
              >
                {source.locked ? (
                  <Lock className="size-4" aria-hidden="true" />
                ) : (
                  <Unlock className="size-4" aria-hidden="true" />
                )}
              </Button>
            </Hint>

            <Hint label="Bring forward" asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveSource(source.id, "forward")}
              >
                <ChevronUp className="size-4" aria-hidden="true" />
              </Button>
            </Hint>

            <Hint label="Send backward" asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveSource(source.id, "backward")}
              >
                <ChevronDown className="size-4" aria-hidden="true" />
              </Button>
            </Hint>

            <Hint label="Remove" asChild>
              <Button variant="ghost" size="sm" onClick={() => removeSource(source.id)}>
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </Hint>
          </li>
        ))}

        {sources.length === 0 && (
          <li className="px-2 py-6 text-center text-sm text-muted-foreground">
            Nothing in this scene yet. Add a source below.
          </li>
        )}
      </ul>

      <div className="flex flex-wrap gap-2">
        {KINDS.map(({ kind, label, icon: Icon }) => (
          <Button key={kind} variant="outline" size="sm" onClick={() => void add(kind)}>
            <Icon className="mr-2 size-4" aria-hidden="true" />
            {label}
          </Button>
        ))}
      </div>
    </section>
  );
}

export default SourcesPanel;
