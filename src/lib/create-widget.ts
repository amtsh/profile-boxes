import { PLATFORM_META } from "@/components/bento/social-icons";
import { AVATAR_PRESETS } from "@/data/shakespeare";
import type { SocialPlatform, Widget } from "@/lib/bento-types";
import { hostLabel, LONDON, mapImageUrl } from "@/lib/enrich";

const PLATFORM_HOSTS: { match: RegExp; platform: SocialPlatform }[] = [
  { match: /(^|\.)(x|twitter)\.com$/, platform: "x" },
  { match: /(^|\.)github\.com$/, platform: "github" },
  { match: /(^|\.)instagram\.com$/, platform: "instagram" },
  { match: /(^|\.)(youtube\.com|youtu\.be)$/, platform: "youtube" },
  { match: /(^|\.)(open\.)?spotify\.com$/, platform: "spotify" },
  { match: /(^|\.)substack\.com$/, platform: "substack" },
];

const PLATFORM_HOME: Record<SocialPlatform, string> = {
  x: "https://x.com",
  github: "https://github.com",
  instagram: "https://instagram.com",
  youtube: "https://youtube.com",
  spotify: "https://open.spotify.com",
  substack: "https://substack.com",
};

export const newWidgetId = () => `w-${Math.random().toString(36).slice(2, 9)}`;

export function socialUrl(platform: SocialPlatform, handle: string): string {
  const slug = handle.replace(/^@/, "").trim();
  const home = PLATFORM_HOME[platform];
  if (!slug) return home;
  if (platform === "youtube") return `${home}/@${slug}`;
  if (platform === "spotify") return `${home}/user/${slug}`;
  return `${home}/${slug}`;
}

export function detectSocialPlatform(value: string): SocialPlatform | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const host = new URL(normalized).hostname.replace(/^www\./, "");
    return PLATFORM_HOSTS.find((p) => p.match.test(host))?.platform ?? null;
  } catch {
    return null;
  }
}

/** Accepts a full URL or an @handle and returns a usable profile URL. */
export function normalizeSocialInput(platform: SocialPlatform, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return socialUrl(platform, "");
  if (/^https?:\/\//i.test(trimmed) || trimmed.includes(".")) {
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      new URL(normalized);
      return normalized;
    } catch {
      return socialUrl(platform, trimmed);
    }
  }
  return socialUrl(platform, trimmed);
}

/** Turns a pasted value into a social or link tile. Returns null when unparseable. */
export function widgetFromUrl(value: string): { widget: Widget; message: string } | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "");
  if (!host.includes(".")) return null;

  const social = PLATFORM_HOSTS.find((p) => p.match.test(host));
  if (social) {
    const meta = PLATFORM_META[social.platform];
    const handle = parsed.pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
    return {
      widget: {
        id: newWidgetId(),
        type: "social",
        size: "sm",
        platform: social.platform,
        handle: handle ? `@${handle.replace(/^@/, "")}` : "",
        url: normalized,
      },
      message: `${meta.label} added to your bento`,
    };
  }

  const { title, host: label } = hostLabel(normalized);
  return {
    widget: {
      id: newWidgetId(),
      type: "link",
      size: "wide",
      title,
      url: normalized,
      description: label,
    },
    message: "Link added to your bento",
  };
}

export type QuickWidgetType = "link" | "image" | "text" | "map" | "section";

/** Default tile for each widget type — shared by the add panel and the toolbar. */
export function createWidget(type: QuickWidgetType): { widget: Widget; message: string } {
  switch (type) {
    case "link":
      return {
        widget: {
          id: newWidgetId(),
          type: "link",
          size: "wide",
          title: "New link",
          url: "https://example.com",
          description: "Add a description",
        },
        message: "Link tile added",
      };
    case "image":
      return {
        widget: {
          id: newWidgetId(),
          type: "image",
          size: "lg",
          src: AVATAR_PRESETS[1]!,
          alt: "New image",
          caption: "",
        },
        message: "Image tile added",
      };
    case "text":
      return {
        widget: {
          id: newWidgetId(),
          type: "text",
          size: "wide",
          body: "",
          attribution: "",
        },
        message: "Note added",
      };
    case "map":
      return {
        widget: {
          id: newWidgetId(),
          type: "map",
          size: "sm",
          src: mapImageUrl(LONDON.lat, LONDON.lon),
          place: "London",
          lat: LONDON.lat,
          lon: LONDON.lon,
        },
        message: "Map tile added",
      };
    case "section":
      return {
        widget: { id: newWidgetId(), type: "section", size: "wide", title: "New section" },
        message: "Section added",
      };
  }
}

const MAX_DIM = 1200;
const MAX_BYTES = 1_400_000;

/** Reads a picked image file into a downscaled data URL suitable for localStorage. */
export function fileToTileDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.onload = () => {
      const src = String(reader.result);
      const img = new Image();
      img.onerror = () => reject(new Error("That file isn't a readable image"));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(src);
        ctx.drawImage(img, 0, 0, w, h);
        let out = canvas.toDataURL("image/jpeg", 0.82);
        if (out.length > MAX_BYTES) out = canvas.toDataURL("image/jpeg", 0.6);
        if (out.length > MAX_BYTES) {
          reject(new Error("That image is too large — try a smaller one"));
          return;
        }
        resolve(out);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
