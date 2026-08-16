import { Check, Monitor, Plus, Pencil, RotateCcw, Smartphone } from "lucide-react";
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
  const { state, dispatch, editing, setEditing, preview, setPreview } = useProfileStore();
  const [addOpen, setAddOpen] = useState(false);
  const isMobile = useIsMobile();

  const panel = <AddWidgetPanel onDone={() => setAddOpen(false)} />;

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center p-4 md:bottom-0">
        <div className="pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center gap-1 overflow-x-auto rounded-full bg-card p-1.5 shadow-xl ring-1 ring-border backdrop-blur no-scrollbar md:max-w-[calc(100vw-6rem)]">
          <div className="flex shrink-0 items-center gap-1">
            {(
              [
                { id: "desktop", label: "Desktop", Icon: Monitor },
                { id: "mobile", label: "Mobile", Icon: Smartphone },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPreview(id)}
                aria-pressed={preview === id}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
                  preview === id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>

          {editing && (
            <>
              <span className="mx-1 h-6 w-px shrink-0 bg-border" />

              <div className="flex shrink-0 items-center gap-1 px-1">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    title={t.label}
                    aria-label={`${t.label} theme`}
                    onClick={() => dispatch({ type: "theme", theme: t.id })}
                    className={`size-6 rounded-full border transition ${t.swatch} ${
                      state.theme === t.id ? "ring-2 ring-foreground ring-offset-1 ring-offset-card" : ""
                    }`}
                  />
                ))}
              </div>

              <span className="mx-1 h-6 w-px shrink-0 bg-border" />

              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "reset" });
                  toast.success("Reset to the Shakespeare demo");
                }}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition hover:bg-muted"
              >
                <RotateCcw className="size-4" /> Reset
              </button>
            </>
          )}
        </div>
      </div>

      <div className="fixed right-5 bottom-5 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing(!editing)}
          aria-label={editing ? "Done editing" : "Edit"}
          className="flex items-center gap-1.5 rounded-full bg-card px-4 py-3 text-sm font-semibold whitespace-nowrap text-foreground shadow-xl ring-1 ring-border transition hover:bg-muted"
        >
          {editing ? <Check className="size-4" /> : <Pencil className="size-4" />}
          {editing ? "Done" : "Edit"}
        </button>

        <button
          type="button"
          onClick={() => {
            setEditing(true);
            setAddOpen(true);
          }}
          aria-label="Add to Bento"
          className="flex size-14 items-center justify-center rounded-full bg-foreground text-background shadow-xl transition hover:scale-105 active:scale-95"
        >
          <Plus className="size-6" />
        </button>
      </div>


      {isMobile ? (
        <Drawer open={addOpen} onOpenChange={setAddOpen}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Add to Bento</DrawerTitle>
              <DrawerDescription>Drop in a link, a social, or a widget.</DrawerDescription>
            </DrawerHeader>
            <div className="max-h-[70vh] overflow-y-auto px-4 pb-8">{panel}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add to Bento</DialogTitle>
              <DialogDescription>Drop in a link, a social, or a widget.</DialogDescription>
            </DialogHeader>
            {panel}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
