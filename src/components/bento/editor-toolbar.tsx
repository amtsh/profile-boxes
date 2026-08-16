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

  const showPill = !isMobile || editing;

  return (
    <>
      {showPill && (
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center p-4 md:bottom-0">
        <div className="glass-panel pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center gap-1 overflow-x-auto rounded-full p-1.5 no-scrollbar md:max-w-[calc(100vw-6rem)]">
          {!isMobile && (

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
                      ? "bg-music text-music-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-foreground/5"
                  }`}
                >
                  <Icon className="size-4" /> {label}
                </button>
              ))}
            </div>
          )}

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
                    className={`size-6 rounded-full border shadow-inner transition ${t.swatch} ${
                      state.theme === t.id ? "ring-2 ring-music ring-offset-1 ring-offset-transparent" : ""
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
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition hover:bg-foreground/5"
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
          className="glass-panel flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-semibold whitespace-nowrap text-foreground transition hover:brightness-105"
        >
          {editing ? <Check className="size-4" /> : <Pencil className="size-4" />}
          {editing ? "Done" : "Edit"}
        </button>

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          aria-label="Add to Bento"
          className="flex size-14 items-center justify-center rounded-full bg-music text-music-foreground shadow-[0_10px_30px_oklch(0.62_0.23_14/0.45)] ring-1 ring-white/25 transition hover:scale-105 active:scale-95"
        >
          <Plus className="size-6" />
        </button>
      </div>


      {isMobile ? (
        <Drawer open={addOpen} onOpenChange={setAddOpen}>
          <DrawerContent
            className={`bento-theme-${state.theme} glass-panel border-0 bg-background/80 text-foreground`}
          >
            <DrawerHeader className="text-left">
              <DrawerTitle>Add to Bento</DrawerTitle>
              <DrawerDescription>Drop in a link, a social, or a widget.</DrawerDescription>
            </DrawerHeader>
            <div className="max-h-[70vh] overflow-y-auto px-4 pb-8">{panel}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent
            className={`bento-theme-${state.theme} glass-panel max-h-[85vh] overflow-y-auto rounded-3xl bg-background/70 text-foreground sm:max-w-md`}
          >
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
