# Where the clone still falls short of Bento.me

Ranked by how much each gap gives away that this isn't Bento.

## 1. Mobile experience (biggest gap)
Right now mobile is mostly "the desktop layout, narrower".
- Profile rail should collapse into a compact header: avatar + name + headline, bio truncated with a "more" toggle.
- Social row should be a horizontally scrollable strip, not wrapping.
- Edit affordances are hover-based; on touch there's no hover. Tap-to-select must reveal a floating per-tile action bar (resize / edit / delete) instead of hover controls.
- Drag needs a clearer long-press cue (haptic-style scale + shadow lift) and auto-scroll when dragging near screen edges.
- Toolbar should be a bottom sheet that doesn't overlap the last row (extra bottom padding when editing).

## 2. Tile interactions
- Selected tile lacks Bento's ring + floating size-picker popover anchored to the tile; sizes are currently a plain control.
- No drag handle affordance or cursor states (grab / grabbing).
- Reflow on resize/drop is instant rather than animated; add layout transitions via Motion, gated on `prefers-reduced-motion`.
- Link cards render a raw favicon; Bento pulls an OG image for wide/large sizes and shows a rich preview.

## 3. Tile content fidelity
- Social tiles look identical across platforms except for the icon tint. Bento renders platform-specific tiles (Spotify shows a track, YouTube a thumbnail, X a post).
- Image tiles have no aspect handling for `tall` vs `wide`; captions overlay a hardcoded black gradient instead of a token.
- Map tile is a static image with no zoom/pin flourish.
- Section headers span the full row but have no spacing rhythm above them.

## 4. Empty and edge states
- No empty state when all widgets are deleted (Bento shows an "add your first" prompt).
- No validation feedback in the add flow for invalid URLs.
- No delete confirmation / undo toast.

## 5. Polish details
- Page enter animation: tiles should stagger in on first load.
- Focus-visible rings and keyboard reordering are missing (dnd-kit supports keyboard sensor).
- Avatar swap presets appear inline and push layout; Bento uses a popover.
- Hardcoded `text-white` on the image caption bypasses theming.

## Suggested first pass
Mobile edit experience (1) + tile selection/resize popover and animated reflow (2). Those two cover the interactions a viewer notices immediately.

Tell me which section to build and I'll turn it into an implementation plan.
