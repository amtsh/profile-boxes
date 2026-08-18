import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useProfileStore } from "@/components/bento/profile-store";
import { ALL_PLATFORMS, PLATFORM_META } from "@/components/bento/social-icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { SocialLink, SocialPlatform } from "@/lib/bento-types";
import { detectSocialPlatform, normalizeSocialInput, socialUrl } from "@/lib/create-widget";

const pillClass =
  "inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-3.5 py-1.5 text-sm font-medium text-foreground shadow-[var(--tile-shadow)] transition duration-200";

export function SocialRail() {
  const { state, dispatch, editing } = useProfileStore();
  const socials = state.profile.socials ?? [];
  const [openPlatform, setOpenPlatform] = useState<SocialPlatform | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  function commit(next: SocialLink[]) {
    dispatch({ type: "profile", patch: { socials: next } });
  }

  function updateUrl(platform: SocialPlatform, value: string) {
    const url = normalizeSocialInput(platform, value);
    commit(socials.map((s) => (s.platform === platform ? { ...s, url } : s)));
  }

  function remove(platform: SocialPlatform) {
    commit(socials.filter((s) => s.platform !== platform));
    if (openPlatform === platform) setOpenPlatform(null);
    toast("Social removed");
  }

  function add(platform: SocialPlatform, url?: string) {
    const nextUrl = url ?? socialUrl(platform, "");
    const existing = socials.find((s) => s.platform === platform);
    if (existing) {
      commit(socials.map((s) => (s.platform === platform ? { ...s, url: nextUrl } : s)));
    } else {
      commit([...socials, { platform, url: nextUrl }]);
    }
    setAddOpen(false);
    setOpenPlatform(url ? null : platform);
    toast.success(`${PLATFORM_META[platform].label} added`);
  }

  if (!editing && socials.length === 0) return null;

  const unused = ALL_PLATFORMS.filter((p) => !socials.some((s) => s.platform === p));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {socials.map((s) => (
        <SocialPill
          key={s.platform}
          link={s}
          editing={editing}
          open={openPlatform === s.platform}
          onOpenChange={(open) => setOpenPlatform(open ? s.platform : null)}
          onCommit={(value) => updateUrl(s.platform, value)}
          onRemove={() => remove(s.platform)}
        />
      ))}

      {editing && unused.length > 0 && (
        <Popover open={addOpen} onOpenChange={setAddOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Add social"
              className={`${pillClass} border-dashed text-muted-foreground hover:border-foreground/30 hover:text-foreground`}
            >
              <Plus className="size-3.5" aria-hidden />
              {socials.length === 0 ? "Add social" : "Add"}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={10}
            className={`bento-theme-${state.theme} glass-panel w-72 rounded-2xl border-0 bg-background/80 p-3 text-foreground`}
          >
            <AddSocialPanel unused={unused} onAdd={add} />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

function SocialPill({
  link,
  editing,
  open,
  onOpenChange,
  onCommit,
  onRemove,
}: {
  link: SocialLink;
  editing: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommit: (value: string) => void;
  onRemove: () => void;
}) {
  const meta = PLATFORM_META[link.platform];
  const { state } = useProfileStore();

  const face = (
    <>
      <meta.Icon className={`size-4 shrink-0 ${meta.brand}`} />
      <span>{meta.label}</span>
    </>
  );

  if (!editing) {
    return (
      <a
        href={link.url}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={meta.label}
        className={`${pillClass} hover:-translate-y-0.5 hover:brightness-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-music focus-visible:outline-none`}
      >
        {face}
      </a>
    );
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <div className={`${pillClass} pr-1.5`}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Edit ${meta.label}`}
            aria-expanded={open}
            className="inline-flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-music"
          >
            {face}
          </button>
        </PopoverTrigger>
        <button
          type="button"
          aria-label={`Remove ${meta.label}`}
          title="Remove"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition hover:bg-foreground/10 hover:text-foreground"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>
      <PopoverContent
        align="start"
        sideOffset={10}
        className={`bento-theme-${state.theme} glass-panel w-72 rounded-2xl border-0 bg-background/80 p-3 text-foreground`}
      >
        <SocialUrlEditor
          platform={link.platform}
          url={link.url}
          onCommit={(value) => {
            onCommit(value);
            onOpenChange(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function SocialUrlEditor({
  platform,
  url,
  onCommit,
}: {
  platform: SocialPlatform;
  url: string;
  onCommit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(url);
  const ref = useRef<HTMLInputElement>(null);
  const meta = PLATFORM_META[platform];

  useEffect(() => {
    setDraft(url);
    const id = window.setTimeout(() => {
      ref.current?.focus();
      ref.current?.select();
    }, 0);
    return () => window.clearTimeout(id);
  }, [url]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onCommit(draft);
      }}
    >
      <p className="px-0.5 pb-2 text-xs font-medium text-muted-foreground">{meta.label} link</p>
      <input
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") (e.target as HTMLInputElement).blur();
        }}
        placeholder="@handle or profile URL"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        aria-label={`${meta.label} URL`}
        className="glass-chip w-full rounded-xl px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-music/40"
      />
      <button
        type="submit"
        className="mt-2 w-full rounded-xl bg-music px-3 py-2 text-sm font-semibold text-music-foreground transition hover:brightness-105 active:scale-[0.99]"
      >
        Save
      </button>
    </form>
  );
}

function AddSocialPanel({
  unused,
  onAdd,
}: {
  unused: SocialPlatform[];
  onAdd: (platform: SocialPlatform, url?: string) => void;
}) {
  const [paste, setPaste] = useState("");
  const [error, setError] = useState("");

  function submitPaste() {
    const platform = detectSocialPlatform(paste);
    if (!platform) {
      setError("Paste a social link, e.g. instagram.com/you");
      return;
    }
    onAdd(platform, normalizeSocialInput(platform, paste));
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="px-0.5 pb-2 text-xs font-medium text-muted-foreground">Paste a profile URL</p>
        <div className="flex gap-1.5">
          <input
            value={paste}
            onChange={(e) => {
              setPaste(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitPaste();
              }
            }}
            placeholder="instagram.com/you"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            aria-label="Social profile URL"
            className="glass-chip min-w-0 flex-1 rounded-xl px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-music/40"
          />
          <button
            type="button"
            disabled={!paste.trim()}
            onClick={submitPaste}
            className="rounded-xl bg-music px-3 py-2 text-sm font-semibold text-music-foreground transition hover:brightness-105 disabled:opacity-40"
          >
            Add
          </button>
        </div>
        {error && <p className="px-0.5 pt-1.5 text-xs text-destructive">{error}</p>}
      </div>

      <div>
        <p className="px-0.5 pb-2 text-xs font-medium text-muted-foreground">Or pick a platform</p>
        <div className="grid grid-cols-2 gap-1">
          {unused.map((platform) => {
            const meta = PLATFORM_META[platform];
            return (
              <button
                key={platform}
                type="button"
                onClick={() => onAdd(platform)}
                className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition hover:bg-foreground/5"
              >
                <meta.Icon className={`size-4 ${meta.brand}`} />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
