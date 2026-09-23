/**
 * The studio: capture, scenes and the decision to broadcast, kept apart.
 *
 * The rule this is built around is that **capturing is not broadcasting**. A
 * streamer sets up their camera, screen, microphone and layout while nobody is
 * watching, and goes live only when they press the button. The first version
 * had this backwards — you had to be live before the studio would do anything,
 * so every adjustment happened in front of an audience.
 *
 * So no LiveKit room exists until Go live. Media is captured locally,
 * composited locally, and previewed locally. Going live publishes what is
 * already running; stopping tears down the room and leaves the studio exactly
 * as it was.
 *
 * It lives above the pages rather than inside the studio page so that neither
 * a broadcast nor a half-finished layout dies when the streamer navigates —
 * and the canvas, which is the heavy part, is only loaded once someone
 * actually opens the studio.
 */

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

import { createScene, deleteScene, listScenes, saveScene } from "@/actions/scene";
import { createBroadcastToken, setBroadcastLive } from "@/actions/broadcast";
import AudioMixer, { type MixerChannelState } from "@/lib/studio/audio-mixer";
import {
  createSource,
  type Scene,
  type SceneSource,
  type SourceKind,
} from "@/lib/studio/scene";

const StudioStage = dynamic(() => import("@/components/studio/studio-stage"), { ssr: false });
const StudioRoom = dynamic(() => import("@/components/studio/studio-room"), { ssr: false });

// Omit does not distribute over a union on its own: it collapses to the keys
// every source kind shares, not the ones a text or image source edits.
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type SourcePatch = Partial<DistributiveOmit<SceneSource, "kind" | "id">>;

type CaptureKind = "camera" | "screen" | "microphone";

interface StudioContextValue {
  scenes: Scene[];
  isLoadingScenes: boolean;
  ensureScenes: () => Promise<void>;
  activeScene: Scene | null;
  activeSceneId: string | null;
  selectedSourceId: string | null;
  isDirty: boolean;
  isSaving: boolean;

  selectScene: (id: string) => void;
  selectSource: (id: string | null) => void;
  addSource: (kind: SourceKind) => void;
  updateSource: (id: string, patch: SourcePatch) => void;
  removeSource: (id: string) => void;
  moveSource: (id: string, direction: "forward" | "backward") => void;
  saveActiveScene: () => Promise<void>;
  addScene: (name: string) => Promise<void>;
  removeScene: (id: string) => Promise<void>;

  captures: Record<CaptureKind, boolean>;
  cameraElement: HTMLVideoElement | null;
  screenElement: HTMLVideoElement | null;
  toggleCapture: (kind: CaptureKind) => Promise<void>;

  channels: MixerChannelState[];
  levels: Record<string, number>;
  setChannelVolume: (id: string, volume: number) => void;
  setChannelMuted: (id: string, muted: boolean) => void;

  isLive: boolean;
  isStarting: boolean;
  goLive: () => Promise<void>;
  stopLive: () => Promise<void>;

  /** Called by the stage; the room publishes whatever these return. */
  registerOutputCanvas: (canvas: HTMLCanvasElement | null) => void;
  getOutputCanvas: () => HTMLCanvasElement | null;
  getAudioStream: () => MediaStream | null;
  hostStage: (slot: HTMLElement | null) => void;
}

const StudioContext = createContext<StudioContextValue | null>(null);

function useStudio() {
  const context = useContext(StudioContext);
  if (!context) throw new Error("useStudio must be used inside <StudioProvider>");
  return context;
}

/** Play a capture through a detached element the canvas can draw from. */
async function createSourceVideo(stream: MediaStream) {
  const video = document.createElement("video");
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  await video.play();
  return video;
}

function StudioProvider({ children }: { children: ReactNode }) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isLoadingScenes, setIsLoadingScenes] = useState(false);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [captures, setCaptures] = useState<Record<CaptureKind, boolean>>({
    camera: false,
    screen: false,
    microphone: false,
  });
  const [cameraElement, setCameraElement] = useState<HTMLVideoElement | null>(null);
  const [screenElement, setScreenElement] = useState<HTMLVideoElement | null>(null);

  const [channels, setChannels] = useState<MixerChannelState[]>([]);
  const [levels, setLevels] = useState<Record<string, number>>({});

  const [isLive, setIsLive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const scenesRequestedRef = useRef(false);
  const streamsRef = useRef<Partial<Record<CaptureKind, MediaStream>>>({});
  const elementsRef = useRef<Partial<Record<CaptureKind, HTMLVideoElement>>>({});
  const mixerRef = useRef<AudioMixer | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageHostRef = useRef<HTMLDivElement | null>(null);
  const stageParkRef = useRef<HTMLDivElement | null>(null);

  const activeScene = useMemo(
    () => scenes.find((scene) => scene.id === activeSceneId) ?? null,
    [scenes, activeSceneId],
  );

  const mixer = useCallback(() => {
    mixerRef.current ??= new AudioMixer();
    return mixerRef.current;
  }, []);

  const syncChannels = useCallback(() => {
    setChannels(mixerRef.current?.states ?? []);
  }, []);

  // ── scenes ────────────────────────────────────────────────────────────────

  const patchActiveScene = useCallback(
    (update: (scene: Scene) => Scene) => {
      setScenes((current) =>
        current.map((scene) => (scene.id === activeSceneId ? update(scene) : scene)),
      );
      setIsDirty(true);
    },
    [activeSceneId],
  );

  const addSource = useCallback(
    (kind: SourceKind) => {
      // Built outside the updater: React may run an updater twice, and this one
      // would mint a different id each time.
      const source = createSource(kind, activeScene?.sources.length ?? 0);

      patchActiveScene((scene) => ({ ...scene, sources: [...scene.sources, source] }));
      setSelectedSourceId(source.id);
    },
    [patchActiveScene, activeScene],
  );

  const updateSource = useCallback(
    (id: string, patch: SourcePatch) => {
      patchActiveScene((scene) => ({
        ...scene,
        sources: scene.sources.map((source) =>
          // The patch only ever carries fields of this source's own kind, but
          // a partial of a discriminated union cannot say so in the type.
          source.id === id ? ({ ...source, ...patch } as SceneSource) : source,
        ),
      }));
    },
    [patchActiveScene],
  );

  const removeSource = useCallback(
    (id: string) => {
      patchActiveScene((scene) => ({
        ...scene,
        sources: scene.sources.filter((source) => source.id !== id),
      }));
      setSelectedSourceId((current) => (current === id ? null : current));
    },
    [patchActiveScene],
  );

  const moveSource = useCallback(
    (id: string, direction: "forward" | "backward") => {
      patchActiveScene((scene) => {
        const index = scene.sources.findIndex((source) => source.id === id);
        const target = direction === "forward" ? index + 1 : index - 1;
        if (index === -1 || target < 0 || target >= scene.sources.length) return scene;

        const sources = [...scene.sources];
        [sources[index], sources[target]] = [sources[target], sources[index]];
        return { ...scene, sources };
      });
    },
    [patchActiveScene],
  );

  const saveActiveScene = useCallback(async () => {
    if (!activeScene) return;
    setIsSaving(true);

    try {
      await saveScene({
        id: activeScene.id,
        name: activeScene.name,
        sources: activeScene.sources,
      });
      setIsDirty(false);
      toast.success(`Saved "${activeScene.name}"`);
    } catch (error) {
      console.error("Could not save the scene", error);
      toast.error("Could not save this scene");
    } finally {
      setIsSaving(false);
    }
  }, [activeScene]);

  const addScene = useCallback(async (name: string) => {
    try {
      const { id } = await createScene(name);
      // Mirrors what the server just created, so the new scene is usable
      // without a round trip back for the starter sources.
      const { createStarterSources } = await import("@/lib/studio/scene");
      setScenes((current) => [
        ...current,
        { id, name, position: current.length, sources: createStarterSources() },
      ]);
      setActiveSceneId(id);
      setSelectedSourceId(null);
    } catch (error) {
      console.error("Could not create a scene", error);
      toast.error("Could not create that scene");
    }
  }, []);

  const removeScene = useCallback(
    async (id: string) => {
      try {
        await deleteScene(id);
        setScenes((current) => {
          const remaining = current.filter((scene) => scene.id !== id);
          if (activeSceneId === id) setActiveSceneId(remaining[0]?.id ?? null);
          return remaining;
        });
      } catch (error) {
        console.error("Could not delete the scene", error);
        toast.error(
          error instanceof Error && error.message.includes("last scene")
            ? "Your last scene cannot be deleted"
            : "Could not delete that scene",
        );
      }
    },
    [activeSceneId],
  );

  const selectScene = useCallback((id: string) => {
    setActiveSceneId(id);
    setSelectedSourceId(null);
  }, []);

  /** Loaded the first time a streamer opens the studio, and only then. */
  const ensureScenes = useCallback(async () => {
    if (scenesRequestedRef.current) return;
    scenesRequestedRef.current = true;
    setIsLoadingScenes(true);

    try {
      const loaded = await listScenes();
      setScenes(loaded);
      setActiveSceneId((current) => current ?? loaded[0]?.id ?? null);
    } catch (error) {
      console.error("Could not load your scenes", error);
      toast.error("Could not load your scenes");
      scenesRequestedRef.current = false;
    } finally {
      setIsLoadingScenes(false);
    }
  }, []);

  // ── capture ───────────────────────────────────────────────────────────────

  const stopCapture = useCallback(
    (kind: CaptureKind) => {
      streamsRef.current[kind]?.getTracks().forEach((track) => track.stop());
      delete streamsRef.current[kind];

      const element = elementsRef.current[kind];
      if (element) {
        element.pause();
        element.srcObject = null;
        delete elementsRef.current[kind];
      }

      mixerRef.current?.remove(kind);
      syncChannels();

      if (kind === "camera") setCameraElement(null);
      if (kind === "screen") setScreenElement(null);
      setCaptures((current) => ({ ...current, [kind]: false }));
    },
    [syncChannels],
  );

  const startCapture = useCallback(
    async (kind: CaptureKind) => {
      const stream =
        kind === "screen"
          ? await navigator.mediaDevices.getDisplayMedia({
              video: { frameRate: 30 },
              // Left unprocessed: noise suppression and gain control are tuned
              // for a voice and audibly wreck music or game audio.
              audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
              },
            })
          : await navigator.mediaDevices.getUserMedia(
              kind === "camera"
                ? { video: { width: 1280, height: 720 } }
                : {
                    audio: {
                      echoCancellation: true,
                      noiseSuppression: true,
                      autoGainControl: true,
                      channelCount: 1,
                    },
                  },
            );

      streamsRef.current[kind] = stream;

      if (kind === "camera" || kind === "screen") {
        const element = await createSourceVideo(stream);
        elementsRef.current[kind] = element;
        (kind === "camera" ? setCameraElement : setScreenElement)(element);
      }

      await mixer().resume();
      mixer().add(kind, kind === "microphone" ? "Microphone" : "Screen audio", stream);
      syncChannels();

      // Ending a share from the browser's own banner must update the studio.
      stream.getVideoTracks()[0]?.addEventListener("ended", () => stopCapture(kind));

      setCaptures((current) => ({ ...current, [kind]: true }));
    },
    [mixer, syncChannels, stopCapture],
  );

  const toggleCapture = useCallback(
    async (kind: CaptureKind) => {
      if (captures[kind]) {
        stopCapture(kind);
        return;
      }

      try {
        await startCapture(kind);
      } catch (error) {
        stopCapture(kind);
        const dismissed = error instanceof DOMException && error.name === "NotAllowedError";
        if (!dismissed) {
          console.error(`Could not start the ${kind} capture`, error);
          toast.error(`Could not start your ${kind}`);
        }
      }
    },
    [captures, startCapture, stopCapture],
  );

  const setChannelVolume = useCallback(
    (id: string, volume: number) => {
      mixerRef.current?.setVolume(id, volume);
      syncChannels();
    },
    [syncChannels],
  );

  const setChannelMuted = useCallback(
    (id: string, muted: boolean) => {
      mixerRef.current?.setMuted(id, muted);
      syncChannels();
    },
    [syncChannels],
  );

  // Syncs with the Web Audio analysers, which have no event to subscribe to —
  // a level meter has to be sampled. Idle when nothing is captured.
  useEffect(() => {
    if (channels.length === 0) return;

    const timer = setInterval(() => setLevels(mixerRef.current?.levels() ?? {}), 100);
    return () => clearInterval(timer);
  }, [channels.length]);

  // ── going live ────────────────────────────────────────────────────────────

  const goLive = useCallback(async () => {
    if (!outputCanvasRef.current) {
      toast.error("Open the Studio tab once before going live");
      return;
    }

    setIsStarting(true);
    try {
      // Created before publishing so the published track exists even with
      // nothing captured yet: anything switched on later flows into it.
      await mixer().resume();

      setToken(await createBroadcastToken());
      setIsLive(true);
    } catch (error) {
      console.error("Could not start the broadcast", error);
      toast.error("Could not start the broadcast");
    } finally {
      setIsStarting(false);
    }
  }, [mixer]);

  const stopLive = useCallback(async () => {
    setToken(null);
    setIsLive(false);

    try {
      await setBroadcastLive(false);
    } catch (error) {
      console.error("Could not update the live status", error);
      toast.error("Your channel may still show as live");
    }
  }, []);

  // Syncs with the page lifecycle: closing the tab gives no chance to await an
  // action, so this is best effort and the LiveKit webhook is the real backstop.
  useEffect(() => {
    if (!isLive) return;

    const onPageHide = () => void setBroadcastLive(false);
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [isLive]);

  // Syncs with the browser's capture devices: without this a closed tab leaves
  // the camera light on.
  useEffect(() => {
    const streams = streamsRef.current;
    const activeMixer = mixerRef.current;

    return () => {
      Object.values(streams).forEach((stream) =>
        stream?.getTracks().forEach((track) => track.stop()),
      );
      activeMixer?.close();
    };
  }, []);

  // ── the stage, and where it is shown ──────────────────────────────────────

  const registerOutputCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    outputCanvasRef.current = canvas;
  }, []);

  // Moved in the DOM rather than re-rendered: a new <canvas> would strand the
  // MediaStream already published to viewers. A canvas survives being moved.
  const hostStage = useCallback((slot: HTMLElement | null) => {
    const host = stageHostRef.current;
    if (!host) return;

    if (slot) {
      slot.appendChild(host);
      host.style.position = "relative";
      host.style.left = "0";
      host.removeAttribute("aria-hidden");
      return;
    }

    stageParkRef.current?.appendChild(host);
    host.style.position = "fixed";
    host.style.left = "-10000px";
    host.setAttribute("aria-hidden", "true");
  }, []);

  const value = useMemo<StudioContextValue>(
    () => ({
      scenes,
      isLoadingScenes,
      ensureScenes,
      activeScene,
      activeSceneId,
      selectedSourceId,
      isDirty,
      isSaving,
      selectScene,
      selectSource: setSelectedSourceId,
      addSource,
      updateSource,
      removeSource,
      moveSource,
      saveActiveScene,
      addScene,
      removeScene,
      captures,
      cameraElement,
      screenElement,
      toggleCapture,
      channels,
      levels,
      setChannelVolume,
      setChannelMuted,
      isLive,
      isStarting,
      goLive,
      stopLive,
      registerOutputCanvas,
      getOutputCanvas: () => outputCanvasRef.current,
      getAudioStream: () => mixerRef.current?.outputStream ?? null,
      hostStage,
    }),
    [
      scenes,
      isLoadingScenes,
      ensureScenes,
      activeScene,
      activeSceneId,
      selectedSourceId,
      isDirty,
      isSaving,
      selectScene,
      addSource,
      updateSource,
      removeSource,
      moveSource,
      saveActiveScene,
      addScene,
      removeScene,
      captures,
      cameraElement,
      screenElement,
      toggleCapture,
      channels,
      levels,
      setChannelVolume,
      setChannelMuted,
      isLive,
      isStarting,
      goLive,
      stopLive,
      registerOutputCanvas,
      hostStage,
    ],
  );

  return (
    <StudioContext.Provider value={value}>
      {children}
      {/*
        The stage is parked here until the studio page borrows it, and comes
        back here when that page unmounts. Loading it costs a visitor nothing:
        it only renders once there is a scene to draw.
      */}
      <div ref={stageParkRef}>
        {activeScene ? (
          <div
            ref={stageHostRef}
            aria-hidden="true"
            style={{ position: "fixed", left: "-10000px", top: 0, width: "100%" }}
          >
            <StudioStage />
          </div>
        ) : null}
      </div>
      {isLive && token ? <StudioRoom token={token} /> : null}
    </StudioContext.Provider>
  );
}

export default StudioProvider;
export { useStudio };
export type { CaptureKind, SourcePatch };
