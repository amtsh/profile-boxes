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
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useProfileStore } from "@/components/bento/profile-store";
import { WidgetCard } from "@/components/bento/widget-card";
import { useIsMobile } from "@/hooks/use-mobile";
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

function SortableTile({
  widget,
  index,
  compact,
  onEdit,
  onDelete,
}: {
  widget: Widget;
  index: number;
  compact: boolean;
  onEdit: (w: Widget) => void;
  onDelete: (w: Widget) => void;
}) {
  const { editing, selectedId, setSelectedId, dispatch } = useProfileStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widget.id,
    disabled: !editing,
  });
  const selected = editing && selectedId === widget.id;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        animationDelay: `${Math.min(index, 12) * 40}ms`,
      }}
      className={`tile-enter relative ${widget.type === "section" ? "col-span-full row-span-1 h-14 self-end" : SIZE_CLASSES[widget.size]} ${
        isDragging ? "z-40 scale-[1.04] opacity-40" : ""
      }`}
      onClick={() => editing && setSelectedId(selected ? null : widget.id)}
    >
      <div
        className={`group/tile h-full ${editing ? "cursor-grab touch-none select-none active:cursor-grabbing" : ""} ${
          selected
            ? "rounded-[1.5rem] ring-2 ring-music ring-offset-2 ring-offset-background"
            : ""
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
              className="block h-full rounded-[1.5rem] focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              <WidgetCard widget={widget} editing={editing} />
            </a>
          )
        ) : (
          <WidgetCard widget={widget} editing={editing} />
        )}
      </div>

      {editing && !selected && (
        <span className="pointer-events-none absolute top-2 right-2 rounded-full bg-foreground/70 p-1 text-background opacity-60 transition">
          <GripVertical className="size-3" />
        </span>
      )}

      {selected && (
        <div
          className={
            compact
              ? "glass-panel fixed inset-x-0 bottom-28 z-50 mx-auto flex w-fit items-center gap-1 rounded-full p-1.5 text-foreground"
              : "glass-panel absolute -bottom-3 left-1/2 z-50 flex -translate-x-1/2 translate-y-full items-center gap-1 rounded-full p-1.5 text-foreground"
          }
          onClick={(e) => e.stopPropagation()}
        >
          {widget.type !== "section" &&
            SIZE_ORDER.map((size) => (
              <button
                key={size}
                type="button"
                aria-label={SIZE_LABELS[size]}
                title={SIZE_LABELS[size]}
                onClick={() => dispatch({ type: "resize", id: widget.id, size })}
                className={`flex size-8 items-center justify-center rounded-full transition ${
                  widget.size === size
                    ? "bg-music text-music-foreground"
                    : "hover:bg-foreground/10"
                }`}
              >
                <SizeGlyph size={size} />
              </button>
            ))}
          {widget.type !== "section" && <span className="mx-0.5 h-5 w-px bg-foreground/15" />}
          <button
            type="button"
            aria-label="Edit widget"
            onClick={() => onEdit(widget)}
            className="flex size-8 items-center justify-center rounded-full hover:bg-foreground/10"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Delete widget"
            onClick={() => onDelete(widget)}
            className="flex size-8 items-center justify-center rounded-full text-destructive hover:bg-destructive/15"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export function BentoGrid({ onEdit }: { onEdit: (w: Widget) => void }) {
  const { state, dispatch, editing, setEditing, setSelectedId, preview } = useProfileStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const compact = preview === "mobile" || isMobile;

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

  function handleDelete(widget: Widget) {
    const snapshot = state.widgets;
    setSelectedId(null);
    dispatch({ type: "remove", id: widget.id });
    toast("Widget deleted", {
      action: {
        label: "Undo",
        onClick: () => dispatch({ type: "reorder", widgets: snapshot }),
      },
    });
  }

  if (state.widgets.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-[1.5rem] border-2 border-dashed border-border p-10 text-center">
        <p className="font-display text-lg font-semibold">Your bento is empty</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Add a link, a social account, a photo or a note to start building your page.
        </p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
        >
          <Plus className="size-4" /> Add your first widget
        </button>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToParentElement]}
      autoScroll={{ threshold: { x: 0, y: 0.2 } }}
      onDragStart={handleStart}
      onDragEnd={handleEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={state.widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
        <div
          className={`grid grid-flow-row-dense gap-4 auto-rows-[var(--tile-h)] [&>*]:min-h-0 ${
            preview === "mobile"
              ? "grid-cols-2 [--tile-h:150px]"
              : "grid-cols-2 [--tile-h:150px] md:grid-cols-3 md:[--tile-h:168px] lg:grid-cols-4"
          }`}
        >
          {state.widgets.map((w, i) => (
            <SortableTile
              key={w.id}
              widget={w}
              index={i}
              compact={compact}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
        {active ? (
          <div className="h-full w-full rotate-1 scale-[1.05] opacity-95 drop-shadow-2xl">
            <WidgetCard widget={active} editing={editing} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
