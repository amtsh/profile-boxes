import {
  AtSign,
  Check,
  Image as ImageIcon,
  LayoutTemplate,
  Link2,
  MapPin,
  Monitor,
  MoreHorizontal,
  Pencil,
  Quote,
  Redo2,
  RotateCcw,
  Smartphone,
  Undo2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useProfileStore } from "@/components/bento/profile-store";
import { PLATFORM_META } from "@/components/bento/social-icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { THEME_OPTIONS, type SocialPlatform, type Widget } from "@/lib/bento-types";
import { createWidget, fileToTileDataUrl, newWidgetId, socialUrl, widgetFromUrl } from "@/lib/create-widget";
import { unfurlLink } from "@/lib/enrich";

export function EditorToolbar() {
  const {
    state,
    dispatch,
    editing,
    setEditing,
    preview,
    setPreview,
    setSelectedId,
    setFocusWidgetId,
    undo,
    redo,
    canUndo,
    canRedo,
    linkNonce,
  } = useProfileStore();
  const [mode, setMode] = useState<"default" | "link">("default");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState("");
  const [busy, setBusy] = useState(false);
  const [colorsOpen, setColorsOpen] = useState(false);
  const [socialsOpen, setSocialsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const activeTheme = THEME_OPTIONS.find((t) => t.id === state.theme) ?? THEME_OPTIONS[0]!;

  useEffect(() => {
    if (linkNonce > 0) setMode("link");
  }, [linkNonce]);

  function place(widget: Widget, message: string, focus = false) {
    dispatch({ type: "add", widget });
    setSelectedId(widget.id);
    setFocusWidgetId(focus ? widget.id : null);
    setEditing(true);
    toast.success(message);
  }

  function closeLinkRow() {
    setMode("default");
    setLinkUrl("");
    setLinkError("");
  }

  async function submitLink() {
    const result = widgetFromUrl(linkUrl);
    if (!result) {
      setLinkError("Enter a valid link, e.g. example.com");
      return;
    }
    if (result.widget.type === "link") {
      setBusy(true);
      try {
        const meta = await unfurlLink(result.widget.url);
        place({ ...result.widget, ...meta }, `${meta.title} added`);
      } finally {
        setBusy(false);
      }
    } else {
      const needsHandle = result.widget.type === "social" && !result.widget.handle;
      place(result.widget, result.message, needsHandle);
    }
    closeLinkRow();
  }

  async function onPickImage(file: File | undefined) {
    if (!file) return;
    try {
      const src = await fileToTileDataUrl(file);
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
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add that image");
    }
  }

  function quickAdd(type: "text" | "section" | "map") {
    const { widget, message } = createWidget(type);
    place(widget, message, type !== "map");
  }

  function addSocial(platform: SocialPlatform) {
    const meta = PLATFORM_META[platform];
    place(
      {
        id: newWidgetId(),
        type: "social",
        size: "sm",
        platform,
        handle: "",
        url: socialUrl(platform, ""),
      },
      `${meta.label} added — type your handle`,
      true,
    );
    setSocialsOpen(false);
  }

  const SHORTCUTS = [
    { id: "link", label: "Add link", Icon: Link2, run: () => setMode("link") },
    { id: "image", label: "Add image", Icon: ImageIcon, run: () => fileRef.current?.click() },
    { id: "quote", label: "Add quote", Icon: Quote, run: () => quickAdd("text") },
    { id: "map", label: "Add map", Icon: MapPin, run: () => quickAdd("map") },
    { id: "section", label: "Add section", Icon: LayoutTemplate, run: () => quickAdd("section") },
  ] as const;

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 safe-bottom">
        <div className="glass-panel pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center gap-1 overflow-x-auto rounded-full p-1.5 no-scrollbar">
          <button
            type="button"
            onClick={() => setEditing(!editing)}
            aria-pressed={editing}
            aria-label={editing ? "Done editing" : "Edit"}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition ${
              editing
                ? "bg-music text-music-foreground shadow-sm ring-1 ring-[oklch(1_0_0/0.18)]"
                : "text-foreground/80 hover:bg-foreground/5"
            }`}
          >
            {editing ? <Check className="size-4" aria-hidden /> : <Pencil className="size-4" aria-hidden />}
            {editing ? "Done" : "Edit"}
          </button>

          {mode === "link" ? (
            <div className="flex min-w-0 shrink-0 items-center gap-1">
              <span className="mx-1 h-6 w-px shrink-0 bg-border" />
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
                    if (e.key === "Enter") void submitLink();
                    if (e.key === "Escape") closeLinkRow();
                  }}
                  placeholder="Paste a link…"
                  inputMode="url"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={busy}
                  aria-label="Link URL"
                  className="w-56 max-w-[45vw] bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
                />
                {linkError && <span className="px-2 pb-1 text-xs text-destructive">{linkError}</span>}
              </div>
              <button
                type="button"
                onClick={() => void submitLink()}
                disabled={!linkUrl.trim() || busy}
                className="rounded-full bg-music px-4 py-2 text-sm font-semibold whitespace-nowrap text-music-foreground transition hover:brightness-105 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              >
                {busy ? "Adding…" : "Add"}
              </button>
              <button
                type="button"
                onClick={closeLinkRow}
                aria-label="Cancel adding link"
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-foreground/5 active:scale-95"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <>
              <span className="mx-1 h-6 w-px shrink-0 bg-border" />

              <div className="flex shrink-0 items-center gap-1">
                {SHORTCUTS.map(({ id, label, Icon, run }) => (
                  <button
                    key={id}
                    type="button"
                    title={label}
                    aria-label={label}
                    onClick={run}
                    className="flex size-10 items-center justify-center rounded-2xl text-foreground/80 transition-colors duration-200 hover:bg-foreground/5 active:scale-95"
                  >
                    <Icon className="size-[18px]" />
                  </button>
                ))}

                <Popover open={socialsOpen} onOpenChange={setSocialsOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      title="Add social"
                      aria-label="Add social"
                      aria-expanded={socialsOpen}
                      className="flex size-10 items-center justify-center rounded-2xl text-foreground/80 transition-colors duration-200 hover:bg-foreground/5 active:scale-95"
                    >
                      <AtSign className="size-[18px]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="center"
                    sideOffset={12}
                    className={`bento-theme-${state.theme} glass-panel w-auto rounded-2xl border-0 bg-background/80 p-3 text-foreground`}
                  >
                    <p className="px-1 pb-2 text-xs font-medium text-muted-foreground">Socials</p>
                    <div className="grid grid-cols-2 gap-1">
                      {(Object.keys(PLATFORM_META) as SocialPlatform[]).map((platform) => {
                        const meta = PLATFORM_META[platform];
                        return (
                          <button
                            key={platform}
                            type="button"
                            onClick={() => addSocial(platform)}
                            className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition hover:bg-foreground/5"
                          >
                            <span
                              className={`flex size-7 items-center justify-center rounded-full ${meta.tint}`}
                            >
                              <meta.Icon className="size-3.5" />
                            </span>
                            {meta.label}
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <span className="mx-1 h-6 w-px shrink-0 bg-border" />

              <Popover open={colorsOpen} onOpenChange={setColorsOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    title={`${activeTheme.label} theme`}
                    aria-label={`Theme: ${activeTheme.label}. Choose another color`}
                    aria-expanded={colorsOpen}
                    className="flex size-10 shrink-0 items-center justify-center rounded-2xl transition-colors duration-200 hover:bg-foreground/5 active:scale-95"
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

              <Popover open={moreOpen} onOpenChange={setMoreOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    title="More"
                    aria-label="More"
                    aria-expanded={moreOpen}
                    className="flex size-10 shrink-0 items-center justify-center rounded-2xl text-foreground/80 transition-colors duration-200 hover:bg-foreground/5 active:scale-95"
                  >
                    <MoreHorizontal className="size-[18px]" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={12}
                  className={`bento-theme-${state.theme} glass-panel w-56 rounded-2xl border-0 bg-background/80 p-2 text-foreground`}
                >
                  <div className="flex gap-1 p-1">
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
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition ${
                          preview === id
                            ? "bg-music text-music-foreground"
                            : "text-muted-foreground hover:bg-foreground/5"
                        }`}
                      >
                        <Icon className="size-3.5" /> {label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={!canUndo}
                    onClick={() => {
                      undo();
                      setMoreOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-foreground/5 disabled:opacity-40"
                  >
                    <Undo2 className="size-4" /> Undo
                  </button>
                  <button
                    type="button"
                    disabled={!canRedo}
                    onClick={() => {
                      redo();
                      setMoreOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-foreground/5 disabled:opacity-40"
                  >
                    <Redo2 className="size-4" /> Redo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch({ type: "reset" });
                      setMoreOpen(false);
                      toast.success("Reset to the demo profile");
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition hover:bg-foreground/5"
                  >
                    <RotateCcw className="size-4" /> Reset demo
                  </button>
                </PopoverContent>
              </Popover>
            </>
          )}
        </div>
      </div>

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
    </>
  );
}
