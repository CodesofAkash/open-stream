"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, EyeOff, Radio } from "lucide-react";

import { Button } from "@/components/ui/button";
import { diagnose, type Diagnosis } from "@/lib/studio/diagnosis";
import { QUALITY_PRESETS } from "@/lib/studio/quality";
import { useStudio } from "@/components/studio/studio-provider";
import AudioPanel from "@/components/studio/panels/audio-panel";
import ControlsPanel from "@/components/studio/panels/controls-panel";
import PropertiesPanel from "@/components/studio/panels/properties-panel";
import ScenesPanel from "@/components/studio/panels/scenes-panel";
import SourcesPanel from "@/components/studio/panels/sources-panel";

// A single bad sample reads as the stream dying when it is actually fine, so
// "problem" needs to repeat this many times running before it is shown.
const PROBLEM_CONFIRM_COUNT = 2;

// Owns no state: the canvas and every capture live above this page, so leaving
// it interrupts nothing.
function StudioWorkspace({ username }: { username: string }) {
  const {
    ensureScenes,
    retryScenes,
    isLoadingScenes,
    scenesError,
    activeScene,
    hostStage,
    isLive,
    health,
    publishError,
    quality,
  } = useStudio();

  // Only whether a stage exists matters here; re-running on every edit would
  // move the canvas in the DOM each time a source was dragged.
  const hasStage = Boolean(activeScene);
  const stageSlotRef = useRef<HTMLDivElement>(null);

  // Adjusted during render (React's own pattern for state derived from a
  // prop) rather than in an effect. State, not a ref, holds "previous value".
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [problemStreak, setProblemStreak] = useState(0);
  const [lastHealth, setLastHealth] = useState(health);

  if (health !== lastHealth) {
    setLastHealth(health);

    if (!health) {
      setProblemStreak(0);
      setDiagnosis(null);
    } else {
      const raw = diagnose({
        ...health,
        targetHeight: QUALITY_PRESETS[quality].height,
        targetKbps: QUALITY_PRESETS[quality].maxBitrate,
      });

      if (raw.severity !== "problem") {
        setProblemStreak(0);
        setDiagnosis(raw);
      } else {
        const streak = problemStreak + 1;
        setProblemStreak(streak);
        if (streak >= PROBLEM_CONFIRM_COUNT) setDiagnosis(raw);
      }
    }
  }

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
      {/* aspect-video on the slot itself: the canvas is always 16:9, so the
          space it will occupy is known before it loads and nothing below it
          jumps when it arrives. */}
      <div className="overflow-hidden rounded-lg border border-border bg-black">
        <div ref={stageSlotRef} className="aspect-video w-full" />

        {!activeScene && !scenesError && (
          <p className="p-10 text-center text-sm text-muted-foreground">
            {isLoadingScenes ? "Loading your scenes…" : "No scene yet."}
          </p>
        )}

        {!activeScene && scenesError && (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <AlertTriangle className="size-6 text-amber-500" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{scenesError}</p>
            <Button variant="outline" size="sm" disabled={isLoadingScenes} onClick={() => void retryScenes()}>
              {isLoadingScenes ? "Retrying…" : "Try again"}
            </Button>
          </div>
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
            {health
              ? "You are live — everything above is going out to your viewers."
              : "Connecting — nothing is reaching viewers yet."}
          </>
        ) : (
          <>
            <EyeOff className="size-4" aria-hidden="true" />
            Preview only — nobody can see this until you press Go live.
          </>
        )}
      </p>

      {/*
        Choosing a quality is a request, not a promise: WebRTC quietly lowers
        it when the machine or the uplink cannot keep up, and says why.
      */}
      {/* Held on screen while live, whatever happens: the failure mode that
          cost the most time was a studio that said "you are live" while
          nothing was going out and nothing on screen said so. */}
      {isLive && publishError && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-400">
          {publishError}
        </p>
      )}

      {isLive && !health && !publishError && (
        <p className="rounded-md border border-border px-4 py-2 text-xs text-muted-foreground">
          Measuring what is actually going out…
        </p>
      )}

      {isLive && health && (
        <dl className="flex flex-wrap gap-x-6 gap-y-1 rounded-md border border-border px-4 py-2 text-xs">
          <div className="flex gap-1">
            <dt className="text-muted-foreground">Sending</dt>
            <dd className="font-medium">
              {health.width}×{health.height} @ {health.fps}fps
            </dd>
          </div>
          <div className="flex gap-1">
            <dt className="text-muted-foreground">Bitrate</dt>
            <dd className="font-medium">{health.kbps.toLocaleString()} kbps</dd>
          </div>
          <div className="flex gap-1">
            <dt className="text-muted-foreground">Round trip</dt>
            <dd className="font-medium">{health.rtt} ms</dd>
          </div>
          <div className="flex gap-1">
            <dt className="text-muted-foreground">Lost packets</dt>
            <dd className="font-medium">{health.packetLoss}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="text-muted-foreground">Limited by</dt>
            <dd
              className={
                health.limitation === "none" ? "font-medium" : "font-medium text-amber-500"
              }
            >
              {health.limitation}
            </dd>
          </div>
          {health.direct && (
            <div className="flex gap-1">
              <dt className="text-muted-foreground">Mode</dt>
              <dd className="font-medium">direct, no compositing</dd>
            </div>
          )}
        </dl>
      )}

      {diagnosis && diagnosis.severity !== "ok" && (
        <div
          className={
            diagnosis.severity === "problem"
              ? "rounded-md border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm"
              : "rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm"
          }
        >
          <p
            className={
              diagnosis.severity === "problem"
                ? "font-medium text-rose-400"
                : "font-medium text-amber-400"
            }
          >
            {diagnosis.headline}
          </p>
          <p className="text-muted-foreground">{diagnosis.detail}</p>
        </div>
      )}

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
