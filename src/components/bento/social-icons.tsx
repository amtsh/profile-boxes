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
  { label: string; Icon: ComponentType<{ className?: string }>; tint: string; brand: string }
> = {
  x: { label: "X", Icon: SiX, tint: "bg-tint-ink text-tint-ink-foreground", brand: "text-foreground" },
  github: {
    label: "GitHub",
    Icon: SiGithub,
    tint: "bg-tint-ink text-tint-ink-foreground",
    brand: "text-foreground",
  },
  instagram: {
    label: "Instagram",
    Icon: SiInstagram,
    tint: "bg-tint-rose text-tint-rose-foreground",
    brand: "text-[#E4405F]",
  },
  youtube: {
    label: "YouTube",
    Icon: SiYoutube,
    tint: "bg-tint-red text-tint-red-foreground",
    brand: "text-[#FF0000]",
  },
  spotify: {
    label: "Spotify",
    Icon: SiSpotify,
    tint: "bg-tint-green text-tint-green-foreground",
    brand: "text-[#1DB954]",
  },
  substack: {
    label: "Substack",
    Icon: SiSubstack,
    tint: "bg-tint-amber text-tint-amber-foreground",
    brand: "text-[#FF6719]",
  },
};

export const ALL_PLATFORMS = Object.keys(PLATFORM_META) as SocialPlatform[];
