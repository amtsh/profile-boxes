import {
  Check,
  Image as ImageIcon,
  LayoutTemplate,
  Link2,
  Monitor,
  Plus,
  Pencil,
  Quote,
  RotateCcw,
  Smartphone,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
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
import type { ThemeId, Widget } from "@/lib/bento-types";
import { createWidget, fileToTileDataUrl, newWidgetId, widgetFromUrl } from "@/lib/create-widget";

const THEMES: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "light", label: "Light", swatch: "bg-[oklch(0.975_0.005_95)] border-black/10" },
  { id: "dark", label: "Dark", swatch: "bg-[oklch(0.17_0.008_260)] border-white/20" },
  { id: "sage", label: "Sage", swatch: "bg-[oklch(0.86_0.06_150)] border-black/10" },
  { id: "clay", label: "Clay", swatch: "bg-[oklch(0.87_0.07_60)] border-black/10" },
];

export function EditorToolbar() {
  const { state, dispatch, editing, setEditing, preview, setPreview, setSelectedId } =
    useProfileStore();
  const [addOpen, setAddOpen] = useState(false);
  const [mode, setMode] = useState<"default" | "link">("default");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const panel = <AddWidgetPanel onDone={() => setAddOpen(false)} />;

  const showPill = !isMobile || editing;

  function place(widget: Widget, message: string) {
    dispatch({ type: "add", widget });
    setSelectedId(widget.id);
    setEditing(true);
    toast.success(message);
  }

  function closeLinkRow() {
    setMode("default");
    setLinkUrl("");
    setLinkError("");
  }

  function submitLink() {
    const result = widgetFromUrl(linkUrl);
    if (!result) {
      setLinkError("Enter a valid link, e.g. example.com");
      return;
    }
    place(result.widget, result.message);
    closeLinkRow();
  }

  async function onPickImage(file: File | undefined) {
    if (!file) return;
    try {
      const src = await fileToTileDataUrl(file);
      place(
        { id: newWidgetId(), type: "image", size: "lg", src, alt: file.name.replace(/\.[^.]+$/, ""), caption: "" },
        "Image added to your bento",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add that image");
    }
  }

  function quickAdd(type: "text" | "section") {
    const { widget, message } = createWidget(type);
    place(widget, message);
  }

  const SHORTCUTS = [
    { id: "link", label: "Add link", Icon: Link2, run: () => setMode("link") },
    { id: "image", label: "Add image", Icon: ImageIcon, run: () => fileRef.current?.click() },
    { id: "quote", label: "Add quote", Icon: Quote, run: () => quickAdd("text") },
    { id: "section", label: "Add section", Icon: LayoutTemplate, run: () => quickAdd("section") },
  ] as const;


  return (
    <>
      {showPill && (
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center p-4 md:bottom-0">
        <div className="glass-panel pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center gap-1 overflow-x-auto rounded-full p-1.5 no-scrollbar md:max-w-[calc(100vw-6rem)]">
          {mode === "link" ? (
            <div className="flex min-w-0 shrink-0 items-center gap-1 pl-2">
              <Link2 className="size-4 shrink-0 text-muted-foreground" />
              <div className="flex min-w-0 flex-col">
                <input
                  autoFocus
                  value={linkUrl}
                  onChange={(e) => {
                    setLinkUrl(e.target.value);
                    setLinkError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitLink();
                    if (e.key === "Escape") closeLinkRow();
                  }}
                  placeholder="Paste a link…"
                  aria-label="Link URL"
                  className="w-56 max-w-[45vw] bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
                />
                {linkError && <span className="px-2 pb-1 text-xs text-destructive">{linkError}</span>}
              </div>
              <button
                type="button"
                onClick={submitLink}
                disabled={!linkUrl.trim()}
                className="rounded-full bg-music px-4 py-2 text-sm font-semibold whitespace-nowrap text-music-foreground transition hover:brightness-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              >
                Add
              </button>
              <button
                type="button"
                onClick={closeLinkRow}
                aria-label="Cancel adding link"
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-foreground/5 active:scale-95"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <>
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

          {!isMobile && <span className="mx-1 h-6 w-px shrink-0 bg-border" />}

          <div className="flex shrink-0 items-center gap-1">
            {SHORTCUTS.map(({ id, label, Icon, run }) => (
              <button
                key={id}
                type="button"
                title={label}
                aria-label={label}
                onClick={run}
                className="flex size-10 items-center justify-center rounded-2xl text-foreground/80 transition hover:bg-foreground/5 active:scale-95"
              >
                <Icon className="size-[18px]" />
              </button>
            ))}
          </div>

          {editing && (

            <>
              {!isMobile && <span className="mx-1 h-6 w-px shrink-0 bg-border" />}


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
      )}


      <div className="fixed right-5 bottom-5 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing(!editing)}
          aria-pressed={editing}
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
          className="flex size-14 items-center justify-center rounded-full bg-music text-music-foreground shadow-[0_8px_24px_color-mix(in_oklab,var(--music)_40%,transparent)] ring-1 ring-[oklch(1_0_0/0.25)] transition hover:scale-105 active:scale-95"
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
