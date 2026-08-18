import { useState } from "react";

import { BentoGrid } from "@/components/bento/bento-grid";
import { EditorToolbar } from "@/components/bento/editor-toolbar";
import { useProfileStore } from "@/components/bento/profile-store";
import { ProfileRail } from "@/components/bento/profile-rail";
import { WidgetEditForm } from "@/components/bento/widget-edit-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Widget } from "@/lib/bento-types";

export function ProfilePage() {
  const { state, editing, setSelectedId, preview } = useProfileStore();
  const [editWidget, setEditWidget] = useState<Widget | null>(null);
  const live = editWidget ? (state.widgets.find((w) => w.id === editWidget.id) ?? null) : null;
  const mobilePreview = preview === "mobile";

  return (
    <div className={`bento-theme-${state.theme} relative min-h-screen bg-background text-foreground`}>

      <main
        className={
          mobilePreview
            ? "relative z-10 mx-auto flex w-full max-w-[430px] flex-col gap-8 px-5 py-10 pb-48"
            : "relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 pb-48 lg:flex-row lg:gap-14 lg:px-8 lg:py-16 lg:pb-32"
        }
        onClick={() => editing && setSelectedId(null)}
      >
        <ProfileRail />
        <div className="min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
          <BentoGrid onEdit={setEditWidget} />
        </div>
      </main>


      <p className="pointer-events-none fixed bottom-5 left-5 hidden text-xs font-medium text-muted-foreground/80 select-none lg:block">
        Made with Bento
      </p>

      <EditorToolbar />

      <Dialog open={!!live} onOpenChange={(o) => !o && setEditWidget(null)}>
        <DialogContent
          className={`bento-theme-${state.theme} glass-panel rounded-3xl bg-background/70 text-foreground sm:max-w-md`}
        >
          <DialogHeader>
            <DialogTitle>Edit details</DialogTitle>
            <DialogDescription>
              Text is editable directly on the tile. Changes save automatically.
            </DialogDescription>

          </DialogHeader>
          {live && <WidgetEditForm widget={live} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
