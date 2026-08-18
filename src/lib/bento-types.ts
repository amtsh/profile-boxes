export type WidgetSize = "sm" | "wide" | "tall" | "lg";

export type WidgetType = "link" | "social" | "image" | "text" | "map" | "section";

export type SocialPlatform =
  | "x"
  | "github"
  | "instagram"
  | "youtube"
  | "spotify"
  | "substack";

export interface BaseWidget {
  id: string;
  type: WidgetType;
  size: WidgetSize;
}

export interface LinkWidget extends BaseWidget {
  type: "link";
  title: string;
  url: string;
  description?: string;
}

export interface SocialWidget extends BaseWidget {
  type: "social";
  platform: SocialPlatform;
  handle: string;
  url: string;
}

export interface ImageWidget extends BaseWidget {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
}

export interface TextWidget extends BaseWidget {
  type: "text";
  body: string;
  attribution?: string;
}

export interface MapWidget extends BaseWidget {
  type: "map";
  src: string;
  place: string;
  lat?: number;
  lon?: number;
}

export interface SectionWidget extends BaseWidget {
  type: "section";
  title: string;
}

export type Widget =
  | LinkWidget
  | SocialWidget
  | ImageWidget
  | TextWidget
  | MapWidget
  | SectionWidget;

export type ThemeId =
  | "light"
  | "dark"
  | "sage"
  | "clay"
  | "lavender"
  | "ocean"
  | "rose"
  | "sand"
  | "midnight"
  | "forest";

export const THEME_OPTIONS: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "light", label: "Light", swatch: "oklch(0.984 0 0)" },
  { id: "sand", label: "Sand", swatch: "oklch(0.94 0.02 95)" },
  { id: "clay", label: "Clay", swatch: "oklch(0.94 0.025 60)" },
  { id: "rose", label: "Rose", swatch: "oklch(0.94 0.03 15)" },
  { id: "lavender", label: "Lavender", swatch: "oklch(0.94 0.025 300)" },
  { id: "ocean", label: "Ocean", swatch: "oklch(0.94 0.025 230)" },
  { id: "sage", label: "Sage", swatch: "oklch(0.94 0.02 150)" },
  { id: "forest", label: "Forest", swatch: "oklch(0.22 0.03 160)" },
  { id: "midnight", label: "Midnight", swatch: "oklch(0.18 0.03 265)" },
  { id: "dark", label: "Dark", swatch: "oklch(0 0 0)" },
];

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface Profile {
  name: string;
  headline: string;
  bio: string;
  location: string;
  avatar: string;
  socials: SocialLink[];
}

export interface ProfileState {
  profile: Profile;
  widgets: Widget[];
  theme: ThemeId;
}

export const SIZE_LABELS: Record<WidgetSize, string> = {
  sm: "Small",
  wide: "Wide",
  tall: "Tall",
  lg: "Large",
};

export const SIZE_CLASSES: Record<WidgetSize, string> = {
  sm: "col-span-1 row-span-1",
  wide: "col-span-2 row-span-1",
  tall: "col-span-1 row-span-2",
  lg: "col-span-2 row-span-2",
};

/** Sizes that make sense per widget type (Bento offers a contextual set). */
export const SIZE_OPTIONS: Record<WidgetType, WidgetSize[]> = {
  link: ["sm", "wide", "lg"],
  social: ["sm", "wide"],
  image: ["sm", "wide", "tall", "lg"],
  text: ["wide", "tall", "lg"],
  map: ["sm", "wide", "lg"],
  section: [],
};

