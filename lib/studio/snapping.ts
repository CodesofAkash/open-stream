/**
 * Alignment guides, the way a design tool does them.
 *
 * Dragging by eye cannot hit an edge or a centre exactly, and "close enough"
 * is visible in a 1280x720 frame. So while something is dragged, its edges and
 * centre are compared against the frame's and against every other source's,
 * and the nearest match within a few pixels pulls it into line — with a line
 * drawn to say why it moved.
 *
 * Everything here is in canvas units, so it behaves the same whatever size the
 * editor is being shown at.
 */

const SNAP_DISTANCE = 6;

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Guide {
  orientation: "vertical" | "horizontal";
  /** Where the line sits, in canvas units. */
  position: number;
  /** How far the dragged box must move to meet it. */
  offset: number;
}

/** The lines a box can snap to: the frame's, and every other box's. */
function collectEdges(frame: Box, others: Box[]) {
  const vertical = [frame.x, frame.x + frame.width / 2, frame.x + frame.width];
  const horizontal = [frame.y, frame.y + frame.height / 2, frame.y + frame.height];

  for (const box of others) {
    vertical.push(box.x, box.x + box.width / 2, box.x + box.width);
    horizontal.push(box.y, box.y + box.height / 2, box.y + box.height);
  }

  return { vertical, horizontal };
}

/** The moving box's own lines, which are what get compared. */
function boxEdges(box: Box) {
  return {
    vertical: [box.x, box.x + box.width / 2, box.x + box.width],
    horizontal: [box.y, box.y + box.height / 2, box.y + box.height],
  };
}

function nearest(moving: number[], targets: number[]): Guide | null {
  let best: { position: number; offset: number; distance: number } | null = null;

  for (const edge of moving) {
    for (const target of targets) {
      const distance = Math.abs(target - edge);
      if (distance > SNAP_DISTANCE) continue;
      if (best && distance >= best.distance) continue;

      best = { position: target, offset: target - edge, distance };
    }
  }

  return best ? { orientation: "vertical", position: best.position, offset: best.offset } : null;
}

/** Where a dragged box lands, and the guides to draw. `others` excludes it. */
function snapBox(box: Box, frame: Box, others: Box[]): { x: number; y: number; guides: Guide[] } {
  const targets = collectEdges(frame, others);
  const edges = boxEdges(box);

  const vertical = nearest(edges.vertical, targets.vertical);
  const horizontal = nearest(edges.horizontal, targets.horizontal);

  const guides: Guide[] = [];
  if (vertical) guides.push({ ...vertical, orientation: "vertical" });
  if (horizontal) guides.push({ ...horizontal, orientation: "horizontal" });

  return {
    x: box.x + (vertical?.offset ?? 0),
    y: box.y + (horizontal?.offset ?? 0),
    guides,
  };
}

export { SNAP_DISTANCE, snapBox };
export type { Box, Guide };
