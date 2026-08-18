import { ArrowUpRight, ImagePlus, MapPin, Quote } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { InlineText } from "@/components/bento/inline-text";
import { useProfileStore } from "@/components/bento/profile-store";
import { PLATFORM_META } from "@/components/bento/social-icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { SocialPlatform, Widget } from "@/lib/bento-types";
import { fileToTileDataUrl, socialUrl } from "@/lib/create-widget";
import { geocodePlace, mapEmbedUrl, mapImageUrl } from "@/lib/enrich";

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
  const { dispatch, focusWidgetId, setFocusWidgetId } = useProfileStore();
  const focused = focusWidgetId === widget.id;
  const patch = (p: Partial<Widget>) =>
    dispatch({ type: "update", id: widget.id, patch: p as Partial<Widget> });

  switch (widget.type) {
    case "section":
      return (
        <div className="flex h-full items-end px-1 pb-2">
          <h2 className="text-sm font-semibold">
            <InlineText
              editing={editing}
              value={widget.title}
              placeholder="Section title"
              ariaLabel="Section title"
              autoFocus={focused}
              onCommit={(title) => {
                patch({ title } as Partial<Widget>);
                setFocusWidgetId(null);
              }}
            />
          </h2>
        </div>
      );

    case "social": {
      const meta = PLATFORM_META[widget.platform];
      const isSmall = widget.size === "sm";
      return (
        <div className="tile-surface tile-hover flex h-full flex-col justify-between overflow-hidden p-4">
          <PlatformPicker
            editing={editing}
            platform={widget.platform}
            onPick={(platform) =>
              patch({
                platform,
                url: socialUrl(platform, widget.handle),
              } as Partial<Widget>)
            }
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{meta.label}</p>
            <p className="truncate text-xs text-muted-foreground">
              <InlineText
                editing={editing}
                value={widget.handle}
                placeholder="@handle"
                ariaLabel="Handle"
                autoFocus={focused}
                onCommit={(handle) => {
                  const next = handle.startsWith("@") || !handle ? handle : `@${handle}`;
                  patch({ handle: next, url: socialUrl(widget.platform, next) } as Partial<Widget>);
                  setFocusWidgetId(null);
                }}
              />
            </p>
          </div>
          {!isSmall && (
            <span className="mt-2 inline-flex w-fit items-center justify-center rounded-lg bg-music px-4 py-1.5 text-xs font-semibold text-music-foreground">
              Follow
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
            <p className="truncate text-sm font-semibold">
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
            {editing ? (
              <p className="mt-1 truncate text-[11px] tracking-wide text-muted-foreground/70">
                <InlineText
                  editing
                  value={widget.url}
                  placeholder="https://"
                  ariaLabel="Link URL"
                  autoFocus={focused}
                  onCommit={(url) => {
                    const normalized = /^https?:\/\//.test(url) ? url : `https://${url}`;
                    patch({ url: normalized } as Partial<Widget>);
                    setFocusWidgetId(null);
                  }}
                />
              </p>
            ) : (
              <p className="mt-1 truncate text-[11px] tracking-wide text-muted-foreground/70">
                {hostFor(widget.url)}
              </p>
            )}
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
          {editing && <ReplaceImageButton onReplace={(src, alt) => patch({ src, alt } as Partial<Widget>)} />}
          {(editing || widget.caption) && (
            <div
              className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pt-8 pb-2.5 ${
                editing ? "" : "pointer-events-none"
              }`}
            >
              <p className="truncate text-xs font-semibold text-white">
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
          <p className="text-[15px] leading-snug">
            <InlineText
              editing={editing}
              value={widget.body}
              multiline
              placeholder="Write a note"
              ariaLabel="Note"
              autoFocus={focused}
              onCommit={(body) => {
                patch({ body } as Partial<Widget>);
                setFocusWidgetId(null);
              }}
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
        <MapTile
          widget={widget}
          editing={editing}
          focused={focused}
          onPatch={patch}
          onFocused={() => setFocusWidgetId(null)}
        />
      );
  }
}

function PlatformPicker({
  editing,
  platform,
  onPick,
}: {
  editing: boolean;
  platform: SocialPlatform;
  onPick: (p: SocialPlatform) => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = PLATFORM_META[platform];
  const icon = (
    <div className={`flex size-10 items-center justify-center rounded-xl ${meta.tint}`}>
      <meta.Icon className="size-5" />
    </div>
  );

  if (!editing) return icon;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Change platform"
          aria-label="Change platform"
          className="w-fit rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-music"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {icon}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="glass-panel w-auto rounded-xl p-2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap gap-1">
          {(Object.keys(PLATFORM_META) as SocialPlatform[]).map((p) => {
            const item = PLATFORM_META[p];
            return (
              <button
                key={p}
                type="button"
                title={item.label}
                aria-label={item.label}
                onClick={() => {
                  onPick(p);
                  setOpen(false);
                }}
                className={`flex size-9 items-center justify-center rounded-xl transition ${
                  p === platform ? "ring-2 ring-music" : "hover:bg-foreground/5"
                } ${item.tint}`}
              >
                <item.Icon className="size-4" />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ReplaceImageButton({ onReplace }: { onReplace: (src: string, alt: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          ref.current?.click();
        }}
        className="glass-chip absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
      >
        <ImagePlus className="size-3.5" aria-hidden />
        Replace
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          void fileToTileDataUrl(file)
            .then((src) => onReplace(src, file.name.replace(/\.[^.]+$/, "")))
            .catch((err) => toast.error(err instanceof Error ? err.message : "Could not use that image"));
        }}
      />
    </>
  );
}

function MapTile({
  widget,
  editing,
  focused,
  onPatch,
  onFocused,
}: {
  widget: Extract<Widget, { type: "map" }>;
  editing: boolean;
  focused: boolean;
  onPatch: (p: Partial<Widget>) => void;
  onFocused: () => void;
}) {
  const hasCoords = Number.isFinite(widget.lat) && Number.isFinite(widget.lon);

  async function commitPlace(place: string) {
    onFocused();
    const hit = await geocodePlace(place);
    if (!hit) {
      onPatch({ place } as Partial<Widget>);
      toast.error("Couldn't find that place");
      return;
    }
    onPatch({
      place,
      lat: hit.lat,
      lon: hit.lon,
      src: mapImageUrl(hit.lat, hit.lon),
    } as Partial<Widget>);
  }

  return (
    <div className="tile-surface tile-hover relative h-full overflow-hidden">
      {hasCoords ? (
        <iframe
          title={`Map of ${widget.place}`}
          src={mapEmbedUrl(widget.lat!, widget.lon!)}
          className="pointer-events-none size-full border-0"
          loading="lazy"
        />
      ) : (
        <img
          src={widget.src}
          alt={`Map of ${widget.place}`}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="size-full object-cover"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-1.5 bg-gradient-to-t from-black/60 to-transparent px-3 pt-8 pb-2.5">
        <MapPin className="size-3.5 shrink-0 text-white" aria-hidden />
        <span className="truncate text-xs font-semibold text-white">
          <InlineText
            editing={editing}
            value={widget.place}
            placeholder="Place"
            ariaLabel="Place"
            autoFocus={focused}
            onCommit={(place) => void commitPlace(place)}
          />
        </span>
      </div>
    </div>
  );
}
