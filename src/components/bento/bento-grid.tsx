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
  type DragOverEvent,
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
import { GripVertical, Image as ImageIcon, Link2, Quote } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { useProfileStore } from "@/components/bento/profile-store";
import { TileControls } from "@/components/bento/tile-controls";
import { WidgetCard } from "@/components/bento/widget-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { SIZE_CLASSES, type Widget, type WidgetSize } from "@/lib/bento-types";
import { createWidget, fileToTileDataUrl, newWidgetId } from "@/lib/create-widget";

function SortableTile({
  widget,
  index,
  animate,
  overId,
  onDelete,
}: {
  widget: Widget;
  index: number;
  animate: boolean;
  overId: string | null;
  onDelete: (w: Widget) => void;
}) {
  const { editing, selectedId, setSelectedId, dispatch } = useProfileStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widget.id,
    disabled: !editing,
  });

  const selected = editing && selectedId === widget.id;
  const showControls = editing && selected && !isDragging;
  const isDropTarget = overId !== null && widget.id === overId && !isDragging;
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
      {isDropTarget && (
        <div className="absolute inset-0 z-50 rounded-[var(--radius-tile)] border-2 border-dashed border-music/60 bg-foreground/[0.04]" />
      )}
      <div
        className={`group/tile h-full ${isDragging ? "opacity-0" : ""} ${
          editing ? "cursor-grab touch-none select-none active:cursor-grabbing" : ""
        } ${
          selected && !isDragging
            ? "rounded-[var(--radius-tile)] ring-2 ring-music ring-offset-2 ring-offset-background"
            : ""
        }`}
        {...dragProps}
      >
        {editing && (
          <span className="pointer-events-none absolute top-2 left-2 z-10 text-foreground/35 opacity-0 transition group-hover/tile:opacity-100">
            <GripVertical className="size-4" aria-hidden />
          </span>
        )}
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
              className="block h-full rounded-[var(--radius-tile)] focus-visible:ring-2 focus-visible:ring-music focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
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
          visible={showControls}
          onResize={(size: WidgetSize) => dispatch({ type: "resize", id: widget.id, size })}
          onDelete={() => onDelete(widget)}
        />
      )}
    </motion.div>
  );
}

function EmptyState() {
  const { dispatch, setEditing, setSelectedId, setFocusWidgetId, requestLinkMode } = useProfileStore();
  const fileRef = useRef<HTMLInputElement>(null);

  function place(widget: Widget, message: string) {
    dispatch({ type: "add", widget });
    setSelectedId(widget.id);
    setFocusWidgetId(widget.id);
    setEditing(true);
    toast.success(message);
  }

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-[var(--radius-tile)] border border-dashed border-border p-10 text-center">
      <p className="text-lg font-semibold">Your bento is empty</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Paste a link in the bar below, or add a photo or a note to start.
      </p>
      <div className="mt-1 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setEditing(true);
            requestLinkMode();
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-music px-4 py-1.5 text-sm font-semibold text-music-foreground transition duration-150 hover:brightness-110 active:opacity-80"
        >
          <Link2 className="size-4" aria-hidden /> Add a link
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-4 py-1.5 text-sm font-semibold transition hover:bg-muted/80"
        >
          <ImageIcon className="size-4" aria-hidden /> Add a photo
        </button>
        <button
          type="button"
          onClick={() => {
            const { widget, message } = createWidget("text");
            place(widget, message);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-4 py-1.5 text-sm font-semibold transition hover:bg-muted/80"
        >
          <Quote className="size-4" aria-hidden /> Add a note
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          void fileToTileDataUrl(file)
            .then((src) =>
              place(
                {
                  id: newWidgetId(),
                  type: "image",
                  size: "lg",
                  src,
                  alt: file.name.replace(/\.[^.]+$/, ""),
                  caption: "",
                },
                "Image added to your bento",
              ),
            )
            .catch((err) => toast.error(err instanceof Error ? err.message : "Could not add that image"));
        }}
      />
    </div>
  );
}

export function BentoGrid() {
  const { state, dispatch, editing, setSelectedId, preview, hasDragged, markDragged } =
    useProfileStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion && activeId === null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const active = state.widgets.find((w) => w.id === activeId) ?? null;

  function handleStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
    setOverId(null);
    setSelectedId(null);
    markDragged();
  }

  function handleOver(e: DragOverEvent) {
    setOverId(e.over ? String(e.over.id) : null);
  }

  function handleEnd(e: DragEndEvent) {
    const { active: a, over } = e;
    setActiveId(null);
    setOverId(null);
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
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      {editing && !hasDragged && state.widgets.length > 1 && (
        <p className="text-center text-xs font-medium text-muted-foreground">
          {isMobile ? "Hold a tile, then drag to rearrange" : "Drag tiles to rearrange"}
        </p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToParentElement]}
        autoScroll={{ threshold: { x: 0, y: 0.2 } }}
        onDragStart={handleStart}
        onDragOver={handleOver}
        onDragEnd={handleEnd}
        onDragCancel={() => {
          setActiveId(null);
          setOverId(null);
        }}
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
                animate={animate}
                overId={overId}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
          {active ? (
            <div className="h-full w-full rotate-[1.5deg] scale-[1.04] cursor-grabbing opacity-95 drop-shadow-2xl">
              <WidgetCard widget={active} editing={false} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
