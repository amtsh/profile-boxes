import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { useProfileStore } from "@/components/bento/profile-store";
import { WidgetCard } from "@/components/bento/widget-card";
import { SIZE_CLASSES, SIZE_LABELS, type Widget, type WidgetSize } from "@/lib/bento-types";

const SIZE_ORDER: WidgetSize[] = ["sm", "wide", "tall", "lg"];

function SizeGlyph({ size }: { size: WidgetSize }) {
  const box: Record<WidgetSize, string> = {
    sm: "w-2.5 h-2.5",
    wide: "w-5 h-2.5",
    tall: "w-2.5 h-5",
    lg: "w-5 h-5",
  };
  return <span className={`block rounded-[3px] bg-current ${box[size]}`} />;
}

function SortableTile({ widget, onEdit }: { widget: Widget; onEdit: (w: Widget) => void }) {
  const { editing, selectedId, setSelectedId, dispatch } = useProfileStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widget.id,
    disabled: !editing,
  });
  const selected = editing && selectedId === widget.id;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`relative ${SIZE_CLASSES[widget.size]} ${isDragging ? "z-40 opacity-30" : ""}`}
      onClick={() => editing && setSelectedId(selected ? null : widget.id)}
    >
      <div
        className={`h-full ${editing ? "cursor-grab active:cursor-grabbing" : ""} ${
          selected ? "rounded-[1.5rem] ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""
        }`}
        {...(editing ? { ...attributes, ...listeners } : {})}
      >
        {widget.type === "link" || widget.type === "social" ? (
          editing ? (
            <div className="h-full">
              <WidgetCard widget={widget} editing={editing} />
            </div>
          ) : (
            <a
              href={widget.url}
              target="_blank"
              rel="noreferrer noopener"
              className="block h-full rounded-[1.5rem] focus-visible:ring-2 focus-visible:ring-foreground focus-visible:outline-none"
            >
              <WidgetCard widget={widget} editing={editing} />
            </a>
          )
        ) : (
          <WidgetCard widget={widget} editing={editing} />
        )}
      </div>

      {editing && (
        <span className="pointer-events-none absolute top-2 right-2 rounded-full bg-foreground/70 p-1 text-background opacity-0 transition group-hover:opacity-100 md:opacity-60">
          <GripVertical className="size-3" />
        </span>
      )}

      {selected && (
        <div
          className="absolute -bottom-3 left-1/2 z-50 flex -translate-x-1/2 translate-y-full items-center gap-1 rounded-full bg-foreground p-1.5 text-background shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {SIZE_ORDER.map((size) => (
            <button
              key={size}
              type="button"
              aria-label={SIZE_LABELS[size]}
              title={SIZE_LABELS[size]}
              onClick={() => dispatch({ type: "resize", id: widget.id, size })}
              className={`flex size-7 items-center justify-center rounded-full transition ${
                widget.size === size ? "bg-background/25" : "hover:bg-background/15"
              }`}
            >
              <SizeGlyph size={size} />
            </button>
          ))}
          <span className="mx-0.5 h-5 w-px bg-background/25" />
          <button
            type="button"
            aria-label="Edit widget"
            onClick={() => onEdit(widget)}
            className="flex size-7 items-center justify-center rounded-full hover:bg-background/15"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Delete widget"
            onClick={() => dispatch({ type: "remove", id: widget.id })}
            className="flex size-7 items-center justify-center rounded-full hover:bg-background/15"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export function BentoGrid({ onEdit }: { onEdit: (w: Widget) => void }) {
  const { state, dispatch, editing, setSelectedId } = useProfileStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const active = state.widgets.find((w) => w.id === activeId) ?? null;

  function handleStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
    setSelectedId(null);
  }

  function handleEnd(e: DragEndEvent) {
    const { active: a, over } = e;
    setActiveId(null);
    if (!over || a.id === over.id) return;
    const oldIndex = state.widgets.findIndex((w) => w.id === a.id);
    const newIndex = state.widgets.findIndex((w) => w.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    dispatch({ type: "reorder", widgets: arrayMove(state.widgets, oldIndex, newIndex) });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToParentElement]}
      onDragStart={handleStart}
      onDragEnd={handleEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={state.widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-4 [--tile-h:150px] md:grid-cols-3 md:[--tile-h:168px] lg:grid-cols-4 [&>*]:min-h-0 auto-rows-[var(--tile-h)]">
          {state.widgets.map((w) => (
            <SortableTile key={w.id} widget={w} onEdit={onEdit} />
          ))}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
        {active ? (
          <div className="h-full w-full rotate-1 scale-[1.03] opacity-95">
            <WidgetCard widget={active} editing={editing} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
