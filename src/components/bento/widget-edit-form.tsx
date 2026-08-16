import { useProfileStore } from "@/components/bento/profile-store";
import { PLATFORM_META } from "@/components/bento/social-icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AVATAR_PRESETS } from "@/data/shakespeare";
import type { SocialPlatform, Widget } from "@/lib/bento-types";

export function WidgetEditForm({ widget }: { widget: Widget }) {
  const { dispatch } = useProfileStore();
  const patch = (p: Partial<Widget>) => dispatch({ type: "update", id: widget.id, patch: p });

  return (
    <div className="space-y-4">
      {widget.type === "link" && (
        <>
          <Field label="Title">
            <Input value={widget.title} onChange={(e) => patch({ title: e.target.value } as Partial<Widget>)} />
          </Field>
          <Field label="URL">
            <Input value={widget.url} onChange={(e) => patch({ url: e.target.value } as Partial<Widget>)} />
          </Field>
          <Field label="Description">
            <Input
              value={widget.description ?? ""}
              onChange={(e) => patch({ description: e.target.value } as Partial<Widget>)}
            />
          </Field>
        </>
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
                      widget.platform === p ? "border-transparent bg-music text-music-foreground" : "border-border"
                    }`}
                  >
                    <meta.Icon className="size-3.5" />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Handle">
            <Input value={widget.handle} onChange={(e) => patch({ handle: e.target.value } as Partial<Widget>)} />
          </Field>
          <Field label="URL">
            <Input value={widget.url} onChange={(e) => patch({ url: e.target.value } as Partial<Widget>)} />
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
                    widget.src === src ? "ring-foreground" : "ring-transparent hover:ring-border"
                  }`}
                >
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          </Field>
          <Field label="Caption">
            <Input value={widget.caption ?? ""} onChange={(e) => patch({ caption: e.target.value } as Partial<Widget>)} />
          </Field>
        </>
      )}

      {widget.type === "text" && (
        <>
          <Field label="Note">
            <Textarea value={widget.body} rows={4} onChange={(e) => patch({ body: e.target.value } as Partial<Widget>)} />
          </Field>
          <Field label="Attribution">
            <Input
              value={widget.attribution ?? ""}
              onChange={(e) => patch({ attribution: e.target.value } as Partial<Widget>)}
            />
          </Field>
        </>
      )}

      {widget.type === "map" && (
        <Field label="Place">
          <Input value={widget.place} onChange={(e) => patch({ place: e.target.value } as Partial<Widget>)} />
        </Field>
      )}

      {widget.type === "section" && (
        <Field label="Section title">
          <Input value={widget.title} onChange={(e) => patch({ title: e.target.value } as Partial<Widget>)} />
        </Field>
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
