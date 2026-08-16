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
import { AVATAR_PRESETS } from "@/data/shakespeare";
import type { SocialPlatform, Widget } from "@/lib/bento-types";

const WIDGETS = [
  { id: "link", label: "Link", hint: "Any page on the web", Icon: Link2 },
  { id: "image", label: "Image", hint: "A photo or artwork tile", Icon: ImageIcon },
  { id: "text", label: "Note", hint: "A quote or short message", Icon: Quote },
  { id: "map", label: "Map", hint: "Show where you are", Icon: MapPin },
  { id: "section", label: "Section", hint: "A title to group tiles", Icon: Type },
] as const;

const PLATFORM_HOSTS: { match: RegExp; platform: SocialPlatform }[] = [
  { match: /(^|\.)(x|twitter)\.com$/, platform: "x" },
  { match: /(^|\.)github\.com$/, platform: "github" },
  { match: /(^|\.)instagram\.com$/, platform: "instagram" },
  { match: /(^|\.)(youtube\.com|youtu\.be)$/, platform: "youtube" },
  { match: /(^|\.)(open\.)?spotify\.com$/, platform: "spotify" },
  { match: /(^|\.)substack\.com$/, platform: "substack" },
];

const newId = () => `w-${Math.random().toString(36).slice(2, 9)}`;

export function AddWidgetPanel({ onDone }: { onDone: () => void }) {
  const { dispatch, setSelectedId } = useProfileStore();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function add(widget: Widget, message: string) {
    dispatch({ type: "add", widget });
    setSelectedId(widget.id);
    toast.success(message);
    onDone();
  }

  function submitUrl() {
    const value = url.trim();
    if (!value || busy) return;
    const normalized = /^https?:\/\//.test(value) ? value : `https://${value}`;
    let host: string;
    try {
      host = new URL(normalized).hostname.replace(/^www\./, "");
    } catch {
      toast.error("That doesn't look like a valid link");
      return;
    }

    setBusy(true);
    // Small delay so the flow reads like Bento's "fetching preview" step.
    window.setTimeout(() => {
      setBusy(false);
      const social = PLATFORM_HOSTS.find((p) => p.match.test(host));
      if (social) {
        const meta = PLATFORM_META[social.platform];
        const handle = new URL(normalized).pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
        add(
          {
            id: newId(),
            type: "social",
            size: "sm",
            platform: social.platform,
            handle: handle ? `@${handle}` : meta.label,
            url: normalized,
          },
          `${meta.label} added to your bento`,
        );
      } else {
        const name = host.split(".")[0] ?? host;
        add(
          {
            id: newId(),
            type: "link",
            size: "wide",
            title: name.charAt(0).toUpperCase() + name.slice(1),
            url: normalized,
            description: host,
          },
          "Link added to your bento",
        );
      }
      setUrl("");
    }, 420);
  }

  function addSocial(platform: SocialPlatform) {
    const meta = PLATFORM_META[platform];
    add(
      {
        id: newId(),
        type: "social",
        size: "sm",
        platform,
        handle: meta.label,
        url: `https://${platform === "x" ? "x.com" : `${platform}.com`}`,
      },
      `${meta.label} added — tap the tile to set your handle`,
    );
  }

  function addWidget(type: (typeof WIDGETS)[number]["id"]) {
    switch (type) {
      case "link":
        return add(
          { id: newId(), type: "link", size: "wide", title: "New link", url: "https://example.com", description: "Add a description" },
          "Link tile added",
        );
      case "image":
        return add(
          { id: newId(), type: "image", size: "lg", src: AVATAR_PRESETS[1]!, alt: "New image", caption: "" },
          "Image tile added",
        );
      case "text":
        return add(
          { id: newId(), type: "text", size: "wide", body: "All the world's a stage.", attribution: "As You Like It" },
          "Note added",
        );
      case "map":
        return add({ id: newId(), type: "map", size: "sm", src: AVATAR_PRESETS[3]!, place: "London" }, "Map tile added");
      case "section":
        return add({ id: newId(), type: "section", size: "wide", title: "New section" }, "Section added");
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="relative">
          <Input
            ref={inputRef}
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
            className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-music text-music-foreground transition disabled:opacity-30"
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
