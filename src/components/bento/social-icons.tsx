import { Github, Instagram, Youtube, Music2, Mail, Twitter } from "lucide-react";
import type { ComponentType } from "react";

import type { SocialPlatform } from "@/lib/bento-types";

export const PLATFORM_META: Record<
  SocialPlatform,
  { label: string; Icon: ComponentType<{ className?: string }>; tint: string }
> = {
  x: { label: "X", Icon: Twitter, tint: "bg-tint-ink text-tint-ink-foreground" },
  github: { label: "GitHub", Icon: Github, tint: "bg-tint-ink text-tint-ink-foreground" },
  instagram: { label: "Instagram", Icon: Instagram, tint: "bg-tint-rose text-tint-rose-foreground" },
  youtube: { label: "YouTube", Icon: Youtube, tint: "bg-tint-red text-tint-red-foreground" },
  spotify: { label: "Spotify", Icon: Music2, tint: "bg-tint-green text-tint-green-foreground" },
  substack: { label: "Substack", Icon: Mail, tint: "bg-tint-amber text-tint-amber-foreground" },
};
