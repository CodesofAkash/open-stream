/**
 * What a scene is, and what may be in one.
 *
 * A scene is a saved layout: an ordered list of sources, each with a position
 * and size in canvas space. The canvas is a fixed 1280x720 regardless of the
 * screen it is edited on, so a layout means the same thing on every device and
 * the numbers can be stored as they are.
 *
 * Scenes are stored as JSON on the Scene row rather than as a table of
 * sources. The shape belongs to the editor and changes with it; a schema
 * migration for every new source kind would buy nothing. The cost is that rows
 * read back must be parsed, never asserted (AK-CQ-011), which is what
 * `parseSources` is for.
 */

import { z } from "zod";

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;

const transform = {
  id: z.string(),
  name: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().default(0),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
};

const cameraSourceSchema = z.object({
  ...transform,
  kind: z.literal("camera"),
});

const screenSourceSchema = z.object({
  ...transform,
  kind: z.literal("screen"),
});

const imageSourceSchema = z.object({
  ...transform,
  kind: z.literal("image"),
  url: z.string(),
});

const textSourceSchema = z.object({
  ...transform,
  kind: z.literal("text"),
  text: z.string(),
  fontSize: z.number().positive().default(48),
  fill: z.string().default("#ffffff"),
  bold: z.boolean().default(true),
});

const colorSourceSchema = z.object({
  ...transform,
  kind: z.literal("color"),
  fill: z.string().default("#0f172a"),
  cornerRadius: z.number().min(0).default(0),
});

const sceneSourceSchema = z.discriminatedUnion("kind", [
  cameraSourceSchema,
  screenSourceSchema,
  imageSourceSchema,
  textSourceSchema,
  colorSourceSchema,
]);

type SceneSource = z.infer<typeof sceneSourceSchema>;
type SourceKind = SceneSource["kind"];

interface Scene {
  id: string;
  name: string;
  position: number;
  sources: SceneSource[];
}

/** A stored row's sources, dropping anything that no longer parses. */
function parseSources(value: unknown): SceneSource[] {
  const result = z.array(sceneSourceSchema).safeParse(value);
  if (result.success) return result.data;

  // An older editor version, or a hand-edited row. Losing one source beats
  // failing the whole scene and leaving the streamer with a blank studio.
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const source = sceneSourceSchema.safeParse(item);
    return source.success ? [source.data] : [];
  });
}

function createSourceId() {
  return globalThis.crypto.randomUUID();
}

/** A new source, sized and placed so it is usable the moment it appears. */
function createSource(kind: SourceKind, index: number): SceneSource {
  // Each new source is nudged down-right of the last so they never stack
  // exactly on top of one another and become impossible to grab.
  const offset = (index % 6) * 32;
  const base = {
    id: createSourceId(),
    x: 64 + offset,
    y: 64 + offset,
    rotation: 0,
    visible: true,
    locked: false,
  };

  switch (kind) {
    case "camera":
      return { ...base, kind, name: "Camera", width: 480, height: 270 };
    case "screen":
      return { ...base, kind, name: "Screen", x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
    case "image":
      return { ...base, kind, name: "Image", width: 320, height: 320, url: "" };
    case "text":
      return {
        ...base,
        kind,
        name: "Text",
        width: 520,
        height: 80,
        text: "Your text here",
        fontSize: 48,
        fill: "#ffffff",
        bold: true,
      };
    case "color":
      return {
        ...base,
        kind,
        name: "Colour",
        width: 480,
        height: 200,
        fill: "#0f172a",
        cornerRadius: 12,
      };
  }
}

// What a streamer gets before building anything: a full-frame screen capture
// with the camera in the corner, which is what most would have built first.
function createStarterSources(): SceneSource[] {
  const screen = createSource("screen", 0);
  const camera = createSource("camera", 1);

  return [
    screen,
    {
      ...camera,
      width: 384,
      height: 216,
      x: CANVAS_WIDTH - 384 - 32,
      y: CANVAS_HEIGHT - 216 - 32,
    },
  ];
}

export {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  createSource,
  createSourceId,
  createStarterSources,
  parseSources,
  sceneSourceSchema,
};
export type { Scene, SceneSource, SourceKind };
