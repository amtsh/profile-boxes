import { Camera, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useProfileStore } from "@/components/bento/profile-store";
import { SocialRail } from "@/components/bento/social-rail";
import { AVATAR_PRESETS } from "@/data/shakespeare";
import { useIsMobile } from "@/hooks/use-mobile";
import { fileToTileDataUrl } from "@/lib/create-widget";

function Editable({
  value,
  onCommit,
  editing,
  className,
  as = "p",
  multiline,
}: {
  value: string;
  onCommit: (v: string) => void;
  editing: boolean;
  className?: string;
  as?: "h1" | "p";
  multiline?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  if (editing) {
    if (multiline) {
      return (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            const next = draft.trim();
            if (next !== value) onCommit(next);
          }}
          rows={4}
          className={`glass-chip w-full resize-none rounded-lg p-2 outline-none focus:ring-2 focus:ring-music/40 focus:ring-offset-0 ${className ?? ""}`}
        />
      );
    }
    return (
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const next = draft.trim();
          if (next !== value) onCommit(next);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className={`glass-chip w-full rounded-lg p-2 outline-none focus:ring-2 focus:ring-music/40 focus:ring-offset-0 ${className ?? ""}`}
      />
    );
  }
  const Tag = as;
  return <Tag className={className}>{value}</Tag>;
}

function AvatarPhoto({ src, alt, className }: { src: string; alt: string; className: string }) {
  return (
    <div className={`ig-story-ring ${className}`}>
      <img
        src={src}
        alt={alt}
        width={128}
        height={128}
        draggable={false}
        className="size-full rounded-full bg-background object-cover ring-2 ring-background"
      />
    </div>
  );
}

function AvatarEditor() {
  const { state, dispatch } = useProfileStore();
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPick(file: File | undefined) {
    if (!file) return;
    try {
      const src = await fileToTileDataUrl(file);
      dispatch({ type: "profile", patch: { avatar: src } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not use that photo");
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="glass-chip flex size-8 items-center justify-center rounded-full transition hover:brightness-105"
        aria-label="Upload avatar"
        title="Upload photo"
      >
        <Camera className="size-3.5" aria-hidden />
      </button>
      {AVATAR_PRESETS.map((src) => (
        <button
          key={src}
          type="button"
          onClick={() => dispatch({ type: "profile", patch: { avatar: src } })}
          aria-label="Use this avatar"
          className={`size-8 overflow-hidden rounded-full ring-2 transition ${
            state.profile.avatar === src ? "ring-music" : "ring-transparent hover:ring-border"
          }`}
        >
          <img src={src} alt="" className="size-full object-cover" draggable={false} />
        </button>
      ))}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void onPick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
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
            <AvatarPhoto src={profile.avatar} alt={profile.name} className="size-20" />
            {editing && <AvatarEditor />}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <Editable
              as="h1"
              editing={editing}
              value={profile.name}
              onCommit={(v) => dispatch({ type: "profile", patch: { name: v } })}
              className="text-xl leading-tight font-semibold"
            />
            <Editable
              editing={editing}
              value={profile.headline}
              onCommit={(v) => dispatch({ type: "profile", patch: { headline: v } })}
              className="text-sm font-semibold"
            />
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              <Editable
                editing={editing}
                value={profile.location}
                onCommit={(v) => dispatch({ type: "profile", patch: { location: v } })}
                className="min-w-0 flex-1 text-xs text-muted-foreground"
              />
            </p>
          </div>
        </div>

        <div className="mt-3">
          {editing ? (
            <Editable
              editing
              multiline
              value={profile.bio}
              onCommit={(v) => dispatch({ type: "profile", patch: { bio: v } })}
              className="text-sm leading-snug"
            />
          ) : (
            <p className={`text-sm leading-snug ${bioOpen ? "" : "line-clamp-2"}`}>{profile.bio}</p>
          )}
          {!editing && longBio && (
            <button
              type="button"
              onClick={() => setBioOpen((v) => !v)}
              className="mt-1 text-sm font-semibold text-music"
            >
              {bioOpen ? "less" : "more"}
            </button>
          )}
        </div>

        <div className="mt-4">
          <SocialRail />
        </div>
      </aside>
    );
  }

  return (
    <aside className="lg:sticky lg:top-12 lg:h-fit lg:w-[320px] lg:shrink-0">
      <div className="flex flex-col items-start gap-4">
        <div className="relative">
          <AvatarPhoto src={profile.avatar} alt={profile.name} className="size-24 md:size-32" />
          {editing && <AvatarEditor />}
        </div>

        <div className="w-full space-y-2">
          <Editable
            as="h1"
            editing={editing}
            value={profile.name}
            onCommit={(v) => dispatch({ type: "profile", patch: { name: v } })}
            className="text-2xl leading-tight font-semibold md:text-3xl"
          />
          <Editable
            editing={editing}
            value={profile.headline}
            onCommit={(v) => dispatch({ type: "profile", patch: { headline: v } })}
            className="text-sm font-semibold"
          />
          <Editable
            editing={editing}
            multiline
            value={profile.bio}
            onCommit={(v) => dispatch({ type: "profile", patch: { bio: v } })}
            className="text-sm leading-snug"
          />
          <p className="flex items-center gap-1.5 pt-1 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden />
            <Editable
              editing={editing}
              value={profile.location}
              onCommit={(v) => dispatch({ type: "profile", patch: { location: v } })}
              className="min-w-0 flex-1 text-sm text-muted-foreground"
            />
          </p>
        </div>

        <SocialRail />
      </div>
    </aside>
  );
}
