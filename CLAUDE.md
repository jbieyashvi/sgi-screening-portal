# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (Vite HMR)
npm run build      # production build → dist/
npm run preview    # serve dist/ locally
npm run lint       # ESLint
npm run deploy     # build + publish to gh-pages
```

No test suite exists in this project.

## Architecture

**SGI Recruiter Portal** — a React SPA for Safe-Guard Insurance's recruiting workflow. All data is mocked (no backend).

### State

`src/store.jsx` is the single source of truth. `AppProvider` wraps the entire app and exposes via `useApp()`:

- `candidates` — array seeded from `mockData.js`, mutated in-memory by `advanceCandidate` / `declineCandidate`
- `activeReq` — the currently selected requisition ID (default `"REQ-2715"`); drives all candidate filtering in Screening
- `requisitions` — static list from `mockData.js` (never mutated at runtime)
- `toasts` / `showToast` — ephemeral notification stack, auto-clears after 3.2 s

### Data model (`src/data/mockData.js`)

Candidates have four possible `status` values: `"To Review"` | `"Screening"` | `"Declined"` | `"Knocked Out"`. Each candidate belongs to a `reqId`. The `make()` helper builds candidates with sensible defaults and auto-generates `activity[]` entries based on status.

Exports: `candidates`, `requisitions`, `funnel`, `analyticsMetrics`.

### Routing

`src/App.jsx` uses React Router v7. All routes share `Layout` (collapsible sidebar + header with the active-requisition switcher). Routes:

| Path | Page |
|------|------|
| `/` | Dashboard |
| `/screening` | Screening |
| `/requisitions` | Requisitions |
| `/upload` | Upload |
| `/analytics` | Analytics |

### Screening page (`src/pages/Screening.jsx`)

The most complex page. Two-panel layout: left = filterable/sortable candidate list with bulk-select; right = candidate detail with tabs (AI Summary, Resume, Screening Qs, Activity).

Key local state: `statusFilter`, `filters` (Georgia / no-sponsorship / hybrid / SQL), `selectedId`, `selectedIds` (Set for bulk ops), `confirmDecline` (single-item decline modal), `bulkDecline`.

`DeclineModal` renders an ADP-style disposition form (action radio, disposition code dropdown, notification schedule, rich-text notes). It is used for both single and bulk declines.

### Styling

Tailwind CSS v3 with a custom `sgi` color scale (base `#185FA5`). The brand blue is used throughout as `text-sgi`, `bg-sgi`, `border-sgi-*`, etc. Custom `.minicheck` class in `index.css` replaces the native checkbox with a styled version that supports indeterminate state (used for bulk-select).
