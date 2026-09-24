"use client";

import {
  Eye,
  EyeOff,
  FileAudio,
  FileVideo,
  Image as ImageIcon,
  Lock,
  Mic,
  MonitorUp,
  Palette,
  Trash2,
  Type,
  Unlock,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useStudio } from "@/components/studio/studio-provider";
import { SortableList, SortableRow } from "@/components/studio/panels/sortable-list";
import type { SourceKind } from "@/lib/studio/scene";

const KINDS: { kind: SourceKind; label: string; icon: typeof Video }[] = [
  { kind: "camera", label: "Camera", icon: Video },
  { kind: "screen", label: "Screen", icon: MonitorUp },
  { kind: "image", label: "Image", icon: ImageIcon },
  { kind: "video", label: "Video file", icon: FileVideo },
  { kind: "audio", label: "Audio file", icon: FileAudio },
  { kind: "text", label: "Text", icon: Type },
  { kind: "color", label: "Colour", icon: Palette },
];

function SourcesPanel() {
  const {
    activeScene,
    selectedSourceIds,
    selectSource,
    addSource,
    updateSource,
    removeSource,
    reorderSources,
    captures,
    toggleCapture,
    channels,
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

  // Last in the scene is drawn last, so it is in front — which is the top of
  // the list here, the way every editor shows layers.
  const layered = [...sources].reverse();

  return (
    <section className="space-y-3" aria-labelledby="sources-heading">
      <h2 id="sources-heading" className="text-sm font-semibold uppercase tracking-wide">
        Sources
      </h2>

      <SortableList
        label="Sources, front to back"
        ids={layered.map((source) => source.id)}
        onReorder={(ids) => reorderSources([...ids].reverse())}
      >
        {layered.map((source) => (
          <SortableRow
            key={source.id}
            id={source.id}
            isActive={selectedSourceIds.includes(source.id)}
          >
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 justify-start truncate"
              onClick={() => selectSource(source.id)}
            >
              {source.name}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              aria-label={source.visible ? `Hide ${source.name}` : `Show ${source.name}`}
              onClick={() => updateSource(source.id, { visible: !source.visible })}
            >
              {source.visible ? (
                <Eye className="size-4" aria-hidden="true" />
              ) : (
                <EyeOff className="size-4 text-muted-foreground" aria-hidden="true" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              aria-label={source.locked ? `Unlock ${source.name}` : `Lock ${source.name}`}
              onClick={() => updateSource(source.id, { locked: !source.locked })}
            >
              {source.locked ? (
                <Lock className="size-4 text-amber-500" aria-hidden="true" />
              ) : (
                <Unlock className="size-4" aria-hidden="true" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              aria-label={`Remove ${source.name}`}
              onClick={() => removeSource(source.id)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </SortableRow>
        ))}
      </SortableList>

      {sources.length === 0 && (
        <p className="px-2 py-6 text-center text-sm text-muted-foreground">
          Nothing in this scene yet. Add a source below.
        </p>
      )}

      {/*
        Sound has no place on the canvas but is every bit a source, so it is
        listed here rather than left to be guessed at from the mixer.
      */}
      {channels.length > 0 && (
        <ul className="space-y-1 border-t border-border pt-3" aria-label="Audio sources">
          {channels.map((channel) => (
            <li key={channel.id} className="flex items-center gap-1 rounded-md px-1">
              <Mic className="ml-2 size-4 text-muted-foreground" aria-hidden="true" />
              <span className="flex-1 truncate px-2 text-sm">{channel.label}</span>
              {channel.id === "microphone" && (
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Remove microphone"
                  onClick={() => void toggleCapture("microphone")}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        {KINDS.map(({ kind, label, icon: Icon }) => (
          <Button key={kind} variant="outline" size="sm" onClick={() => void add(kind)}>
            <Icon className="mr-2 size-4" aria-hidden="true" />
            {label}
          </Button>
        ))}

        <Button
          variant={captures.microphone ? "secondary" : "outline"}
          size="sm"
          aria-pressed={captures.microphone}
          onClick={() => void toggleCapture("microphone")}
        >
          <Mic className="mr-2 size-4" aria-hidden="true" />
          Microphone
        </Button>
      </div>
    </section>
  );
}

export default SourcesPanel;
