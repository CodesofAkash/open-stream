/**
 * Turning the stats into something a person can act on.
 *
 * "Limited by cpu" is the browser's word, not an instruction. What a streamer
 * needs is which of the two things they control is short — the machine or the
 * connection — and what to do about it. The numbers are theirs; the sentence
 * is what makes them useful.
 */

interface DiagnosisInput {
  width: number;
  height: number;
  fps: number;
  kbps: number;
  limitation: string;
  packetLoss: number;
  rtt: number;
  direct: boolean;
  /** What the chosen quality preset asks for. */
  targetHeight: number;
  targetKbps: number;
}

interface Diagnosis {
  severity: "ok" | "warning" | "problem";
  headline: string;
  detail: string;
}

function diagnose(stats: DiagnosisInput): Diagnosis {
  // Nothing is being encoded at all, which is not a quality problem.
  if (stats.fps === 0 || stats.width === 0) {
    return {
      severity: "problem",
      headline: "Nothing is being sent",
      detail:
        "The encoder has not produced a single frame. Viewers see an offline channel. End the stream and start it again.",
    };
  }

  if (stats.limitation === "cpu") {
    return {
      severity: "problem",
      headline: "Your machine is the limit",
      detail:
        `Sending ${stats.width}×${stats.height} at ${stats.fps}fps is more than this machine can encode right now. ` +
        (stats.direct
          ? "Close other apps, or drop a quality step."
          : "Close other apps, drop a quality step, or switch on Direct mode if your scene is a single full-frame camera or screen."),
    };
  }

  // Only the browser's own verdict counts: comparing bitrate to the cap
  // flagged a healthy 640x360@30, which simply needed fewer bits than that.
  if (stats.limitation === "bandwidth") {
    return {
      severity: "problem",
      headline: "Your connection is the limit",
      detail:
        `Only ${stats.kbps.toLocaleString()} kbps is getting through and the browser is holding back. ` +
        `${stats.targetHeight}p wants roughly ${Math.round(stats.targetKbps / 1000).toLocaleString()} kbps. ` +
        "Drop a quality step, or free up your upload.",
    };
  }

  // Loss and latency degrade what arrives even when the encoder is happy.
  if (stats.packetLoss > 50 || stats.rtt > 400) {
    return {
      severity: "warning",
      headline: "The connection is unsteady",
      detail:
        `${stats.packetLoss} lost packets and a ${stats.rtt}ms round trip. Viewers will see stutter. ` +
        "A wired connection or a closer network helps more than a lower quality here.",
    };
  }

  if (stats.height < stats.targetHeight * 0.9) {
    return {
      severity: "warning",
      headline: "Sending below your chosen quality",
      detail:
        `You asked for ${stats.targetHeight}p and ${stats.height}p is going out. ` +
        "The browser lowered it to keep up; it will rise again when it can.",
    };
  }

  return {
    severity: "ok",
    headline: "Healthy",
    detail: `${stats.width}×${stats.height} at ${stats.fps}fps is reaching your viewers.`,
  };
}

export { diagnose };
export type { Diagnosis, DiagnosisInput };
