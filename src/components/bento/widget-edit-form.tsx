import { useProfileStore } from "@/components/bento/profile-store";
import { PLATFORM_META } from "@/components/bento/social-icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AVATAR_PRESETS } from "@/data/shakespeare";
import type { SocialPlatform, Widget } from "@/lib/bento-types";

/**
 * Only the fields that can't be edited inline on the tile live here:
 * URLs, the platform picker and the image source.
 */
export function WidgetEditForm({ widget }: { widget: Widget }) {
  const { dispatch } = useProfileStore();
  const patch = (p: Partial<Widget>) => dispatch({ type: "update", id: widget.id, patch: p });

  return (
    <div className="space-y-4">
      {widget.type === "link" && (
        <Field label="URL">
          <Input
            value={widget.url}
            onChange={(e) => patch({ url: e.target.value } as Partial<Widget>)}
          />
        </Field>
      )}

      {widget.type === "social" && (
        <>
          <Field label="Platform">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PLATFORM_META) as SocialPlatform[]).map((p) => {
                const meta = PLATFORM_META[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => patch({ platform: p } as Partial<Widget>)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      widget.platform === p
                        ? "border-transparent bg-music text-music-foreground"
                        : "border-border"
                    }`}
                  >
                    <meta.Icon className="size-3.5" />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="URL">
            <Input
              value={widget.url}
              onChange={(e) => patch({ url: e.target.value } as Partial<Widget>)}
            />
          </Field>
        </>
      )}

      {widget.type === "image" && (
        <>
          <Field label="Image">
            <div className="flex gap-2">
              {AVATAR_PRESETS.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => patch({ src } as Partial<Widget>)}
                  className={`size-14 overflow-hidden rounded-xl ring-2 transition ${
                    widget.src === src ? "ring-music" : "ring-transparent hover:ring-border"
                  }`}
                >
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          </Field>
          <Field label="Alt text">
            <Input
              value={widget.alt}
              onChange={(e) => patch({ alt: e.target.value } as Partial<Widget>)}
            />
          </Field>
        </>
      )}

      {widget.type === "map" && (
        <Field label="Map image">
          <div className="flex gap-2">
            {AVATAR_PRESETS.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => patch({ src } as Partial<Widget>)}
                className={`size-14 overflow-hidden rounded-xl ring-2 transition ${
                  widget.src === src ? "ring-music" : "ring-transparent hover:ring-border"
                }`}
              >
                <img src={src} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        </Field>
      )}

      {(widget.type === "text" || widget.type === "section") && (
        <p className="text-sm text-muted-foreground">
          This tile is fully editable in place — click its text on the page to change it.
        </p>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
