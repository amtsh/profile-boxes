import { MapPin } from "lucide-react";
import { useState } from "react";

import { useProfileStore } from "@/components/bento/profile-store";
import { PLATFORM_META } from "@/components/bento/social-icons";
import { AVATAR_PRESETS } from "@/data/shakespeare";
import { useIsMobile } from "@/hooks/use-mobile";

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

function AvatarPresets() {
  const { state, dispatch } = useProfileStore();
  return (
    <div className="mt-3 flex gap-2">
      {AVATAR_PRESETS.map((src) => (
        <button
          key={src}
          type="button"
          onClick={() => dispatch({ type: "profile", patch: { avatar: src } })}
          aria-label="Use this avatar"
          className={`size-8 overflow-hidden rounded-full ring-2 transition ${
            state.profile.avatar === src ? "ring-foreground" : "ring-transparent hover:ring-border"
          }`}
        >
          <img src={src} alt="" className="size-full object-cover" />
        </button>
      ))}
    </div>
  );
}

function Socials() {
  const { state } = useProfileStore();
  return (
    <div className="no-scrollbar -mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pt-1">
      {state.profile.socials.map((s) => {
        const meta = PLATFORM_META[s.platform];
        return (
          <a
            key={s.platform}
            href={s.url}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={meta.label}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-card-foreground shadow-[var(--tile-shadow)] transition hover:-translate-y-0.5 hover:shadow-[var(--tile-shadow-hover)] focus-visible:ring-2 focus-visible:ring-foreground focus-visible:outline-none"
          >
            <meta.Icon className="size-4" />
          </a>
        );
      })}
    </div>
  );
}

export function ProfileRail() {
  const { state, dispatch, editing, preview } = useProfileStore();
  const isMobile = useIsMobile();
  const [bioOpen, setBioOpen] = useState(false);
  const { profile } = state;
  const compact = preview === "mobile" || isMobile;

  if (compact) {
    const longBio = profile.bio.length > 110;
    return (
      <aside className="w-full">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <img
              src={profile.avatar}
              alt={profile.name}
              width={80}
              height={80}
              className="size-20 rounded-full object-cover shadow-[var(--tile-shadow)]"
            />
            {editing && <AvatarPresets />}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <Editable
              as="h1"
              editing={editing}
              value={profile.name}
              onChange={(v) => dispatch({ type: "profile", patch: { name: v } })}
              className="font-display text-2xl leading-tight font-bold tracking-tight"
            />
            <Editable
              editing={editing}
              value={profile.headline}
              onChange={(v) => dispatch({ type: "profile", patch: { headline: v } })}
              className="text-sm font-medium text-muted-foreground"
            />
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              {profile.location}
            </p>
          </div>
        </div>

        <div className="mt-3">
          {editing ? (
            <Editable
              editing
              multiline
              value={profile.bio}
              onChange={(v) => dispatch({ type: "profile", patch: { bio: v } })}
              className="text-sm leading-relaxed text-muted-foreground"
            />
          ) : (
            <p
              className={`text-sm leading-relaxed text-muted-foreground ${bioOpen ? "" : "line-clamp-2"}`}
            >
              {profile.bio}
            </p>
          )}
          {!editing && longBio && (
            <button
              type="button"
              onClick={() => setBioOpen((v) => !v)}
              className="mt-1 text-sm font-semibold text-foreground underline-offset-4 hover:underline"
            >
              {bioOpen ? "less" : "more"}
            </button>
          )}
        </div>

        <div className="mt-3">
          <Socials />
        </div>
      </aside>
    );
  }

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
          {editing && <AvatarPresets />}
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

        <Socials />
      </div>
    </aside>
  );
}
