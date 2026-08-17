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
import { Plus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

import { useProfileStore } from "@/components/bento/profile-store";
import { TileControls } from "@/components/bento/tile-controls";
import { WidgetCard } from "@/components/bento/widget-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { SIZE_CLASSES, type Widget, type WidgetSize } from "@/lib/bento-types";

function SortableTile({
  widget,
  index,
  compact,
  animate,
  onEdit,
  onDelete,
}: {
  widget: Widget;
  index: number;
  compact: boolean;
  animate: boolean;
  onEdit: (w: Widget) => void;
  onDelete: (w: Widget) => void;
}) {
  const { editing, selectedId, setSelectedId, dispatch } = useProfileStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widget.id,
    disabled: !editing,
  });
  const [menuOpen, setMenuOpen] = useState(false);

  // Controls reveal on click/tap on every device.
  const selected = editing && selectedId === widget.id;
  const showControls = editing && (selected || menuOpen) && !isDragging;
  const dragProps = editing ? { ...attributes, ...listeners } : {};

  const spanClass =
    widget.type === "section" ? "col-span-full row-span-1 h-14 self-end" : SIZE_CLASSES[widget.size];

  return (
    <motion.div
      ref={setNodeRef}
      layout={animate}
      initial={animate ? { opacity: 0, scale: 0.97 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        layout: { type: "spring", stiffness: 420, damping: 38, mass: 0.9 },
        default: { duration: 0.35, delay: Math.min(index, 12) * 0.03 },
      }}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      className={`relative ${spanClass} ${isDragging ? "z-40" : showControls ? "z-30" : ""}`}
      onClick={() => editing && setSelectedId(selected ? null : widget.id)}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 rounded-[1.5rem] border-2 border-dashed border-music/70 bg-foreground/[0.03]" />
      )}
      <div
        className={`group/tile h-full ${isDragging ? "opacity-0" : ""} ${
          editing ? "cursor-grab touch-none select-none active:cursor-grabbing" : ""
        } ${
          selected && !isDragging
            ? "rounded-[1.5rem] ring-2 ring-music ring-offset-2 ring-offset-background"
            : ""
        }`}
        {...dragProps}
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
              className="block h-full rounded-[1.5rem] focus-visible:ring-2 focus-visible:ring-music focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              <WidgetCard widget={widget} editing={editing} />
            </a>
          )
        ) : (
          <WidgetCard widget={widget} editing={editing} />
        )}
      </div>

      {editing && !isDragging && (
        <TileControls
          widget={widget}
          compact={compact}
          visible={showControls}
          menuOpen={menuOpen}
          onMenuOpenChange={setMenuOpen}
          onResize={(size: WidgetSize) => dispatch({ type: "resize", id: widget.id, size })}
          onEdit={() => onEdit(widget)}
          onDelete={() => onDelete(widget)}
        />
      )}
    </motion.div>
  );
}

export function BentoGrid({ onEdit }: { onEdit: (w: Widget) => void }) {
  const { state, dispatch, editing, setEditing, setSelectedId, preview } = useProfileStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const compact = preview === "mobile" || isMobile;
  // dnd-kit owns the transforms while dragging; layout animation runs otherwise.
  const animate = !reduceMotion && activeId === null;

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
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-border p-10 text-center">
        <p className="font-display text-lg font-semibold">Your bento is empty</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Add a link, a social account, a photo or a note to start building your page.
        </p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-music px-4 py-2 text-sm font-semibold text-music-foreground transition hover:brightness-105 active:scale-95"
        >
          <Plus className="size-4" /> Start editing
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
              animate={animate}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
        {active ? (
          <div className="h-full w-full rotate-1 scale-[1.05] opacity-95 drop-shadow-2xl">
            <WidgetCard widget={active} editing={false} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
