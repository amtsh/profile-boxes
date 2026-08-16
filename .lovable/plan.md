# Toolbar quick-add shortcuts

Add one-tap shortcuts to the floating toolbar pill for Link, Image, Quote, and Section — matching Bento's toolbar row of icon buttons — each with its own behavior.

## What changes

The bottom toolbar pill gains a group of four icon buttons, separated by a hairline divider from the Desktop/Mobile switcher and the theme swatches. Icons: chain (link), photo (image), curly quotes (quote), blocks (section), with tooltips/aria-labels.

Behavior per button:

- **Link** — the pill's contents swap in place for a link-entry row: a URL input, an "Add" button, and a cross to cancel and return to the normal toolbar. Enter or Add creates the tile; social URLs (X, GitHub, Instagram, YouTube, Spotify, Substack) still auto-become social tiles, everything else a link tile. Invalid URL shows an inline error and keeps the row open.
- **Image** — opens the OS file picker immediately. The chosen image becomes an image tile straight away.
- **Quote** — adds a placeholder note tile ("All the world's a stage." / As You Like It) directly to the canvas.
- **Section** — adds a placeholder section header ("New section") directly to the canvas.

For all four, the new tile is selected right after creation so its inline editing controls are ready, edit mode turns on, and the usual confirmation toast appears. The "+" floating button and full Add panel stay unchanged for socials, maps, and everything else. On narrow screens the pill already scrolls horizontally, so the shortcuts join that scroll row.

## Technical notes

- Extract the widget-creation defaults currently inline in `add-widget-panel.tsx` (including the social-host URL detection) into a shared helper, e.g. `src/lib/create-widget.ts`, so panel and toolbar produce identical tiles.
- `editor-toolbar.tsx` holds a small local mode state (`"default" | "link"`) to swap the pill contents, plus a hidden `<input type="file" accept="image/*">` triggered by the image button.
- Uploaded images are read as data URLs and stored in the widget's `src`, so they persist in localStorage with everything else; downscale to a reasonable max dimension via a canvas before storing to keep localStorage from filling up, and show an error toast if a file is still too large.
- Icons from lucide-react (`Link2`, `Image`, `Quote`, `Type`), styled as `glass-chip` rounded squares consistent with existing pill buttons.
