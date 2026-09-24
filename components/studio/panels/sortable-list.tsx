/**
 * A list whose rows can be dragged into a new order.
 *
 * dnd-kit rather than a hand-rolled drag: it brings pointer, touch and
 * keyboard reordering, and a list that can only be reordered with a mouse is
 * one a lot of people cannot reorder at all. Dragging is on a handle, because
 * these rows are full of buttons that must stay clickable.
 */

"use client";

import type { ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SortableListProps {
  ids: string[];
  onReorder: (ids: string[]) => void;
  children: ReactNode;
  label: string;
}

function SortableList({ ids, onReorder, children, label }: SortableListProps) {
  const sensors = useSensors(
    // A few pixels of movement before a drag starts, so a click stays a click.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;

    onReorder(arrayMove(ids, from, to));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="space-y-1" aria-label={label}>
          {children}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  id,
  children,
  isActive,
}: {
  id: string;
  children: ReactNode;
  isActive?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={[
        "flex items-center gap-1 rounded-md px-1",
        isActive ? "bg-muted" : "",
        isDragging ? "z-10 opacity-80 shadow-lg" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Button
        variant="ghost"
        size="sm"
        className="cursor-grab px-1 active:cursor-grabbing"
        aria-label="Reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4 text-muted-foreground" aria-hidden="true" />
      </Button>
      {children}
    </li>
  );
}

export { SortableList, SortableRow };
