import { useEffect } from "react";

import { BentoGrid } from "@/components/bento/bento-grid";
import { EditorToolbar } from "@/components/bento/editor-toolbar";
import { useProfileStore } from "@/components/bento/profile-store";
import { ProfileRail } from "@/components/bento/profile-rail";

export function ProfilePage() {
  const { state, editing, setSelectedId, preview, undo, redo } = useProfileStore();
  const mobilePreview = preview === "mobile";

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta || e.key.toLowerCase() !== "z") return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  return (
    <div className={`bento-theme-${state.theme} relative min-h-screen bg-background text-foreground`}>
      <main
        className={
          mobilePreview
            ? "relative z-10 mx-auto flex w-full max-w-[430px] flex-col gap-8 px-5 py-10 pb-36"
            : "relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 pb-36 lg:flex-row lg:gap-14 lg:px-8 lg:py-16 lg:pb-32"
        }
        onClick={() => editing && setSelectedId(null)}
      >
        <ProfileRail />
        <div className="min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
          <BentoGrid />
        </div>
      </main>

      <p className="pointer-events-none fixed bottom-5 left-5 hidden text-xs font-medium text-muted-foreground/80 select-none lg:block">
        Made with Bento
      </p>

      <EditorToolbar />
    </div>
  );
}
