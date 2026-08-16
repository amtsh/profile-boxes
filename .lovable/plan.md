# Bento-style editing: hover controls, contextual sizes, inline editing

Bring the editor closer to bento.me. The Edit/Done toggle stays; everything below only applies while edit mode is on. Layout, themes, and the glass skin are untouched.

## 1. Hover overlay replaces click-to-select

Today a tile must be clicked to select it before its action bar appears. Instead, hovering a tile in edit mode reveals its controls directly on the tile:

- A drag handle in the top-left corner (drag is initiated from the handle on desktop, still long-press anywhere on touch).
- A compact control bar pinned to the tile's bottom edge: size options, then a "more" menu holding Edit details and Delete.
- The bar fades/slides in on hover and stays visible while the menu inside it is open.

Touch has no hover, so on mobile/mobile-preview the current behaviour is kept: tap a tile to reveal the same control bar, tap elsewhere to dismiss. The bar keeps its thumb-reachable floating position there.

## 2. Sizes become contextual

Right now every tile offers the same four sizes. Each widget type gets only the sizes that make sense for it:

- Link: small, wide, large
- Social: small, wide
- Image: small, wide, tall, large
- Note: wide, tall, large
- Map: small, wide, large
- Section: no size control (already full-width)

The active size stays highlighted in the accent colour.

## 3. Inline editing on the tile

Text fields become directly editable on the tile in edit mode, no modal needed:

- Link: title and description
- Note: body and attribution
- Image: caption
- Map: place name
- Section: heading
- Social: handle

Clicking the text puts a caret in it; blur or Enter commits, Escape reverts. Empty fields show a muted placeholder so the tile never collapses.

The existing edit dialog is kept for the fields that don't work inline — URL, platform picker, image source — reachable from the "more" menu as "Edit details".

## 4. Animated reflow

Resizing or reordering currently snaps. Tiles will spring to their new positions using the animation library already in the project, with a short spring and staggered settle. The drag preview and drop animation stay as they are. Reduced-motion users get the instant behaviour.

## Technical notes

- `src/components/bento/bento-grid.tsx`: `SortableTile` gains a hover state, a dedicated drag-handle listener target (`listeners` move off the tile body on pointer devices), and renders the new controls component. Selection state stays but is only driven by touch.
- New `src/components/bento/tile-controls.tsx`: the hover/tap control bar, reading a per-type size list from a new `SIZE_OPTIONS` map added to `src/lib/bento-types.ts`.
- New `src/components/bento/inline-text.tsx`: a small `contentEditable` wrapper handling commit/revert, placeholder, and single vs multi-line.
- `src/components/bento/widget-card.tsx`: each editable string is wrapped in `InlineText` when `editing` is true; it dispatches the existing `update` action, so persistence is unchanged.
- Reflow animation: wrap grid children in motion elements with a shared `layout` behaviour, guarded by `prefers-reduced-motion`.
- `widget-edit-form.tsx` trims to the non-inline fields only.

## Out of scope

Always-on editing (no login/public view split), free grid placement, real URL metadata fetching, and image upload. The store, data model, themes, and toolbar are unchanged.
