import avatar from "@/assets/shakespeare-avatar.jpg";
import globe from "@/assets/globe-theatre.jpg";
import quill from "@/assets/quill-parchment.jpg";
import mapTile from "@/assets/stratford-map.jpg";

import type { ProfileState } from "@/lib/bento-types";

export const AVATAR_PRESETS = [avatar, quill, globe, mapTile];

export const shakespeareProfile: ProfileState = {
  theme: "light",
  profile: {
    name: "William Shakespeare",
    headline: "Playwright, poet & part-time actor",
    bio: "Writing plays for the Lord Chamberlain's Men. 38 plays, 154 sonnets, and a fair few words I made up along the way. Currently rehearsing at the Globe.",
    location: "Stratford-upon-Avon, England",
    avatar,
    socials: [
      { platform: "x", url: "https://x.com/" },
      { platform: "instagram", url: "https://instagram.com/" },
      { platform: "youtube", url: "https://youtube.com/" },
      { platform: "substack", url: "https://substack.com/" },
    ],
  },
  widgets: [
    { id: "w-globe", type: "image", size: "lg", src: globe, alt: "The Globe Theatre at dusk", caption: "The Globe, Bankside" },
    {
      id: "w-sonnet",
      type: "text",
      size: "wide",
      body: "Shall I compare thee to a summer's day? Thou art more lovely and more temperate.",
      attribution: "Sonnet 18",
    },
    { id: "w-x", type: "social", size: "sm", platform: "x", handle: "@willshakes", url: "https://x.com/" },
    { id: "w-substack", type: "social", size: "sm", platform: "substack", handle: "The Quarto", url: "https://substack.com/" },
    { id: "w-section-work", type: "section", size: "wide", title: "Work" },
    {
      id: "w-firstfolio",
      type: "link",
      size: "wide",
      title: "The First Folio",
      url: "https://www.folger.edu",
      description: "36 plays, collected and printed in 1623",
    },
    { id: "w-quill", type: "image", size: "tall", src: quill, alt: "A quill resting on handwritten parchment", caption: "Draft of Act III" },
    { id: "w-map", type: "map", size: "sm", src: mapTile, place: "Stratford-upon-Avon" },
    { id: "w-spotify", type: "social", size: "sm", platform: "spotify", handle: "Lute & Consort", url: "https://spotify.com/" },
    {
      id: "w-tickets",
      type: "link",
      size: "wide",
      title: "Hamlet — tickets",
      url: "https://www.shakespearesglobe.com",
      description: "Groundling standing room, 1 penny",
    },
    { id: "w-youtube", type: "social", size: "sm", platform: "youtube", handle: "Globe Players", url: "https://youtube.com/" },
    { id: "w-instagram", type: "social", size: "sm", platform: "instagram", handle: "@bardofavon", url: "https://instagram.com/" },
  ],
};
