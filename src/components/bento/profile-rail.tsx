import { MapPin } from "lucide-react";

import { useProfileStore } from "@/components/bento/profile-store";
import { PLATFORM_META } from "@/components/bento/social-icons";
import { AVATAR_PRESETS } from "@/data/shakespeare";

function Editable({
  value,
  onChange,
  editing,
  className,
  as = "p",
  multiline,
}: {
  value: string;
  onChange: (v: string) => void;
  editing: boolean;
  className?: string;
  as?: "h1" | "p";
  multiline?: boolean;
}) {
  if (editing) {
    if (multiline) {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className={`w-full resize-none rounded-xl border border-border bg-card p-2 outline-none focus:ring-2 focus:ring-foreground/15 ${className ?? ""}`}
        />
      );
    }
    return (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border border-border bg-card p-2 outline-none focus:ring-2 focus:ring-foreground/15 ${className ?? ""}`}
      />
    );
  }
  const Tag = as;
  return <Tag className={className}>{value}</Tag>;
}

export function ProfileRail() {
  const { state, dispatch, editing } = useProfileStore();
  const { profile } = state;

  return (
    <aside className="lg:sticky lg:top-12 lg:h-fit lg:w-[320px] lg:shrink-0">
      <div className="flex flex-col items-start gap-4">
        <div className="relative">
          <img
            src={profile.avatar}
            alt={profile.name}
            width={128}
            height={128}
            className="size-24 rounded-full object-cover shadow-[var(--tile-shadow)] md:size-32"
          />
          {editing && (
            <div className="mt-3 flex gap-2">
              {AVATAR_PRESETS.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => dispatch({ type: "profile", patch: { avatar: src } })}
                  aria-label="Use this avatar"
                  className={`size-8 overflow-hidden rounded-full ring-2 transition ${
                    profile.avatar === src ? "ring-foreground" : "ring-transparent hover:ring-border"
                  }`}
                >
                  <img src={src} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full space-y-2">
          <Editable
            as="h1"
            editing={editing}
            value={profile.name}
            onChange={(v) => dispatch({ type: "profile", patch: { name: v } })}
            className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl"
          />
          <Editable
            editing={editing}
            value={profile.headline}
            onChange={(v) => dispatch({ type: "profile", patch: { headline: v } })}
            className="text-base font-medium text-muted-foreground"
          />
          <Editable
            editing={editing}
            multiline
            value={profile.bio}
            onChange={(v) => dispatch({ type: "profile", patch: { bio: v } })}
            className="text-sm leading-relaxed text-muted-foreground"
          />
          <p className="flex items-center gap-1.5 pt-1 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {profile.location}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {profile.socials.map((s) => {
            const meta = PLATFORM_META[s.platform];
            return (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={meta.label}
                className="flex size-9 items-center justify-center rounded-full bg-card text-card-foreground shadow-[var(--tile-shadow)] transition hover:-translate-y-0.5 hover:shadow-[var(--tile-shadow-hover)]"
              >
                <meta.Icon className="size-4" />
              </a>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
