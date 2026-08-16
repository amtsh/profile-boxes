# Bento.me Clone — Shakespeare Profile + Local Editor

A faithful recreation of a Bento.me personal profile page, with the drag-and-drop edit mode. Demo persona: William Shakespeare. All changes persist in the browser only (no accounts, no server).

## What gets built

### 1. Public profile view (`/`)
- Left column (sticky on desktop): large circular avatar, name, headline ("Playwright, poet, Stratford-upon-Avon"), bio paragraph, location, and a row of small social icon links.
- Right side: the bento grid of widgets — rounded-2xl white cards, soft shadow, generous gaps, hover lift + subtle scale, on Bento's warm off-white background.
- Widget types, matching Bento's real set:
  - **Link card** — favicon, title, URL, arrow-out on hover
  - **Social card** — branded icon (X, GitHub, Instagram, YouTube, Spotify, Substack) with handle
  - **Image / media card** — cover image filling the tile
  - **Text/note card** — a quote widget (a Shakespeare sonnet excerpt)
  - **Map card** — static styled map tile for Stratford-upon-Avon
  - **Section header** — plain text divider between groups
- Widget sizes: 1x1 square, 2x1 wide, 1x2 tall, 2x2 large — exactly Bento's four.
- Bottom-left "Made with Bento"-style footer badge.

### 2. Edit mode
- "Edit" toggle in a floating toolbar (bottom-center pill on desktop, bottom sheet on mobile).
- **Drag to reorder** widgets within the grid, with live gap/placeholder animation and a snap on drop.
- **Resize**: selecting a widget reveals the 4 size options; changing size reflows the grid.
- **Add widget**: a panel with the widget types above; paste a URL to create a link card (auto-titles from the domain, favicon via a favicon service).
- **Edit / delete** per widget via hover controls.
- **Profile editing**: inline-editable name, headline, bio; avatar swap from a preset set.
- **Theme picker**: Bento's light/dark/color themes swapping design tokens.
- Everything autosaves to localStorage; a "Reset to Shakespeare demo" action restores defaults.

### 3. Responsive behavior
- Desktop: two-column layout (profile rail + 4-column grid), hover interactions, cursor affordances.
- Tablet: single column, grid drops to 3 columns.
- Mobile: profile block stacked on top, 2-column grid, drag via long-press, toolbar as a bottom sheet, tap-to-select instead of hover.

## Technical notes
- Grid uses CSS grid with column/row spans; drag-and-drop with `@dnd-kit/core` + `@dnd-kit/sortable` (touch sensor for mobile long-press).
- Motion for React for card enter/hover/reflow animation, respecting `prefers-reduced-motion`.
- State in a single `useProfileStore` (React context + reducer) persisted to localStorage under a versioned key; default Shakespeare data lives in `src/data/shakespeare.ts`.
- Widgets rendered by a `WidgetRenderer` switch so new types are one file each, under `src/components/bento/`.
- Design tokens (background, card, radius, shadow, theme variants) defined in `src/styles.css`; no hardcoded color classes.
- Avatar, media tiles, and map tile generated as image assets into `src/assets/`.
- Single route `/` with its own `head()` metadata (title, description, og/twitter).

## Out of scope
- Accounts, username claiming, published `/username` pages, and server storage. Say the word later and I'll add Lovable Cloud for real profiles.
