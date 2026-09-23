"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStudio } from "@/components/studio/studio-provider";

// Switching scene mid-broadcast is the point of having scenes: the canvas the
// viewer receives is whatever is active, so the cut happens on the next frame.
function ScenesPanel() {
  const { scenes, activeSceneId, selectScene, addScene, removeScene } = useStudio();
  const [name, setName] = useState("");

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    await addScene(trimmed);
    setName("");
  };

  return (
    <section className="flex h-full flex-col gap-3" aria-labelledby="scenes-heading">
      <h2 id="scenes-heading" className="text-sm font-semibold uppercase tracking-wide">
        Scenes
      </h2>

      <ul className="flex-1 space-y-1 overflow-y-auto">
        {scenes.map((scene) => (
          <li key={scene.id} className="flex items-center gap-1">
            <Button
              variant={scene.id === activeSceneId ? "secondary" : "ghost"}
              size="sm"
              className="flex-1 justify-start"
              aria-current={scene.id === activeSceneId ? "true" : undefined}
              onClick={() => selectScene(scene.id)}
            >
              {scene.name}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Delete ${scene.name}`}
              disabled={scenes.length <= 1}
              onClick={() => void removeScene(scene.id)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New scene"
          aria-label="New scene name"
          maxLength={60}
        />
        <Button type="submit" size="sm" variant="outline" aria-label="Add scene">
          <Plus className="size-4" aria-hidden="true" />
        </Button>
      </form>
    </section>
  );
}

export default ScenesPanel;
