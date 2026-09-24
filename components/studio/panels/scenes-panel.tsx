"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStudio } from "@/components/studio/studio-provider";
import { SortableList, SortableRow } from "@/components/studio/panels/sortable-list";

// Switching scene mid-broadcast is the point of having scenes: the canvas the
// viewer receives is whatever is active, so the cut happens on the next frame.
function ScenesPanel() {
  const { scenes, activeSceneId, selectScene, addScene, removeScene, renameScene, reorderScenes } =
    useStudio();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const submitNew = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    await addScene(trimmed);
    setNewName("");
  };

  const startEditing = (id: string, name: string) => {
    setEditingId(id);
    setDraftName(name);
  };

  const commitEditing = async () => {
    if (!editingId) return;

    const id = editingId;
    setEditingId(null);
    await renameScene(id, draftName);
  };

  return (
    <section className="space-y-3" aria-labelledby="scenes-heading">
      <h2 id="scenes-heading" className="text-sm font-semibold uppercase tracking-wide">
        Scenes
      </h2>

      <SortableList
        label="Scenes"
        ids={scenes.map((scene) => scene.id)}
        onReorder={(ids) => void reorderScenes(ids)}
      >
        {scenes.map((scene) => (
          <SortableRow key={scene.id} id={scene.id} isActive={scene.id === activeSceneId}>
            {editingId === scene.id ? (
              <>
                <Input
                  autoFocus
                  value={draftName}
                  maxLength={60}
                  aria-label={`Rename ${scene.name}`}
                  onChange={(event) => setDraftName(event.target.value)}
                  onBlur={() => void commitEditing()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void commitEditing();
                    if (event.key === "Escape") setEditingId(null);
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Save name"
                  onClick={() => void commitEditing()}
                >
                  <Check className="size-4" aria-hidden="true" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant={scene.id === activeSceneId ? "secondary" : "ghost"}
                  size="sm"
                  className="flex-1 justify-start truncate"
                  aria-current={scene.id === activeSceneId ? "true" : undefined}
                  onClick={() => selectScene(scene.id)}
                  onDoubleClick={() => startEditing(scene.id, scene.name)}
                >
                  {scene.name}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Rename ${scene.name}`}
                  onClick={() => startEditing(scene.id, scene.name)}
                >
                  <Pencil className="size-4" aria-hidden="true" />
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
              </>
            )}
          </SortableRow>
        ))}
      </SortableList>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void submitNew();
        }}
      >
        <Input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
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
