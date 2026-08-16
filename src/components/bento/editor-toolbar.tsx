import { Check, Plus, Pencil, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AddWidgetPanel } from "@/components/bento/add-widget-panel";
import { useProfileStore } from "@/components/bento/profile-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ThemeId } from "@/lib/bento-types";

const THEMES: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "light", label: "Light", swatch: "bg-[oklch(0.975_0.005_95)] border-black/10" },
  { id: "dark", label: "Dark", swatch: "bg-[oklch(0.17_0.008_260)] border-white/20" },
  { id: "sage", label: "Sage", swatch: "bg-[oklch(0.86_0.06_150)] border-black/10" },
  { id: "clay", label: "Clay", swatch: "bg-[oklch(0.87_0.07_60)] border-black/10" },
];

export function EditorToolbar() {
  const { state, dispatch, editing, setEditing } = useProfileStore();
  const [addOpen, setAddOpen] = useState(false);
  const isMobile = useIsMobile();

  const panel = <AddWidgetPanel onDone={() => setAddOpen(false)} />;

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4">
        <div className="pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center gap-1 overflow-x-auto rounded-full bg-foreground/95 p-1.5 text-background shadow-xl backdrop-blur no-scrollbar">
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-1.5 rounded-full bg-background/15 px-4 py-2 text-sm font-medium whitespace-nowrap transition hover:bg-background/25"
          >
            {editing ? <Check className="size-4" /> : <Pencil className="size-4" />}
            {editing ? "Done" : "Edit"}
          </button>

          {editing && (
            <>
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition hover:bg-background/15"
              >
                <Plus className="size-4" /> Add
              </button>

              <span className="mx-1 h-6 w-px shrink-0 bg-background/25" />

              <div className="flex shrink-0 items-center gap-1 px-1">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    title={t.label}
                    aria-label={`${t.label} theme`}
                    onClick={() => dispatch({ type: "theme", theme: t.id })}
                    className={`size-6 rounded-full border transition ${t.swatch} ${
                      state.theme === t.id ? "ring-2 ring-background ring-offset-1 ring-offset-foreground" : ""
                    }`}
                  />
                ))}
              </div>

              <span className="mx-1 h-6 w-px shrink-0 bg-background/25" />

              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "reset" });
                  toast.success("Reset to the Shakespeare demo");
                }}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition hover:bg-background/15"
              >
                <RotateCcw className="size-4" /> Reset
              </button>
            </>
          )}
        </div>
      </div>

      {isMobile ? (
        <Drawer open={addOpen} onOpenChange={setAddOpen}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Add a widget</DrawerTitle>
              <DrawerDescription>Paste a link or choose a widget type.</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-8">{panel}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add a widget</DialogTitle>
              <DialogDescription>Paste a link or choose a widget type.</DialogDescription>
            </DialogHeader>
            {panel}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
