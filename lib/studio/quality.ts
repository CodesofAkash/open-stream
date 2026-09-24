/**
 * How good the outgoing picture is allowed to be, and what that costs.
 *
 * The scene is always laid out in 1280x720 logical units so a saved layout
 * means the same thing everywhere. Resolution is a separate matter: the canvas
 * is rendered at a multiple of that, and the multiple is what a streamer picks
 * here. A 1080p screen composited into a 720p canvas and then scaled back up
 * on the viewer's side is why shared text turns to mush.
 *
 * Bitrates are for 30fps screen content, which is the hardest case — text
 * survives a low frame rate far better than it survives being starved of bits.
 */

interface QualityPreset {
  label: string;
  /** Multiplier on the 1280x720 scene, so 1.5 renders 1920x1080. */
  pixelRatio: number;
  height: number;
  maxBitrate: number;
  note: string;
}

const QUALITY_PRESETS = {
  360: {
    label: "360p",
    pixelRatio: 0.5,
    height: 360,
    maxBitrate: 800_000,
    note: "For a weak uplink, or a phone.",
  },
  480: {
    label: "480p",
    pixelRatio: 2 / 3,
    height: 480,
    maxBitrate: 1_200_000,
    note: "Modest, and easy on everything.",
  },
  720: {
    label: "720p",
    pixelRatio: 1,
    height: 720,
    maxBitrate: 3_000_000,
    note: "The safe default on most machines.",
  },
  1080: {
    label: "1080p",
    pixelRatio: 1.5,
    height: 1080,
    maxBitrate: 6_000_000,
    note: "Sharp screen text. Watch the CPU reading.",
  },
  1440: {
    label: "1440p",
    pixelRatio: 2,
    height: 1440,
    maxBitrate: 10_000_000,
    note: "Needs a strong machine and ~12 Mbps up.",
  },
  2160: {
    label: "4K",
    pixelRatio: 3,
    height: 2160,
    maxBitrate: 20_000_000,
    note: "Browser compositing rarely sustains this. Check the stats.",
  },
} as const satisfies Record<number, QualityPreset>;

type QualityHeight = keyof typeof QUALITY_PRESETS;

// 720p by default: it is what most machines sustain, and the stats readout
// invites raising it once there is headroom to spare.
const DEFAULT_QUALITY: QualityHeight = 720;

export { DEFAULT_QUALITY, QUALITY_PRESETS };
export type { QualityHeight, QualityPreset };
