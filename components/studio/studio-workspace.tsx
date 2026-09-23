"use client";

import { useEffect, useRef } from "react";
import { EyeOff, Radio } from "lucide-react";

import { useStudio } from "@/components/studio/studio-provider";
import AudioPanel from "@/components/studio/panels/audio-panel";
import ControlsPanel from "@/components/studio/panels/controls-panel";
import PropertiesPanel from "@/components/studio/panels/properties-panel";
import ScenesPanel from "@/components/studio/panels/scenes-panel";
import SourcesPanel from "@/components/studio/panels/sources-panel";

// Owns no state: the canvas and every capture live above this page, so leaving
// it interrupts nothing.
function StudioWorkspace({ username }: { username: string }) {
  const { ensureScenes, isLoadingScenes, activeScene, hostStage, isLive } = useStudio();
  // Only whether a stage exists matters here; re-running on every edit would
  // move the canvas in the DOM each time a source was dragged.
  const hasStage = Boolean(activeScene);
  const stageSlotRef = useRef<HTMLDivElement>(null);

  // Syncs with the server: scenes are fetched the first time the studio opens.
  useEffect(() => {
    void ensureScenes();
  }, [ensureScenes]);

  // Syncs with the DOM: borrows the single live stage element while this page
  // is on screen, and hands it back when it is not.
  useEffect(() => {
    hostStage(stageSlotRef.current);
    return () => hostStage(null);
  }, [hostStage, hasStage]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-black">
        <div ref={stageSlotRef} className="w-full" />

        {!activeScene && (
          <p className="p-10 text-center text-sm text-muted-foreground">
            {isLoadingScenes ? "Loading your scenes…" : "No scene yet."}
          </p>
        )}
      </div>

      {/* Whether anyone can see this must never be in doubt while a camera is on. */}
      <p
        className={
          isLive
            ? "flex items-center gap-2 text-sm font-medium text-rose-500"
            : "flex items-center gap-2 text-sm text-muted-foreground"
        }
      >
        {isLive ? (
          <>
            <Radio className="size-4 animate-pulse" aria-hidden="true" />
            You are live — everything above is going out to your viewers.
          </>
        ) : (
          <>
            <EyeOff className="size-4" aria-hidden="true" />
            Preview only — nobody can see this until you press Go live.
          </>
        )}
      </p>

      <ControlsPanel username={username} />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <div className="min-h-64 rounded-lg border border-border p-4">
          <ScenesPanel />
        </div>
        <div className="min-h-64 rounded-lg border border-border p-4">
          <SourcesPanel />
        </div>
        <div className="min-h-64 rounded-lg border border-border p-4">
          <PropertiesPanel />
        </div>
        <div className="min-h-64 rounded-lg border border-border p-4">
          <AudioPanel />
        </div>
      </div>
    </div>
  );
}

export default StudioWorkspace;
