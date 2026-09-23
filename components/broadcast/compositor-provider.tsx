/**
 * Studio mode — screen and camera drawn into one picture, in the browser.
 *
 * Plain screen sharing publishes two tracks and lets the viewer lay them out.
 * That is cheaper and sharper, and it stays the default. This is the other
 * trade: compose every frame onto a canvas and publish the canvas, paying a
 * composite and an encode per frame for layout control.
 *
 * It lives at the root, inside the LiveKit room, for the reason the broadcast
 * does: a composition that ended on navigation would be useless. Nothing is
 * mounted until a broadcast is running, so a visitor pays nothing for it.
 *
 * The canvas and its source videos are deliberately detached from the
 * document: a canvas captures fine unrendered, while a hidden <video> is at
 * the mercy of the browser's choice to stop decoding frames nobody can see.
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
import { useLocalParticipant } from "@livekit/components-react";
import { LocalAudioTrack, LocalVideoTrack, Track } from "livekit-client";
import { toast } from "sonner";

import createFrameTicker, { type FrameTicker } from "@/lib/frame-ticker";

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const FPS = 30;
const MARGIN = 24;

type CameraCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface CompositorLayout {
  corner: CameraCorner;
  /** Camera inset width, as a percentage of the frame. */
  cameraScale: number;
}

interface CompositorSources {
  camera: HTMLVideoElement | null;
  screen: HTMLVideoElement | null;
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CompositorContextValue {
  isComposing: boolean;
  isStarting: boolean;
  /** The published canvas track, for previewing what viewers receive. */
  composedTrack: LocalVideoTrack | null;
  layout: CompositorLayout;
  setLayout: (next: Partial<CompositorLayout>) => void;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

const DEFAULT_LAYOUT: CompositorLayout = { corner: "bottom-right", cameraScale: 25 };

const CompositorContext = createContext<CompositorContextValue | null>(null);

function useCompositor() {
  const context = useContext(CompositorContext);
  if (!context) {
    throw new Error("useCompositor must be used inside <CompositorProvider>");
  }
  return context;
}

/** A source is only drawable once it has decoded a frame with real dimensions. */
function isDrawable(video: HTMLVideoElement | null): video is HTMLVideoElement {
  return Boolean(video && video.readyState >= 2 && video.videoWidth > 0);
}

function cameraBox(layout: CompositorLayout): Box {
  const width = (CANVAS_WIDTH * layout.cameraScale) / 100;
  const height = (width * 9) / 16;

  return {
    x: layout.corner.endsWith("left") ? MARGIN : CANVAS_WIDTH - width - MARGIN,
    y: layout.corner.startsWith("top") ? MARGIN : CANVAS_HEIGHT - height - MARGIN,
    width,
    height,
  };
}

/** Fit the whole source inside the box, letterboxed — nothing is cropped. */
function drawContained(context: CanvasRenderingContext2D, video: HTMLVideoElement, box: Box) {
  const scale = Math.min(box.width / video.videoWidth, box.height / video.videoHeight);
  const width = video.videoWidth * scale;
  const height = video.videoHeight * scale;

  context.drawImage(
    video,
    box.x + (box.width - width) / 2,
    box.y + (box.height - height) / 2,
    width,
    height,
  );
}

/** Fill the box, cropping the overflow — a face is never squashed by this. */
function drawCovered(context: CanvasRenderingContext2D, video: HTMLVideoElement, box: Box) {
  const scale = Math.max(box.width / video.videoWidth, box.height / video.videoHeight);
  const width = video.videoWidth * scale;
  const height = video.videoHeight * scale;

  context.save();
  context.beginPath();
  context.rect(box.x, box.y, box.width, box.height);
  context.clip();
  context.drawImage(
    video,
    box.x + (box.width - width) / 2,
    box.y + (box.height - height) / 2,
    width,
    height,
  );
  context.restore();
}

function drawFrame(
  context: CanvasRenderingContext2D,
  sources: CompositorSources,
  layout: CompositorLayout,
) {
  const { camera, screen } = sources;
  const full: Box = { x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT };

  context.fillStyle = "#000000";
  context.fillRect(full.x, full.y, full.width, full.height);

  const hasScreen = isDrawable(screen);
  if (hasScreen) drawContained(context, screen, full);

  if (isDrawable(camera)) {
    // Without a screen the camera is the picture; with one it is the inset.
    const box = hasScreen ? cameraBox(layout) : full;
    drawCovered(context, camera, box);

    if (hasScreen) {
      context.strokeStyle = "rgba(255, 255, 255, 0.35)";
      context.lineWidth = 3;
      context.strokeRect(box.x, box.y, box.width, box.height);
    }
  }
}

/** Play a captured stream through a detached element we can draw from. */
async function createSourceVideo(stream: MediaStream) {
  const video = document.createElement("video");
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  await video.play();
  return video;
}

function CompositorProvider({ children }: { children: ReactNode }) {
  const { localParticipant } = useLocalParticipant();

  const [isComposing, setIsComposing] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [composedTrack, setComposedTrack] = useState<LocalVideoTrack | null>(null);
  const [layout, setLayoutState] = useState<CompositorLayout>(DEFAULT_LAYOUT);

  // The draw loop reads the layout every frame. Keeping it in a ref alongside
  // the state means moving the camera does not restart the loop or the clock.
  const layoutRef = useRef<CompositorLayout>(DEFAULT_LAYOUT);
  const sourcesRef = useRef<CompositorSources>({ camera: null, screen: null });
  const streamsRef = useRef<MediaStream[]>([]);
  const publishedRef = useRef<(LocalVideoTrack | LocalAudioTrack)[]>([]);
  const tickerRef = useRef<FrameTicker | null>(null);

  const setLayout = useCallback((next: Partial<CompositorLayout>) => {
    layoutRef.current = { ...layoutRef.current, ...next };
    setLayoutState(layoutRef.current);
  }, []);

  /** Release everything this component acquired, in any order of failure. */
  const teardown = useCallback(async () => {
    tickerRef.current?.stop();
    tickerRef.current = null;

    for (const track of publishedRef.current) {
      try {
        await localParticipant.unpublishTrack(track);
      } catch (error) {
        // A disconnected room unpublishes for us; anything else is worth seeing.
        console.warn("Could not unpublish a studio track", error);
      }
      track.stop();
    }
    publishedRef.current = [];

    streamsRef.current.forEach((stream) => stream.getTracks().forEach((track) => track.stop()));
    streamsRef.current = [];

    sourcesRef.current.camera?.remove();
    sourcesRef.current.screen?.remove();
    sourcesRef.current = { camera: null, screen: null };

    setComposedTrack(null);
  }, [localParticipant]);

  const stop = useCallback(async () => {
    await teardown();
    setIsComposing(false);

    try {
      // Back to the ordinary camera, so stopping studio mode is not going dark.
      await localParticipant.setCameraEnabled(true);
    } catch (error) {
      console.error("Could not restore the camera after studio mode", error);
      toast.error("Studio mode ended — turn your camera back on to stay live");
    }
  }, [teardown, localParticipant]);

  const start = useCallback(async () => {
    setIsStarting(true);

    try {
      // First, while the click still counts as user activation: the browser
      // refuses a screen-capture prompt that arrives after too much awaiting.
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: FPS },
        audio: true,
      });
      streamsRef.current.push(screenStream);

      // Free the camera device before asking for it ourselves, and make sure
      // viewers never receive the raw camera and the composite at once.
      await localParticipant.setCameraEnabled(false);

      // Screen-only is a legitimate composition, so a refused camera is not fatal.
      const cameraStream = await navigator.mediaDevices
        .getUserMedia({ video: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT } })
        .catch((error: unknown) => {
          console.warn("Studio mode running without a camera", error);
          return null;
        });
      if (cameraStream) streamsRef.current.push(cameraStream);

      sourcesRef.current = {
        screen: await createSourceVideo(screenStream),
        camera: cameraStream ? await createSourceVideo(cameraStream) : null,
      };

      const canvas = document.createElement("canvas");
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;

      const context = canvas.getContext("2d");
      if (!context) throw new Error("This browser gave no 2D canvas context");

      drawFrame(context, sourcesRef.current, layoutRef.current);
      tickerRef.current = createFrameTicker(FPS, () =>
        drawFrame(context, sourcesRef.current, layoutRef.current),
      );

      // Published as the camera source: to a viewer this simply is the picture,
      // so the player needs no special case for a composed stream.
      const [canvasTrack] = canvas.captureStream(FPS).getVideoTracks();
      const composed = new LocalVideoTrack(canvasTrack);
      await localParticipant.publishTrack(composed, { source: Track.Source.Camera });
      publishedRef.current.push(composed);
      setComposedTrack(composed);

      // Whatever the shared tab or window is playing, published separately so
      // it is not re-encoded and the viewer's volume control still governs it.
      const [screenAudio] = screenStream.getAudioTracks();
      if (screenAudio) {
        const audio = new LocalAudioTrack(screenAudio);
        await localParticipant.publishTrack(audio, { source: Track.Source.ScreenShareAudio });
        publishedRef.current.push(audio);
      }

      // Ending the share from the browser's own banner must end studio mode.
      screenStream.getVideoTracks()[0]?.addEventListener("ended", () => {
        void stop();
      });

      setIsComposing(true);
    } catch (error) {
      await teardown();

      // Dismissing the picker is a decision, not a failure to report.
      const dismissed = error instanceof DOMException && error.name === "NotAllowedError";
      if (!dismissed) {
        console.error("Could not start studio mode", error);
        toast.error("Could not start studio mode");
      }

      try {
        await localParticipant.setCameraEnabled(true);
      } catch (cameraError) {
        console.error("Could not restore the camera after a failed start", cameraError);
      }
    } finally {
      setIsStarting(false);
    }
  }, [localParticipant, teardown, stop]);

  // Syncs with the browser's capture APIs: the room can disconnect under us,
  // and a composition left behind would hold the camera and the screen open.
  useEffect(() => () => void teardown(), [teardown]);

  const value = useMemo<CompositorContextValue>(
    () => ({ isComposing, isStarting, composedTrack, layout, setLayout, start, stop }),
    [isComposing, isStarting, composedTrack, layout, setLayout, start, stop],
  );

  return <CompositorContext.Provider value={value}>{children}</CompositorContext.Provider>;
}

export default CompositorProvider;
export { useCompositor };
export type { CameraCorner, CompositorLayout };
