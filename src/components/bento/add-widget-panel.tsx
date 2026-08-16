import { Image as ImageIcon, Link2, MapPin, Quote, Type, AtSign } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useProfileStore } from "@/components/bento/profile-store";
import { PLATFORM_META } from "@/components/bento/social-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AVATAR_PRESETS } from "@/data/shakespeare";
import type { SocialPlatform, Widget } from "@/lib/bento-types";

const TYPES = [
  { id: "link", label: "Link", Icon: Link2 },
  { id: "social", label: "Social", Icon: AtSign },
  { id: "image", label: "Image", Icon: ImageIcon },
  { id: "text", label: "Note", Icon: Quote },
  { id: "map", label: "Map", Icon: MapPin },
  { id: "section", label: "Section", Icon: Type },
] as const;

const id = () => `w-${Math.random().toString(36).slice(2, 9)}`;

export function AddWidgetPanel({ onDone }: { onDone: () => void }) {
  const { dispatch } = useProfileStore();
  const [url, setUrl] = useState("");

  function add(widget: Widget) {
    dispatch({ type: "add", widget });
    toast.success("Widget added to the top of your grid");
    onDone();
  }

  function addFromUrl() {
    const value = url.trim();
    if (!value) return;
    const normalized = /^https?:\/\//.test(value) ? value : `https://${value}`;
    let host = normalized;
    try {
      host = new URL(normalized).hostname.replace(/^www\./, "");
    } catch {
      toast.error("That doesn't look like a valid URL");
      return;
    }
    const title = host.split(".")[0];
    add({
      id: id(),
      type: "link",
      size: "wide",
      title: title.charAt(0).toUpperCase() + title.slice(1),
      url: normalized,
      description: host,
    });
    setUrl("");
  }

  function addType(type: (typeof TYPES)[number]["id"]) {
    switch (type) {
      case "link":
        return add({ id: id(), type: "link", size: "wide", title: "New link", url: "https://example.com", description: "Add a description" });
      case "social": {
        const platform: SocialPlatform = "github";
        return add({ id: id(), type: "social", size: "sm", platform, handle: PLATFORM_META[platform].label, url: "https://github.com" });
      }
      case "image":
        return add({ id: id(), type: "image", size: "lg", src: AVATAR_PRESETS[1], alt: "New image", caption: "" });
      case "text":
        return add({ id: id(), type: "text", size: "wide", body: "All the world's a stage.", attribution: "As You Like It" });
      case "map":
        return add({ id: id(), type: "map", size: "sm", src: AVATAR_PRESETS[3], place: "London" });
      case "section":
        return add({ id: id(), type: "section", size: "wide", title: "New section" });
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="paste-url" className="text-sm font-medium">
          Paste a link
        </label>
        <div className="flex gap-2">
          <Input
            id="paste-url"
            value={url}
            placeholder="shakespearesglobe.com"
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFromUrl()}
          />
          <Button onClick={addFromUrl}>Add</Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Or pick a widget</p>
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map(({ id: type, label, Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => addType(type)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-xs font-medium transition hover:-translate-y-0.5 hover:shadow-[var(--tile-shadow-hover)]"
            >
              <Icon className="size-5" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
