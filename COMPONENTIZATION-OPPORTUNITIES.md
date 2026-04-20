# Componentization opportunities (sitio-dashboard)

**Scope:** `sitio-dashboard` only — broad static search (tables, list-pane primitives, headers, query UI) on 2026-04-18.

**Already in good shape**

- Raw `<table>` usage outside `SortableListTable` is **eliminated** (only `src/components/ui/sortable-list-table.tsx` defines a `<table>`).
- Main list panes use **`ListPaneShell` / `ListPaneScrollArea` / `ListPanePageHeader`** + **`SortableListTable`** where appropriate (schools directory, school trips, passengers, Wix events, payment history).

---

## High value

### 1. Detail / form title row + close control

**Status (implemented):** `src/components/layout/detail-pane-page-header.tsx` — `DetailPanePageHeader` + `DetailPaneCloseButton`. Migrated school/trip/passenger create & edit detail routes, Wix config/detail, trip summary, and passenger workspace close.

**Pattern:** `h1` + `text-lg font-medium` + trailing **`Button` ghost/icon** calling `requestCloseDetail()`, often inside `flex … justify-between gap-2` (or `gap-3`).

**Occurrences (non-exhaustive):**

| Area | Example path |
|------|----------------|
| School create | `src/routes/schools/new.tsx` |
| School edit | `src/routes/schools/$schoolId/edit.tsx` |
| Trip create (school shell) | `src/routes/schools/$schoolId/trips/new.tsx` |
| Passenger create | `src/routes/trips/$tripId/passengers/new.tsx`, `src/routes/schools/$schoolId/trips/$tripId/passengers/new.tsx` |
| Wix config | `src/routes/schools/$schoolId/integrations/wix/configuration.tsx` |
| Read-only/detail | `src/components/trips/trip-summary-detail.tsx`, `src/components/wix/wix-payment-event-detail-pane.tsx` |
| Passenger workspace | `src/components/trips/passenger-workspace-chrome.tsx` (close + layout differs slightly) |

**Suggestion:** Introduce something like **`DetailPanePageHeader`** (or `ListDetailFormHeader`) with props:

- `title: ReactNode`
- `onClose?: () => void` + `closeLabel` (default `ptBR.listDetail.detailClose`)
- optional `size: "default" | "icon"` to match `size="sm"` vs `size="icon"` close buttons

Reuse **`ListPanePageHeader`** only if you add a variant that supports an **`h1` + close** without fighting semantics (today `compact` uses `h2` for subsections).

---

### 2. Async query status copy (loading / error)

**Pattern:** Repeated blocks:

- `<p className="text-sm text-muted-foreground">Carregando…</p>`
- `<p className="text-sm text-red-600" role="alert">…</p>`

**Many files:** list panes (`school-trips-list-pane`, `schools-directory-schools-table-pane`, `trip-workspace-list-pane`, `PassengerPaymentHistory`), routes (`passengers/index`, `school edit`), `trip-summary-detail`, `passenger-workspace-chrome`, `passenger-payments-route-bodies`, `PassengerEditForm`, etc.

**Suggestion:** Small presentational helpers, e.g. **`QueryLoadingLine`** and **`QueryErrorAlert`** (props: `message`, optional `role`), or a single **`QueryStatusMessage`** with `variant: "loading" | "error"`. Keeps copy centralized and makes it easier to swap for skeletons later.

---

### 3. `noopSort` + fixed `sortState` on non-sorting tables

**Duplicated** in:

- `PassengerTable.tsx`
- `PassengerPaymentHistory.tsx`
- `school-trips-list-pane.tsx`
- `schools-directory-schools-table-pane.tsx`

**Suggestion:** Export from `sortable-list-table.tsx` (or a tiny `sortable-list-table-helpers.ts`):

- `function noopSortToggle<T extends string>(): (column: T) => void`  
  or a documented `NOOP_SORT_TOGGLE` pattern
- Optional: `function fixedSortState<T extends string>(column: T, direction: SortDirection)` to avoid repeating `useMemo` boilerplate

---

## Medium value

### 4. Sticky actions column definitions

**Pattern:** Same `thClassName` / `tdClassName` + `tableStickyActionSelected` / `tableStickyActionUnselected` + stop-propagation wrapper for interactive rows.

**Files:** `school-trips-list-pane.tsx`, `schools-directory-schools-table-pane.tsx`, `PassengerPaymentHistory.tsx` (unselected only).

**Suggestion:** Factory **`stickyActionsColumnDefinition({ renderMenu, selectedKey, getRowKey })`** returning a `SortableListTableColumn` fragment, or at least export shared **className constants** next to `table-sticky-action-surface.ts` for thead/tbody sticky cells.

---

### 5. “Toolbar row: label + trailing control” (non-page-title)

**Example:** `wix-integration-key-fields.tsx` — label + reveal/hide button in `flex flex-wrap items-center justify-between gap-2`.

**Overlap:** Semantically a **form field row**, not the same as `ListPanePageHeader` `compact` (which uses `h2`). If more fields need this, add **`FormFieldInlineActions`** (label slot + actions slot) to avoid drifting styles.

---

### 6. Trip workspace hero header (thumb + back + title + menu)

**Single use today:** `trip-workspace-list-pane.tsx` (large block).

**Suggestion:** Extract **`TripWorkspaceListHeroHeader`** if any other trip-scoped list needs the same chrome; until then, low priority.

---

## Lower value / defer

### 7. Passenger workspace header

`passenger-workspace-chrome.tsx` defines **`PassengerWorkspacePaneHeader`** locally — rich (avatar, status badge, chips). Only consolidate if a second passenger “workspace” shell appears.

---

### 8. Error styling variants

Some alerts use `dark:text-red-400`, others plain `text-red-600`. Unifying via **`QueryErrorAlert`** (above) would normalize dark mode.

---

## Suggested priority order

1. ~~**DetailPanePageHeader**~~ — done (see §1).
2. **Query loading/error primitives** — many call sites, small diff per file.
3. **Shared noop sort / fixed sort helpers** — pure DRY, low risk.
4. **Sticky action column helper** — DRY when adding the next kebab table.

---

## Out of scope (this repo)

- **`sitio-backend`**, **`sitio-design-notes`**, infra repos — not scanned for this report.

If you want the same audit for **backend** (e.g. repeated DTO mapping, validation), run a separate pass with Nest/Prisma patterns in mind.
