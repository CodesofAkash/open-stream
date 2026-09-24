/**
 * The canvas that is both the editor and the broadcast.
 *
 * There is exactly one of these, and what viewers receive is captured straight
 * from its scene layer — so the preview cannot drift from the output, which is
 * the failure that makes a compositor untrustworthy.
 *
 * The selection handles live on a second layer. Konva gives each layer its own
 * canvas element, so capturing the scene layer alone means the streamer's
 * handles and outlines are never in the stream.
 *
 * The canvas is always 1280x720 internally and CSS-scaled to whatever space
 * the page gives it, so the output resolution never depends on the window.
 */

"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Group, Image as KonvaImage, Layer, Line, Rect, Stage, Text, Transformer } from "react-konva";
import type Konva from "konva";

import createFrameTicker from "@/lib/frame-ticker";
import { CANVAS_HEIGHT, CANVAS_WIDTH, type SceneSource } from "@/lib/studio/scene";
import { QUALITY_PRESETS } from "@/lib/studio/quality";
import { snapBox, type Guide } from "@/lib/studio/snapping";
import { useStudio, type SourcePatch } from "@/components/studio/studio-provider";

const FPS = 30;
const MIN_SIZE = 24;

/** An <img> for a source's URL, or null until that URL has loaded. */
function useImageElement(url: string) {
  const [loaded, setLoaded] = useState<{ url: string; element: HTMLImageElement } | null>(null);

  // Syncs with the browser's image loader, which is not a React data source.
  useEffect(() => {
    if (!url) return;

    const element = new window.Image();
    element.crossOrigin = "anonymous";
    element.src = url;

    const onLoad = () => setLoaded({ url, element });
    element.addEventListener("load", onLoad);

    return () => element.removeEventListener("load", onLoad);
  }, [url]);

  // Derived rather than cleared in the effect: a stale image must never be
  // drawn for a URL that has since changed.
  return loaded?.url === url ? loaded.element : null;
}

interface SourceNodeProps {
  source: SceneSource;
  draggable: boolean;
  camera: HTMLVideoElement | null;
  screen: HTMLVideoElement | null;
  /** Video/audio file sources, keyed by source id — see useMediaElement. */
  media: HTMLVideoElement | HTMLAudioElement | undefined;
  onSelect: (additive: boolean) => void;
  onChange: (patch: SourcePatch) => void;
  onDragMove: (id: string, node: Konva.Node) => void;
  onDragEnd: () => void;
}

function SourceNode({
  source,
  draggable,
  camera,
  screen,
  media,
  onSelect,
  onChange,
  onDragMove,
  onDragEnd,
}: SourceNodeProps) {
  const image = useImageElement(source.kind === "image" ? source.url : "");

  if (!source.visible) return null;

  // A sound with no picture has nothing to draw — it is controlled from the
  // Sources list and the mixer instead.
  if (source.kind === "audio") return null;

  const shared = {
    id: source.id,
    name: "source",
    x: source.x,
    y: source.y,
    rotation: source.rotation,
    draggable: draggable && !source.locked,
    // Shift keeps what is already selected, as it does in every editor.
    onMouseDown: (event: Konva.KonvaEventObject<MouseEvent>) =>
      onSelect(event.evt.shiftKey || event.evt.metaKey || event.evt.ctrlKey),
    onTap: () => onSelect(false),
    onDragMove: (event: Konva.KonvaEventObject<DragEvent>) =>
      onDragMove(source.id, event.target),
    onDragEnd: (event: Konva.KonvaEventObject<DragEvent>) => {
      onChange({ x: event.target.x(), y: event.target.y() });
      onDragEnd();
    },
  };

  // Konva resizes by scaling; kept, that scale compounds and blurs text. It is
  // folded back into width and height and the node reset to scale 1.
  const onTransformEnd = (event: Konva.KonvaEventObject<Event>) => {
    const node = event.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    // Text has no pixel size of its own — it is scaled by its font.
    const fontSize =
      source.kind === "text" ? { fontSize: Math.max(8, source.fontSize * scaleY) } : {};

    onChange({
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      width: Math.max(MIN_SIZE, source.width * scaleX),
      height: Math.max(MIN_SIZE, source.height * scaleY),
      ...fontSize,
    });
  };

  if (source.kind === "text") {
    return (
      <Text
        {...shared}
        onTransformEnd={onTransformEnd}
        text={source.text}
        width={source.width}
        fontSize={source.fontSize}
        fontStyle={source.bold ? "bold" : "normal"}
        fontFamily="system-ui, sans-serif"
        fill={source.fill}
        shadowColor="#000000"
        shadowBlur={8}
        shadowOpacity={0.6}
      />
    );
  }

  if (source.kind === "color") {
    return (
      <Rect
        {...shared}
        onTransformEnd={onTransformEnd}
        width={source.width}
        height={source.height}
        fill={source.fill}
        cornerRadius={source.cornerRadius}
      />
    );
  }

  const element =
    source.kind === "camera"
      ? camera
      : source.kind === "screen"
        ? screen
        : source.kind === "video"
          ? (media as HTMLVideoElement | undefined) ?? null
          : image;

  // A source whose capture is switched off gets a placeholder rather than a
  // hole: the streamer still needs to see where it sits and be able to move it.
  if (!element) {
    return (
      <>
        <Rect
          {...shared}
          onTransformEnd={onTransformEnd}
          width={source.width}
          height={source.height}
          fill="#111827"
          stroke="#374151"
          strokeWidth={2}
          dash={[10, 6]}
          cornerRadius={8}
        />
        <Text
          listening={false}
          x={source.x}
          y={source.y + source.height / 2 - 10}
          width={source.width}
          align="center"
          text={
            source.kind === "image" || source.kind === "video"
              ? `No ${source.kind} set`
              : `${source.name} is off`
          }
          fontSize={20}
          fontFamily="system-ui, sans-serif"
          fill="#9ca3af"
        />
      </>
    );
  }

  const intrinsic =
    element instanceof HTMLVideoElement
      ? { width: element.videoWidth, height: element.videoHeight }
      : { width: element.naturalWidth, height: element.naturalHeight };

  const { crop } = source;
  const cropped =
    intrinsic.width > 0 && intrinsic.height > 0
      ? {
          x: intrinsic.width * crop.left,
          y: intrinsic.height * crop.top,
          width: intrinsic.width * (1 - crop.left - crop.right),
          height: intrinsic.height * (1 - crop.top - crop.bottom),
        }
      : undefined;

  // The mirror is local to the inner image, not the Group the Transformer
  // resizes — flipping that node too would fold the mirror into its resize.
  return (
    <Group {...shared} onTransformEnd={onTransformEnd} width={source.width} height={source.height}>
      <KonvaImage
        x={source.flipHorizontal ? source.width : 0}
        y={0}
        scaleX={source.flipHorizontal ? -1 : 1}
        image={element}
        width={source.width}
        height={source.height}
        crop={cropped}
        // No buffer-canvas pass: there is no stroke or shadow to be perfect about.
        perfectDrawEnabled={false}
        shadowForStrokeEnabled={false}
      />
    </Group>
  );
}

function StudioStage() {
  const {
    activeScene,
    selectedSourceIds,
    selectSource,
    selectSources,
    updateSource,
    cameraElement,
    screenElement,
    mediaElements,
    registerOutputCanvas,
    quality,
    croppingSourceId,
  } = useStudio();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const sceneLayerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const cropTransformerRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [scale, setScale] = useState(0.5);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [marqueeMode, setMarqueeMode] = useState(false);
  const [marquee, setMarquee] = useState<{ x: number; y: number; width: number; height: number } | null>(
    null,
  );
  const marqueeStartRef = useRef<{ x: number; y: number } | null>(null);

  // Syncs with the element's box: the canvas is a fixed 1280x720 and is scaled
  // to fit whatever the page gives it.
  useLayoutEffect(() => {
    const parent = wrapperRef.current?.parentElement;
    if (!parent) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width > 0) setScale(width / CANVAS_WIDTH);
    });

    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  // Syncs with Konva, which draws on demand. Its batchDraw schedules through
  // requestAnimationFrame, which stops in a background tab; this ticker cannot.
  useEffect(() => {
    const layer = sceneLayerRef.current;
    if (!layer) return;

    // The scene stays 1280x720 in logical units; this is what the captured
    // canvas is actually rendered at, so 1080p costs no layout change.
    layer.getCanvas().setPixelRatio(QUALITY_PRESETS[quality].pixelRatio);
    registerOutputCanvas(layer.getCanvas()._canvas);

    // drawScene, not draw: draw() also rebuilds the hit graph, which only
    // changes when the scene changes — not thirty times a second.
    const ticker = createFrameTicker(FPS, () => layer.drawScene());

    return () => {
      ticker.stop();
      registerOutputCanvas(null);
    };
  }, [registerOutputCanvas, quality]);

  // Syncs with the keyboard: Ctrl/Cmd forces a selection drag over whatever is
  // underneath, since a full-frame source leaves nowhere else to start one.
  useEffect(() => {
    const isModifier = (event: KeyboardEvent) => event.key === "Control" || event.key === "Meta";

    const onDown = (event: KeyboardEvent) => isModifier(event) && setMarqueeMode(true);
    const onUp = (event: KeyboardEvent) => isModifier(event) && setMarqueeMode(false);
    // A window that loses focus never sees the key come back up.
    const onBlur = () => setMarqueeMode(false);

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  // Syncs the hit graph with the scene, since the frame loop no longer does.
  useEffect(() => {
    sceneLayerRef.current?.drawHit();
  }, [activeScene, croppingSourceId]);

  // Syncs the transformer with the selection — it attaches to nodes, not props.
  // Several nodes at once is what makes a group move and resize together.
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;

    const nodes = croppingSourceId
      ? []
      : selectedSourceIds
          .map((id) => stage.findOne(`#${id}`))
          .filter((node): node is Konva.Node => Boolean(node));

    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [selectedSourceIds, activeScene, croppingSourceId]);

  // Syncs the crop transformer with the crop window, which only exists while a
  // source is being cropped.
  useEffect(() => {
    const transformer = cropTransformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;

    const node = croppingSourceId ? stage.findOne("#crop-window") : null;
    transformer.nodes(node ? [node] : []);
    transformer.getLayer()?.batchDraw();
  }, [croppingSourceId, activeScene]);

  /** Pull the dragged node onto the nearest edge, and show why. */
  const onSourceDragMove = useCallback(
    (id: string, node: Konva.Node) => {
      const others = (activeScene?.sources ?? [])
        .filter((source) => source.id !== id && source.visible)
        .map((source) => ({
          x: source.x,
          y: source.y,
          width: source.width,
          height: source.height,
        }));

      const source = activeScene?.sources.find((item) => item.id === id);
      if (!source) return;

      // Snapping a group member individually would pull the group apart.
      if (selectedSourceIds.length > 1) return;

      const snapped = snapBox(
        { x: node.x(), y: node.y(), width: source.width, height: source.height },
        { x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
        others,
      );

      node.x(snapped.x);
      node.y(snapped.y);
      setGuides(snapped.guides);
    },
    [activeScene, selectedSourceIds],
  );

  const onSourceDragEnd = useCallback(() => setGuides([]), []);

  // Snapping each candidate box the transformer reports is what lets a resize
  // land on an edge; the returned box is the one Konva applies.
  const snapResize = useCallback(
    (oldBox: { x: number; y: number; width: number; height: number; rotation: number },
     newBox: { x: number; y: number; width: number; height: number; rotation: number }) => {
      if (newBox.width < MIN_SIZE || newBox.height < MIN_SIZE) return oldBox;

      // Rotated boxes have no axis-aligned edges to align to.
      if (newBox.rotation !== 0 || selectedSourceIds.length > 1) return newBox;

      const others = (activeScene?.sources ?? [])
        .filter((source) => !selectedSourceIds.includes(source.id) && source.visible)
        .map((source) => ({
          x: source.x,
          y: source.y,
          width: source.width,
          height: source.height,
        }));

      const snapped = snapBox(newBox, { x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT }, others);
      setGuides(snapped.guides);

      // Only the moving edges shift; the box keeps the size the handle asked
      // for unless a guide is within reach of one of its sides.
      const dx = snapped.x - newBox.x;
      const dy = snapped.y - newBox.y;
      const growsLeft = newBox.x !== oldBox.x;
      const growsUp = newBox.y !== oldBox.y;

      return {
        ...newBox,
        x: newBox.x + dx,
        y: newBox.y + dy,
        width: growsLeft ? newBox.width - dx : newBox.width + dx,
        height: growsUp ? newBox.height - dy : newBox.height + dy,
      };
    },
    [activeScene, selectedSourceIds],
  );

  // A drag starting on the backdrop draws a selection rectangle, which is how
  // anyone expects to select several things at once.
  const onStageMouseDown = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent>) => {
      const onBackdrop = event.target === event.target.getStage();
      if (!onBackdrop && !marqueeMode) return;

      const position = event.target.getStage()?.getPointerPosition();
      if (!position) return;

      marqueeStartRef.current = position;
      setMarquee({ x: position.x, y: position.y, width: 0, height: 0 });
      if (!event.evt.shiftKey) selectSource(null);
    },
    [selectSource, marqueeMode],
  );

  const onStageMouseMove = useCallback(() => {
    const start = marqueeStartRef.current;
    const position = stageRef.current?.getPointerPosition();
    if (!start || !position) return;

    setMarquee({
      x: Math.min(start.x, position.x),
      y: Math.min(start.y, position.y),
      width: Math.abs(position.x - start.x),
      height: Math.abs(position.y - start.y),
    });
  }, []);

  const onStageMouseUp = useCallback(() => {
    const box = marquee;
    marqueeStartRef.current = null;
    setMarquee(null);

    // A click, not a drag: the backdrop press already cleared the selection.
    if (!box || box.width < 4 || box.height < 4) return;

    const covered = (activeScene?.sources ?? [])
      .filter(
        (source) =>
          source.visible &&
          source.x < box.x + box.width &&
          source.x + source.width > box.x &&
          source.y < box.y + box.height &&
          source.y + source.height > box.y,
      )
      .map((source) => source.id);

    selectSources(covered);
  }, [marquee, activeScene, selectSources]);

  // Only a picture can be cropped; text and colour have no edges to cut.
  const cropCandidate = activeScene?.sources.find((source) => source.id === croppingSourceId);
  const cropSource =
    cropCandidate &&
    (cropCandidate.kind === "camera" ||
      cropCandidate.kind === "screen" ||
      cropCandidate.kind === "image")
      ? cropCandidate
      : undefined;

  // Cropping cuts the edge away rather than squeezing the picture: the window
  // becomes the new box, and the fractions are recomputed against the whole.
  const commitCrop = (node: Konva.Node) => {
    if (!cropSource) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    const rect = {
      x: node.x(),
      y: node.y(),
      width: Math.max(MIN_SIZE, node.width() * scaleX),
      height: Math.max(MIN_SIZE, node.height() * scaleY),
    };

    const { crop } = cropSource;
    const fullWidth = cropSource.width / Math.max(0.1, 1 - crop.left - crop.right);
    const fullHeight = cropSource.height / Math.max(0.1, 1 - crop.top - crop.bottom);
    const fullX = cropSource.x - fullWidth * crop.left;
    const fullY = cropSource.y - fullHeight * crop.top;

    const clamp = (value: number) => Math.min(0.45, Math.max(0, value));

    updateSource(cropSource.id, {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      crop: {
        left: clamp((rect.x - fullX) / fullWidth),
        top: clamp((rect.y - fullY) / fullHeight),
        right: clamp(1 - (rect.x + rect.width - fullX) / fullWidth),
        bottom: clamp(1 - (rect.y + rect.height - fullY) / fullHeight),
      },
    });
  };

  if (!activeScene) return null;

  return (
    <div
      ref={wrapperRef}
      style={{ width: CANVAS_WIDTH * scale, height: CANVAS_HEIGHT * scale }}
    >
      <div
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <Stage
          ref={stageRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={onStageMouseDown}
          onMouseMove={onStageMouseMove}
          onMouseUp={onStageMouseUp}
        >
          {/* Captured and published. Nothing that is not part of the picture
              may be added to this layer. */}
          <Layer ref={sceneLayerRef}>
            {/* listening={false}: as a hit target this swallowed every
                backdrop click, and with it deselecting and rubber-band
                selection. */}
            <Rect
              x={0}
              y={0}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              fill="#000000"
              listening={false}
              perfectDrawEnabled={false}
            />
            {activeScene.sources.map((source) => (
              <SourceNode
                key={source.id}
                source={source}
                camera={cameraElement}
                screen={screenElement}
                media={mediaElements[source.id]}
                onSelect={(additive) => selectSource(source.id, additive)}
                onChange={(patch) => updateSource(source.id, patch)}
                onDragMove={onSourceDragMove}
                onDragEnd={onSourceDragEnd}
                // Nothing moves while a selection is being drawn over it.
                draggable={!marqueeMode}
              />
            ))}
          </Layer>

          {/* The streamer's own handles, on their own canvas. */}
          <Layer>
            {guides.map((guide) => (
              <Line
                key={`${guide.orientation}-${guide.position}`}
                points={
                  guide.orientation === "vertical"
                    ? [guide.position, 0, guide.position, CANVAS_HEIGHT]
                    : [0, guide.position, CANVAS_WIDTH, guide.position]
                }
                stroke="#f43f5e"
                strokeWidth={1}
                dash={[6, 4]}
                listening={false}
              />
            ))}

            {cropSource && (
              <Rect
                id="crop-window"
                x={cropSource.x}
                y={cropSource.y}
                width={cropSource.width}
                height={cropSource.height}
                draggable
                fill="rgba(0, 0, 0, 0.01)"
                stroke="#f59e0b"
                strokeWidth={2}
                dash={[8, 4]}
                onDragEnd={(event) => commitCrop(event.target)}
                onTransformEnd={(event) => commitCrop(event.target)}
              />
            )}

            {marquee && (
              <Rect
                {...marquee}
                fill="rgba(59, 130, 246, 0.15)"
                stroke="#3b82f6"
                strokeWidth={1}
                listening={false}
              />
            )}

            <Transformer
              ref={cropTransformerRef}
              rotateEnabled={false}
              keepRatio={false}
              borderStroke="#f59e0b"
              anchorStroke="#f59e0b"
              anchorFill="#ffffff"
              anchorSize={10}
              boundBoxFunc={(oldBox, newBox) =>
                newBox.width < MIN_SIZE || newBox.height < MIN_SIZE ? oldBox : newBox
              }
            />

            <Transformer
              ref={transformerRef}
              listening={!marqueeMode}
              shouldOverdrawWholeArea={selectedSourceIds.length > 1 && !marqueeMode}
              // Dragging a multi-selection moves the transformer, not each
              // node, so the new positions are committed from here.
              onDragEnd={() => {
                transformerRef.current?.nodes().forEach((node) => {
                  updateSource(node.id(), { x: node.x(), y: node.y() });
                });
                setGuides([]);
              }}
              rotateEnabled
              keepRatio={false}
              borderStroke="#3b82f6"
              anchorStroke="#3b82f6"
              anchorFill="#ffffff"
              anchorSize={10}
              boundBoxFunc={snapResize}
              onTransformEnd={() => setGuides([])}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default StudioStage;
