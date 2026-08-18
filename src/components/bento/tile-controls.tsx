import { Trash2 } from "lucide-react";

import { SIZE_LABELS, SIZE_OPTIONS, type Widget, type WidgetSize } from "@/lib/bento-types";

function SizeGlyph({ size }: { size: WidgetSize }) {
  const box: Record<WidgetSize, string> = {
    sm: "w-2.5 h-2.5",
    wide: "w-5 h-2.5",
    tall: "w-2.5 h-5",
    lg: "w-5 h-5",
  };
  return <span className={`block rounded-[3px] bg-current ${box[size]}`} />;
}

export function TileControls({
  widget,
  visible,
  onResize,
  onDelete,
}: {
  widget: Widget;
  visible: boolean;
  onResize: (size: WidgetSize) => void;
  onDelete: () => void;
}) {
  const sizes = SIZE_OPTIONS[widget.type];

  return (
    <div
      className={`glass-panel absolute top-2 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full p-1.5 text-foreground transition duration-200 ${
        visible ? "opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
      }`}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {sizes.map((size) => (
        <button
          key={size}
          type="button"
          aria-label={SIZE_LABELS[size]}
          aria-pressed={widget.size === size}
          title={SIZE_LABELS[size]}
          onClick={() => onResize(size)}
          className={`flex size-8 items-center justify-center rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-music focus-visible:outline-none ${
            widget.size === size
              ? "bg-music text-music-foreground shadow-sm"
              : "text-foreground/70 hover:bg-foreground/10 hover:text-foreground"
          }`}
        >
          <SizeGlyph size={size} />
        </button>
      ))}

      {sizes.length > 0 && <span className="mx-0.5 h-5 w-px bg-foreground/15" />}

      <button
        type="button"
        aria-label="Delete tile"
        title="Delete"
        onClick={onDelete}
        className="flex size-8 items-center justify-center rounded-full text-foreground/70 transition-colors duration-200 hover:bg-foreground/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-music focus-visible:outline-none"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </div>
  );
}
