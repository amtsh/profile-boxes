# Toolbar quick-add shortcuts

Add one-tap shortcuts to the floating toolbar pill for the four most-used tiles: Link, Image, Quote (note), and Section — matching Bento's toolbar row of icon buttons.

## What changes

- The bottom toolbar pill gains a group of four square icon buttons, separated by a hairline divider from the Desktop/Mobile switcher and the theme swatches.
- Icons: link (chain), image (photo), quote (curly quotes), section (layout blocks) — with tooltips/aria-labels.
- Tapping one instantly creates that tile with the same defaults the Add panel uses, selects it so it's immediately editable, and shows the usual confirmation toast. No dialog in between.
- Shortcuts are visible whenever the pill is (edit mode on mobile, always on desktop) and work without first toggling edit mode; creating a tile turns edit mode on so the new tile's inline controls are usable.
- The "+" floating button and full Add panel stay exactly as they are for socials, maps, and pasted URLs.
- On narrow screens the pill already scrolls horizontally, so the new buttons join that scroll row rather than wrapping.

## Technical notes

- Extract the widget-creation defaults currently inline in `add-widget-panel.tsx` into a small shared helper (e.g. `src/lib/create-widget.ts`) that returns a `Widget` for a given type, so the panel and the toolbar produce identical tiles.
- `editor-toolbar.tsx` imports that helper, dispatches `{ type: "add", widget }`, calls `setSelectedId`, and fires the toast.
- Icons from lucide-react (`Link2`, `Image`, `Quote`, `Type`), styled as `glass-chip` rounded squares consistent with existing pill buttons.
