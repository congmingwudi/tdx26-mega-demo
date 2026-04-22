# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TDX '26 Data 360 Campground "Mega Demo" — a presentation deck web app built from Claude Design exports. It's a 33-slide interactive deck with speaker narrative overlay, keyboard navigation, and mobile tap zones.

## Tech Stack

- **Framework**: React 19 + TypeScript (Vite 8)
- **Styling**: Tailwind CSS v4 + plain CSS for slide/narrative styles
- **Routing**: React Router v7 (`BrowserRouter` in `src/main.tsx`)
- **Slide Engine**: `<deck-stage>` web component (`src/deck-stage.js`) — a custom element handling navigation, scaling, persistence, and print layout

## Commands

```bash
npm run dev       # Start dev server (Vite, HMR)
npm run build     # Type-check (tsc) then production build
npm run lint      # ESLint
npm run preview   # Serve production build locally
```

## Architecture

- `src/main.tsx` — App entry point with React Router
- `src/App.tsx` — Root route, renders `DeckStage`
- `src/components/DeckStage.tsx` — Assembles slides and wires the `<deck-stage>` web component to the React Narrative panel
- `src/components/Narrative.tsx` — Floating overlay panel showing phase, beat, speaker notes, and stage directions per slide. Toggle with `N` key
- `src/deck-stage.js` — Web component: keyboard/tap nav, viewport scaling, localStorage persistence, print layout. Used directly in React via custom element
- `src/data/slides.ts` — Slide labels, dark-slide set, speaker notes
- `src/data/narrative-data.ts` — Rich structured narrative data (phase, beat, title, timed sections with say/do/note/persona kinds)
- `src/custom-elements.d.ts` — TypeScript JSX types for `<deck-stage>`
- `public/rendered/` — 33 slide images (`page-01.jpg` through `page-33.jpg`)

## Keyboard Shortcuts

- `←`/`→`, `PgUp`/`PgDn`, `Space` — navigate slides
- `Home`/`End` — first/last slide
- `R` — reset to slide 1
- `1`–`9`, `0` — jump to slide 1–10
- `N` — toggle narrative overlay

## Claude Design Integration

The original design bundle lives in `claude-design/`. Slide images were exported from a PDF and placed in `public/rendered/`. The `<deck-stage>` web component and narrative data were ported from the Claude Design HTML prototype into React components.
