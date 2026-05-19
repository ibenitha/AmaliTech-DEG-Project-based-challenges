# SecureVault — Enterprise File Explorer Dashboard

A keyboard-accessible file explorer for **SecureVault Inc.**, built as a frontend challenge deliverable. The UI lets legal and finance teams browse deeply nested, encrypted folder structures without page reloads.

**Stack:** React 19 · Vite 8 · CSS Modules · custom SVG icons · no UI component libraries.

---

## Live Demo

🔗 **[https://amalisecvault.vercel.app](https://amalisecvault.vercel.app)**

> Tested in Incognito / Private window — loads without errors.

---

## Design File (Phase 1)

[SecureVault Design System — Figma](https://www.figma.com/design/5xANdpwktb2cbbXBHzunPc/securevault-design-system)  
Sharing: **Anyone with the link can view**

The design file must include a **Design System** page. This repository implements that system in code via `src/styles/variables.css`:

| Design system area | Implementation |
|---|---|
| Typography | Inter (UI), JetBrains Mono (metadata, hashes, sizes) |
| Color palette | Dark “cyber-secure” tokens — see table below |
| Spacing grid | 4px base: `4 / 8 / 16 / 24 / 32px` |
| Component states | Default, hover, focused, selected on tree rows, buttons, pills |

### Color palette (code tokens)

| Token | Value | Usage |
|---|---|---|
| `--bg-color` | `#0d0d0f` | App background |
| `--surface-color` | `#111115` | Sidebar, panels |
| `--surface-hover` | `#1e1e25` | Hover rows |
| `--surface-selected` | `rgba(20, 184, 166, 0.08)` | Selected tree row |
| `--accent-color` | `#14b8a6` | Primary actions, focus, links |
| `--folder-color` | `#f59e0b` | Folder icons |
| `--text-primary` | `#f1f5f9` | Body text |
| `--text-secondary` | `#94a3b8` | Secondary text |
| `--text-muted` | `#4b5563` | Labels, hints |
| `--border-color` | `#1f2028` | Dividers |

---

## Setup Instructions

**Prerequisites:** Node.js 18+

```bash
git clone <your-fork-url>
cd secure-vault
npm install
npm run dev      # http://localhost:5173
npm run build    # production build
npm run preview  # preview production build
npm run lint     # ESLint
```

---

## Data Source

All explorer content comes from **`data.json`** at the project root (86 nodes: 52 files, 34 folders, including a 10-level `Deep_Audit_Trail` branch).

- Loaded once through `src/data/index.js` as `vaultTree`
- Validated in development (unique ids, required fields, no files with `children`)
- **Do not change the JSON schema** (`id`, `name`, `type`, optional `children`, `size`, `modified`); you may add more nodes for testing

---

## Requirements Compliance

| Requirement | Status | Notes |
|---|---|---|
| **Story 1** — Recursive tree from JSON | ✅ | `TreeItem` renders `node.children` recursively |
| **Story 1** — Expand/collapse folders | ✅ | Click row or chevron; keyboard Space on folders |
| **Story 2** — Select file (visual state) | ✅ | Teal highlight in tree and main list |
| **Story 2** — Properties: Name, Type, Size | ✅ | `PropertiesPanel`; folders show Name, Type, Contains |
| **Story 3** — ↑/↓ focus visible items | ✅ | `useTreeNavigation` + flattened `getVisibleNodes` |
| **Story 3** — → expand / ← collapse | ✅ | |
| **Story 3** — Enter selects | ✅ | |
| **Story 4** — Wildcard feature | ✅ | **Recent Files** (see below) |
| **Story 5** — Search + auto-expand | ✅ | `filterTree` + expand on search input |
| No Bootstrap / MUI / Chakra / Ant Design | ✅ | Only React + custom CSS |
| `data.json` as data source | ✅ | |
| README: setup, design link, recursive strategy, wildcard | ✅ | This file |

---

## Features

### Story 1 — Recursive Tree

`TreeItem` is a **recursive** component: when a folder is expanded, it maps `node.children` and renders another `TreeItem` for each child. Depth is unlimited (tested with 10 nested levels in `Deep_Audit_Trail`).

Keyboard navigation uses a separate **flattened** list (`getVisibleNodes`) so ↑/↓ stay simple while the DOM stays recursive.

### Story 2 — File Details & Inspection

Selecting any file or folder opens the **Properties Panel** with:

- **Name**, **Type**, **Size** (files), **Modified** (files)
- **Location** path with copy button
- **SHA-1** (deterministic mock from node `id` for demo purposes)
- AES-256 encrypted badge and action buttons (UI placeholders)

The **Folder Contents** pane (center) lists the current folder’s children in list or grid view.

### Story 3 — Keyboard Accessibility

Focus the sidebar tree, then:

| Key | Action |
|---|---|
| `↑` / `↓` | Move focus between visible items |
| `→` | Expand folder (or move into children if already open) |
| `←` | Collapse folder or jump to parent |
| `Enter` | Select focused item |
| `Space` | Toggle folder expand/collapse |
| `Alt+S` | Focus search input |

### Story 4 — Wildcard: Recent Files

**Gap identified:** Users jump between distant paths all day; the spec had no quick way to return to prior items.

**Solution:** A **Recent Files** panel (max 8 items) at the bottom of the sidebar, persisted in `sessionStorage` for the tab session.

**Business value:** One click returns to e.g. a deep case PDF or audit spreadsheet without re-walking the tree—saves time for lawyers and analysts on repetitive workflows.

### Story 5 (Bonus) — Search & Filter

- Real-time filter via `filterTree()`
- Parent folders auto-expand when a descendant matches (on search input change)
- Match count under the search bar; inline highlight in tree labels

---

## Recursive Strategy

The dataset is a **nested JSON array**. Each node: `{ id, name, type: 'folder' | 'file', children?, size?, modified? }`.

1. **Rendering (React recursion)**  
   `TreeItem` renders one row, then—if the folder is expanded—maps `children` and renders `<TreeItem />` again with `depth + 1`.

2. **Keyboard navigation (flat visible list)**  
   `getVisibleNodes(data, expandedNodes)` DFS-walks the tree but only enters expanded folders, producing a flat array in display order. `useTreeNavigation` uses index math on that array for ↑/↓.

3. **Search (recursive filter + expand)**  
   `filterTree()` keeps nodes that match or contain matching descendants. `getFoldersToExpand()` returns ancestor folder ids to merge into `expandedNodes` when the user types in search.

---

## Project Structure

```
data.json                 # Challenge dataset (single source of truth)
src/
├── data/index.js           # Import + validate data.json
├── components/
│   ├── Explorer/           # Sidebar tree, search, sort
│   │   └── TreeItem.jsx    # Recursive tree node
│   ├── FolderContents/     # Main pane list/grid
│   ├── PropertiesPanel/    # Metadata panel
│   ├── Breadcrumbs/        # Path navigation
│   ├── RecentFiles/        # Wildcard feature
│   ├── StatusBar/
│   └── common/             # Icon, ContextMenu
├── hooks/
│   ├── useTreeNavigation.js
│   └── useRecentFiles.js
├── utils/treeUtils.js
├── styles/variables.css      # Design tokens
└── App.jsx
```

---

## Pre-Submission Checklist

- [x] GitHub repository is **Public**
- [x] Commit history shows **progress over time** (not one bulk upload)
- [x] Live URL works in **Incognito** — [https://amalisecvault.vercel.app](https://amalisecvault.vercel.app)
- [x] No Bootstrap, Material UI, Chakra UI, or Ant Design
- [x] Design file link is **viewable by anyone with the link**
- [x] This README replaces the original assignment text (not appended)
- [x] Design file URL and deployment URL are filled in

---

## License

MIT © 2026 SecureVault Inc.
