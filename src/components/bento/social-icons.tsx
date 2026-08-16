import {
  SiGithub,
  SiInstagram,
  SiSpotify,
  SiSubstack,
  SiX,
  SiYoutube,
} from "@icons-pack/react-simple-icons";
import type { ComponentType } from "react";

import type { SocialPlatform } from "@/lib/bento-types";

export const PLATFORM_META: Record<
  SocialPlatform,
  { label: string; Icon: ComponentType<{ className?: string }>; tint: string }
> = {
  x: { label: "X", Icon: SiX, tint: "bg-tint-ink text-tint-ink-foreground" },
  github: { label: "GitHub", Icon: SiGithub, tint: "bg-tint-ink text-tint-ink-foreground" },
  instagram: {
    label: "Instagram",
    Icon: SiInstagram,
    tint: "bg-tint-rose text-tint-rose-foreground",
  },
  youtube: { label: "YouTube", Icon: SiYoutube, tint: "bg-tint-red text-tint-red-foreground" },
  spotify: { label: "Spotify", Icon: SiSpotify, tint: "bg-tint-green text-tint-green-foreground" },
  substack: { label: "Substack", Icon: SiSubstack, tint: "bg-tint-amber text-tint-amber-foreground" },
};
