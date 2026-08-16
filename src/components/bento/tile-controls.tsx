import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  compact,
  visible,
  menuOpen,
  onMenuOpenChange,
  onResize,
  onEdit,
  onDelete,
}: {
  widget: Widget;
  compact: boolean;
  visible: boolean;
  menuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  onResize: (size: WidgetSize) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const sizes = SIZE_OPTIONS[widget.type];

  return (
    <div
      className={`glass-panel z-50 flex items-center gap-1 rounded-full p-1.5 text-foreground transition duration-200 ${
        compact
          ? "fixed inset-x-0 bottom-40 mx-auto w-fit"
          : "absolute -bottom-3 left-1/2 -translate-x-1/2 translate-y-full"
      } ${visible ? "opacity-100" : "pointer-events-none translate-y-[calc(100%-6px)] opacity-0"}`}
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
          className={`flex size-8 items-center justify-center rounded-full transition ${
            widget.size === size ? "bg-music text-music-foreground" : "hover:bg-foreground/10"
          }`}
        >
          <SizeGlyph size={size} />
        </button>
      ))}

      {sizes.length > 0 && <span className="mx-0.5 h-5 w-px bg-foreground/15" />}

      <DropdownMenu open={menuOpen} onOpenChange={onMenuOpenChange}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="More options"
            className="flex size-8 items-center justify-center rounded-full transition hover:bg-foreground/10"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" sideOffset={8} className="glass-panel rounded-2xl">
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil className="size-4" /> Edit details
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onDelete} className="text-destructive focus:text-destructive">
            <Trash2 className="size-4" /> Delete
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
