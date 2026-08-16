import {
  ArrowRight,
  Image as ImageIcon,
  Link2,
  MapPin,
  Quote,
  Type,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useProfileStore } from "@/components/bento/profile-store";
import { PLATFORM_META } from "@/components/bento/social-icons";
import { Input } from "@/components/ui/input";
import type { SocialPlatform, Widget } from "@/lib/bento-types";
import { createWidget, newWidgetId, widgetFromUrl, type QuickWidgetType } from "@/lib/create-widget";

const WIDGETS = [
  { id: "link", label: "Link", hint: "Any page on the web", Icon: Link2 },
  { id: "image", label: "Image", hint: "A photo or artwork tile", Icon: ImageIcon },
  { id: "text", label: "Note", hint: "A quote or short message", Icon: Quote },
  { id: "map", label: "Map", hint: "Show where you are", Icon: MapPin },
  { id: "section", label: "Section", hint: "A title to group tiles", Icon: Type },
] as const;

export function AddWidgetPanel({ onDone }: { onDone: () => void }) {
  const { dispatch, setSelectedId } = useProfileStore();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  function add(widget: Widget, message: string) {
    dispatch({ type: "add", widget });
    setSelectedId(widget.id);
    toast.success(message);
    onDone();
  }

  function submitUrl() {
    const value = url.trim();
    if (!value || busy) return;
    const result = widgetFromUrl(value);
    if (!result) {
      toast.error("That doesn't look like a valid link");
      return;
    }

    setBusy(true);
    // Small delay so the flow reads like Bento's "fetching preview" step.
    window.setTimeout(() => {
      setBusy(false);
      add(result.widget, result.message);
      setUrl("");
    }, 420);
  }

  function addSocial(platform: SocialPlatform) {
    const meta = PLATFORM_META[platform];
    add(
      {
        id: newWidgetId(),
        type: "social",
        size: "sm",
        platform,
        handle: meta.label,
        url: `https://${platform === "x" ? "x.com" : `${platform}.com`}`,
      },
      `${meta.label} added — tap the tile to set your handle`,
    );
  }

  function addWidget(type: QuickWidgetType) {
    const { widget, message } = createWidget(type);
    add(widget, message);
  }


  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="relative">
          <Input
            value={url}
            placeholder="Paste a link or @handle…"
            aria-label="Paste a link"
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitUrl()}
            className="glass-chip h-13 rounded-2xl border-0 pr-13 pl-4 text-base focus-visible:ring-2 focus-visible:ring-music/40"
          />
          <button
            type="button"
            onClick={submitUrl}
            disabled={!url.trim() || busy}
            aria-label="Add link"
            className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-music text-music-foreground transition hover:brightness-105 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          We'll pick the right tile for you — social links become social tiles.
        </p>
      </div>

      <div className="space-y-2.5">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Socials</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PLATFORM_META) as SocialPlatform[]).map((p) => {
            const meta = PLATFORM_META[p];
            return (
              <button
                key={p}
                type="button"
                onClick={() => addSocial(p)}
                className="glass-chip flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition hover:-translate-y-0.5 hover:brightness-105"
              >
                <span className={`flex size-6 items-center justify-center rounded-full ${meta.tint}`}>
                  <meta.Icon className="size-3.5" />
                </span>
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Widgets</p>
        <div className="space-y-1.5">
          {WIDGETS.map(({ id: type, label, hint, Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => addWidget(type)}
              className="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-left transition hover:border-[var(--glass-border)] hover:bg-[var(--glass-bg)]"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-muted">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{label}</span>
                <span className="block truncate text-xs text-muted-foreground">{hint}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-60" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
