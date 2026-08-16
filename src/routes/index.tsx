import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { BentoGrid } from "@/components/bento/bento-grid";
import { EditorToolbar } from "@/components/bento/editor-toolbar";
import { ProfileProvider, useProfileStore } from "@/components/bento/profile-store";
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

const TITLE = "William Shakespeare — Bento Profile";
const DESCRIPTION =
  "A bento-style personal profile for William Shakespeare: links, socials, notes and photos in a drag-and-drop grid you can rearrange yourself.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ProfileProvider>
      <ProfilePage />
    </ProfileProvider>
  );
}

function ProfilePage() {
  const { state, editing, setSelectedId, preview } = useProfileStore();
  const [editWidget, setEditWidget] = useState<Widget | null>(null);
  const live = editWidget ? (state.widgets.find((w) => w.id === editWidget.id) ?? null) : null;
  const mobilePreview = preview === "mobile";

  return (
    <div className={`bento-theme-${state.theme} min-h-screen bg-background text-foreground`}>
      <main
        className={
          mobilePreview
            ? "mx-auto flex w-full max-w-[430px] flex-col gap-8 px-5 py-10 pb-32"
            : "mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 pb-32 lg:flex-row lg:gap-14 lg:px-8 lg:py-16"
        }
        onClick={() => editing && setSelectedId(null)}
      >
        <ProfileRail />
        <div className="min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
          <BentoGrid onEdit={setEditWidget} />
        </div>
      </main>


      <p className="fixed bottom-5 left-5 hidden text-xs font-medium text-muted-foreground lg:block">
        Made with Bento
      </p>

      <EditorToolbar />

      <Dialog open={!!live} onOpenChange={(o) => !o && setEditWidget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit widget</DialogTitle>
            <DialogDescription>Changes save automatically.</DialogDescription>
          </DialogHeader>
          {live && <WidgetEditForm widget={live} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
