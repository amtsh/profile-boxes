import { ArrowUpRight, MapPin, Quote } from "lucide-react";

import { InlineText } from "@/components/bento/inline-text";
import { useProfileStore } from "@/components/bento/profile-store";
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
  const { dispatch } = useProfileStore();
  const patch = (p: Partial<Widget>) =>
    dispatch({ type: "update", id: widget.id, patch: p as Partial<Widget> });

  switch (widget.type) {
    case "section":
      return (
        <div className="flex h-full items-end px-1 pb-2">
          <h2 className="font-display text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            <InlineText
              editing={editing}
              value={widget.title}
              placeholder="Section title"
              ariaLabel="Section title"
              onCommit={(title) => patch({ title } as Partial<Widget>)}
            />
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
            <p className="truncate text-xs text-muted-foreground">
              <InlineText
                editing={editing}
                value={widget.handle}
                placeholder="@handle"
                ariaLabel="Handle"
                onCommit={(handle) => patch({ handle } as Partial<Widget>)}
              />
            </p>
          </div>
          {!isSmall && (
            <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium">
              Follow <ArrowUpRight className="size-3" aria-hidden />
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
                decoding="async"
                draggable={false}
                onError={(e) => {
                  e.currentTarget.style.visibility = "hidden";
                }}
                className="size-10 rounded-xl bg-muted object-contain p-1.5"
              />
            ) : (
              <div className="size-10 rounded-xl bg-muted" />
            )}
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground/60" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold">
              <InlineText
                editing={editing}
                value={widget.title}
                placeholder="Title"
                ariaLabel="Link title"
                onCommit={(title) => patch({ title } as Partial<Widget>)}
              />
            </p>
            {(editing || widget.description) && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                <InlineText
                  editing={editing}
                  value={widget.description ?? ""}
                  placeholder="Add a description"
                  ariaLabel="Link description"
                  onCommit={(description) => patch({ description } as Partial<Widget>)}
                />
              </p>
            )}
            <p className="mt-1 truncate text-[11px] tracking-wide text-muted-foreground/70">
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
            decoding="async"
            draggable={false}
            className="size-full object-cover"
          />
          {(editing || widget.caption) && (
            <div
              className={`glass-chip absolute inset-x-3 bottom-3 flex items-center rounded-full px-3 py-1.5 ${
                editing ? "" : "pointer-events-none"
              }`}
            >
              <p className="truncate font-display text-xs font-medium text-card-foreground">
                <InlineText
                  editing={editing}
                  value={widget.caption ?? ""}
                  placeholder="Add a caption"
                  ariaLabel="Image caption"
                  onCommit={(caption) => patch({ caption } as Partial<Widget>)}
                />
              </p>
            </div>
          )}
        </div>
      );

    case "text":
      return (
        <div className="tile-surface tile-hover flex h-full flex-col justify-between gap-3 overflow-hidden p-5">
          <Quote className="size-5 shrink-0 text-muted-foreground/50" aria-hidden />
          <p className="font-display text-base leading-snug font-medium text-balance">
            <InlineText
              editing={editing}
              value={widget.body}
              multiline
              placeholder="Write a note"
              ariaLabel="Note"
              onCommit={(body) => patch({ body } as Partial<Widget>)}
            />
          </p>
          {(editing || widget.attribution) && (
            <p className="text-xs text-muted-foreground">
              <InlineText
                editing={editing}
                value={widget.attribution ?? ""}
                placeholder="Attribution"
                ariaLabel="Attribution"
                onCommit={(attribution) => patch({ attribution } as Partial<Widget>)}
              />
            </p>
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
            decoding="async"
            draggable={false}
            className="size-full object-cover"
          />
          <div className="glass-chip absolute inset-x-3 bottom-3 flex items-center gap-1.5 rounded-full px-3 py-1.5">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate text-xs font-medium">
              <InlineText
                editing={editing}
                value={widget.place}
                placeholder="Place"
                ariaLabel="Place"
                onCommit={(place) => patch({ place } as Partial<Widget>)}
              />
            </span>
          </div>
        </div>
      );
  }
}
