import {
  Check,
  Image as ImageIcon,
  LayoutTemplate,
  Link2,
  Monitor,
  Plus,
  Pencil,
  Quote,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { THEME_OPTIONS, type Widget } from "@/lib/bento-types";
import { createWidget, fileToTileDataUrl, newWidgetId, widgetFromUrl } from "@/lib/create-widget";

export function EditorToolbar() {
  const { state, dispatch, editing, setEditing, preview, setPreview, setSelectedId } =
    useProfileStore();
  const [addOpen, setAddOpen] = useState(false);
  const [mode, setMode] = useState<"default" | "link">("default");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState("");
  const [colorsOpen, setColorsOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const panel = <AddWidgetPanel onDone={() => setAddOpen(false)} />;

  const showPill = !isMobile || editing;
  const activeTheme = THEME_OPTIONS.find((t) => t.id === state.theme) ?? THEME_OPTIONS[0]!;


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
                  aria-label={label}
                  title={label}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
                    preview === id
                      ? "bg-music text-music-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-foreground/5"
                  }`}
                >
                  <Icon className="size-4" /> {preview === id ? null : label}
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

          <span className="mx-1 h-6 w-px shrink-0 bg-border" />

          <Popover open={colorsOpen} onOpenChange={setColorsOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                title={`${activeTheme.label} theme`}
                aria-label={`Theme: ${activeTheme.label}. Choose another color`}
                className="flex size-10 shrink-0 items-center justify-center rounded-2xl transition hover:bg-foreground/5 active:scale-95"
              >
                <span
                  className="size-6 rounded-full border border-border shadow-inner ring-2 ring-music ring-offset-1 ring-offset-transparent"
                  style={{ background: activeTheme.swatch }}
                />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={12}
              className={`bento-theme-${state.theme} glass-panel w-auto rounded-2xl border-0 bg-background/80 p-3 text-foreground`}
            >
              <p className="px-1 pb-2 text-xs font-medium text-muted-foreground">Profile color</p>
              <div className="grid grid-cols-5 gap-2">
                {THEME_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    title={t.label}
                    aria-label={`${t.label} theme`}
                    aria-pressed={state.theme === t.id}
                    onClick={() => {
                      dispatch({ type: "theme", theme: t.id });
                      setColorsOpen(false);
                    }}
                    className={`size-8 rounded-full border border-border shadow-inner transition hover:scale-110 active:scale-95 ${
                      state.theme === t.id
                        ? "ring-2 ring-music ring-offset-2 ring-offset-transparent"
                        : ""
                    }`}
                    style={{ background: t.swatch }}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

            </>
          )}
        </div>

      </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void onPickImage(e.target.files?.[0]);
          e.target.value = "";
        }}
      />




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
