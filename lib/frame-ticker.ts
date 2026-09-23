/**
 * A frame clock that keeps ticking while the tab is in the background.
 *
 * `requestAnimationFrame` stops completely in a hidden tab, and `setInterval`
 * is clamped to roughly one tick a second there. Either would freeze the
 * composed picture the moment the streamer switches tabs — which is precisely
 * when they are demonstrating the thing they are sharing.
 *
 * Timers inside a worker are not clamped that way while the page holds an open
 * WebRTC connection, which a broadcast always does. So the clock runs in a
 * worker and the drawing stays on the main thread, where the canvas is.
 */

const WORKER_SOURCE = `
let timer = null;
onmessage = (event) => {
  clearInterval(timer);
  if (event.data.stop) return;
  timer = setInterval(() => postMessage(0), event.data.interval);
};
`;

interface FrameTicker {
  stop: () => void;
}

function createFrameTicker(fps: number, onTick: () => void): FrameTicker {
  const interval = Math.round(1000 / fps);

  try {
    const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" }));
    const worker = new Worker(url);

    worker.onmessage = () => onTick();
    worker.postMessage({ interval });

    return {
      stop: () => {
        worker.terminate();
        URL.revokeObjectURL(url);
      },
    };
  } catch (error) {
    // A strict Content-Security-Policy can refuse a blob worker. Compositing is
    // still worth running without one; it will only stall if the tab is hidden.
    console.warn("Frame ticker fell back to requestAnimationFrame", error);

    let frame = requestAnimationFrame(function loop() {
      onTick();
      frame = requestAnimationFrame(loop);
    });

    return { stop: () => cancelAnimationFrame(frame) };
  }
}

export default createFrameTicker;
export type { FrameTicker };
