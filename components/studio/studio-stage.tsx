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
import { Image as KonvaImage, Layer, Rect, Stage, Text, Transformer } from "react-konva";
import type Konva from "konva";

import createFrameTicker from "@/lib/frame-ticker";
import { CANVAS_HEIGHT, CANVAS_WIDTH, type SceneSource } from "@/lib/studio/scene";
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
  camera: HTMLVideoElement | null;
  screen: HTMLVideoElement | null;
  onSelect: () => void;
  onChange: (patch: SourcePatch) => void;
}

function SourceNode({ source, camera, screen, onSelect, onChange }: SourceNodeProps) {
  const image = useImageElement(source.kind === "image" ? source.url : "");

  if (!source.visible) return null;

  const shared = {
    id: source.id,
    name: "source",
    x: source.x,
    y: source.y,
    rotation: source.rotation,
    draggable: !source.locked,
    onMouseDown: onSelect,
    onTap: onSelect,
    onDragEnd: (event: Konva.KonvaEventObject<DragEvent>) =>
      onChange({ x: event.target.x(), y: event.target.y() }),
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

  const element = source.kind === "camera" ? camera : source.kind === "screen" ? screen : image;

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
          text={source.kind === "image" ? "No image set" : `${source.name} is off`}
          fontSize={20}
          fontFamily="system-ui, sans-serif"
          fill="#9ca3af"
        />
      </>
    );
  }

  return (
    <KonvaImage
      {...shared}
      onTransformEnd={onTransformEnd}
      image={element}
      width={source.width}
      height={source.height}
    />
  );
}

function StudioStage() {
  const {
    activeScene,
    selectedSourceId,
    selectSource,
    updateSource,
    cameraElement,
    screenElement,
    registerOutputCanvas,
  } = useStudio();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const sceneLayerRef = useRef<Konva.Layer>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [scale, setScale] = useState(0.5);

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

    // One canvas pixel per canvas unit, so the captured stream is exactly
    // 1280x720 on a high-density display too.
    layer.getCanvas().setPixelRatio(1);
    registerOutputCanvas(layer.getCanvas()._canvas);

    const ticker = createFrameTicker(FPS, () => layer.draw());

    return () => {
      ticker.stop();
      registerOutputCanvas(null);
    };
  }, [registerOutputCanvas]);

  // Syncs the transformer with the selection — it attaches to nodes, not props.
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;

    const node = selectedSourceId ? stage.findOne(`#${selectedSourceId}`) : null;
    transformer.nodes(node ? [node] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedSourceId, activeScene]);

  const onStageMouseDown = useCallback(
    (event: Konva.KonvaEventObject<MouseEvent>) => {
      // Clicking the backdrop rather than a source clears the selection.
      if (event.target === event.target.getStage()) selectSource(null);
    },
    [selectSource],
  );

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
        >
          {/* Captured and published. Nothing that is not part of the picture
              may be added to this layer. */}
          <Layer ref={sceneLayerRef}>
            <Rect x={0} y={0} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#000000" />
            {activeScene.sources.map((source) => (
              <SourceNode
                key={source.id}
                source={source}
                camera={cameraElement}
                screen={screenElement}
                onSelect={() => selectSource(source.id)}
                onChange={(patch) => updateSource(source.id, patch)}
              />
            ))}
          </Layer>

          {/* The streamer's own handles, on their own canvas. */}
          <Layer>
            <Transformer
              ref={transformerRef}
              rotateEnabled
              keepRatio={false}
              borderStroke="#3b82f6"
              anchorStroke="#3b82f6"
              anchorFill="#ffffff"
              anchorSize={10}
              boundBoxFunc={(oldBox, newBox) =>
                newBox.width < MIN_SIZE || newBox.height < MIN_SIZE ? oldBox : newBox
              }
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default StudioStage;
