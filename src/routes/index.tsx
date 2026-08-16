import { createFileRoute } from "@tanstack/react-router";

import { ProfilePage } from "@/components/bento/profile-page";
import { ProfileProvider } from "@/components/bento/profile-store";

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
