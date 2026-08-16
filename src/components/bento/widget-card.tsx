import { ArrowUpRight, MapPin, Quote } from "lucide-react";

import { PLATFORM_META } from "@/components/bento/social-icons";
import type { Widget } from "@/lib/bento-types";

function faviconFor(url: string) {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
  } catch {
    return "";
  }
}

function hostFor(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function WidgetCard({ widget, editing }: { widget: Widget; editing: boolean }) {
  switch (widget.type) {
    case "section":
      return (
        <div className="flex h-full items-end px-1 pb-2">
          <h2 className="font-display text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            {widget.title}
          </h2>
        </div>
      );

    case "social": {
      const meta = PLATFORM_META[widget.platform];
      const isSmall = widget.size === "sm";
      return (
        <div className="tile-surface tile-hover flex h-full flex-col justify-between overflow-hidden p-4">
          <div className={`flex size-10 items-center justify-center rounded-xl ${meta.tint}`}>
            <meta.Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold">{meta.label}</p>
            <p className="truncate text-xs text-muted-foreground">{widget.handle}</p>
          </div>
          {!isSmall && (
            <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium">
              Follow <ArrowUpRight className="size-3" />
            </span>
          )}
        </div>
      );
    }

    case "link": {
      const favicon = faviconFor(widget.url);
      return (
        <div className="tile-surface tile-hover group relative flex h-full flex-col justify-between overflow-hidden p-4">
          <div className="flex items-start justify-between gap-3">
            {favicon ? (
              <img
                src={favicon}
                alt=""
                width={40}
                height={40}
                loading="lazy"
                className="size-10 rounded-xl bg-muted object-contain p-1.5"
              />
            ) : (
              <div className="size-10 rounded-xl bg-muted" />
            )}
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold">{widget.title}</p>
            {widget.description && (
              <p className="line-clamp-2 text-xs text-muted-foreground">{widget.description}</p>
            )}
            <p className="mt-1 truncate text-[11px] text-muted-foreground/70">
              {hostFor(widget.url)}
            </p>
          </div>
        </div>
      );
    }

    case "image":
      return (
        <div className="tile-surface tile-hover group relative h-full overflow-hidden">
          <img
            src={widget.src}
            alt={widget.alt}
            loading="lazy"
            className={`size-full object-cover transition-transform duration-500 ${editing ? "" : "group-hover:scale-[1.04]"}`}
          />
          {widget.caption && (
            <div className="glass-chip pointer-events-none absolute inset-x-3 bottom-3 flex items-center rounded-full px-3 py-1.5">
              <p className="truncate font-display text-xs font-medium text-card-foreground">
                {widget.caption}
              </p>
            </div>
          )}
        </div>
      );

    case "text":
      return (
        <div className="tile-surface tile-hover flex h-full flex-col justify-between gap-3 overflow-hidden p-5">
          <Quote className="size-5 shrink-0 text-muted-foreground/50" />
          <p className="font-display text-base leading-snug font-medium text-balance">
            {widget.body}
          </p>
          {widget.attribution && (
            <p className="text-xs text-muted-foreground">{widget.attribution}</p>
          )}
        </div>
      );

    case "map":
      return (
        <div className="tile-surface tile-hover relative h-full overflow-hidden">
          <img
            src={widget.src}
            alt={`Map of ${widget.place}`}
            loading="lazy"
            className="size-full object-cover"
          />
          <div className="absolute inset-x-3 bottom-3 flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 backdrop-blur">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate text-xs font-medium">{widget.place}</span>
          </div>
        </div>
      );
  }
}
