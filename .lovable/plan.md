# Apple Music "Liquid Glass" Skin

Re-skin the existing Bento profile with an Apple Music–style liquid-glass look. No layout, grid, or interaction changes — only surfaces, colors, blur, borders, and typography weight.

## Visual direction

- Ambient background: a soft, saturated multi-color blur field (Apple Music's album-art bloom) behind the page, per theme, with a subtle vertical darkening.
- Tiles: translucent frosted panels — semi-transparent card fill, heavy backdrop blur with saturation boost, a 1px hairline highlight border on top, and a soft, wide shadow instead of the current flat shadow.
- Floating chrome (toolbar pill, add button, tile action bar, dialogs/drawers, toasts): the same glass treatment, more opaque so text stays legible.
- Accent: Apple Music's pink/red used for the active/selected state, focus rings, and primary button fill instead of solid foreground-on-background.
- Hover: brightness and border-highlight lift rather than a stronger drop shadow; keep the existing translate/scale values.

## Where the changes go

All of it is token- and utility-level work in `src/styles.css`:

- Add glass tokens per theme block (`.bento-theme-light|dark|sage|clay`): `--glass-bg`, `--glass-border`, `--glass-blur`, `--glass-highlight`, updated `--tile-shadow` / `--tile-shadow-hover`, and an `--accent-music` pink token registered in `@theme inline`.
- Rewrite the `tile-surface` and `tile-hover` utilities to use those tokens (background + `backdrop-filter: blur() saturate()` + inset highlight border). Standard property only — no hand-written `-webkit-` prefix.
- Add a `glass-panel` utility for chrome surfaces, and a `bento-aurora` background layer utility.

Component files touched only to swap class names onto the new utilities (no structure edits):

- `src/components/bento/profile-page.tsx` — render the aurora background layer behind `<main>`.
- `src/components/bento/editor-toolbar.tsx` — pill and buttons use `glass-panel`; active preview/theme states use the accent token.
- `src/components/bento/bento-grid.tsx` — selected-tile ring and the floating action bar use accent + glass instead of solid `bg-foreground`.
- `src/components/bento/widget-card.tsx` — image/map caption chips use the glass utility; tint chips get a slight translucency.
- `src/components/bento/profile-rail.tsx` and `add-widget-panel.tsx` — inputs, chips, and the avatar frame pick up the glass surface.

Dark theme becomes the strongest expression of the look (Apple Music is dark-first), but all four themes get a consistent glass treatment.

## Out of scope

Grid columns, tile sizes, drag-and-drop behavior, mobile/desktop switcher logic, and the widget data model stay exactly as they are.
