import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { shouldIgnoreForListArrowNavigation } from "@/lib/keyboard-navigation";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc";

export type SortableListTableSortState<TSortKey extends string> = {
  column: TSortKey;
  direction: SortDirection;
};

export type SortableListTableColumn<TSortKey extends string, TRow> = {
  id: TSortKey;
  header: ReactNode;
  /** When false, the column header is plain text (no sort control). Default: true */
  sortable?: boolean;
  thClassName?: string;
  tdClassName?: string;
  render: (row: TRow) => ReactNode;
};

const stickyThClass =
  "sticky top-0 z-[1] border-border border-b bg-background px-2 py-1.5 align-middle font-medium whitespace-nowrap";

const sortHeaderButtonClass =
  "inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export type SelectionKeyboardNavigation<TRow> = {
  /** Full ordered list (e.g. sorted, filtered). */
  fullRows: Array<TRow>;
  /** Active row id (typically from the list–detail shell / URL). */
  selectedKey: string | null | undefined;
  onNavigateToRow: (row: TRow) => void;
};

export type SortableListTableProps<TRow, TSortKey extends string> = {
  columns: Array<SortableListTableColumn<TSortKey, TRow>>;
  rows: Array<TRow>;
  sort: SortableListTableSortState<TSortKey>;
  onSortToggle: (column: TSortKey) => void;
  getRowKey: (row: TRow) => string;
  emptyMessage: ReactNode;
  /** When set, the matching row gets selected styling. */
  selectedKey?: string | null;
  /** Enables click + keyboard activation (Enter/Space) and row focus ring. */
  onRowActivate?: (row: TRow) => void;
  rowAriaLabel?: (row: TRow) => string;
  /** Applied to `<table>` (default matches previous list tables). */
  minWidthClassName?: string;
  className?: string;
  tableClassName?: string;
  /**
   * When a row is selected (e.g. detail pane open), ArrowUp/ArrowDown/Home/End
   * move selection across `fullRows` — works even when focus is outside the table
   * (window listener). When focus is on a row, the same navigation applies across
   * pages instead of only moving focus within the current `rows` page.
   */
  selectionKeyboardNavigation?: SelectionKeyboardNavigation<TRow>;
};

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  if (!active) return null;
  return direction === "asc" ? (
    <ArrowUp className="size-3.5 shrink-0 opacity-70" aria-hidden />
  ) : (
    <ArrowDown className="size-3.5 shrink-0 opacity-70" aria-hidden />
  );
}

export function SortableListTable<TRow, TSortKey extends string>({
  columns,
  rows,
  sort,
  onSortToggle,
  getRowKey,
  emptyMessage,
  selectedKey,
  onRowActivate,
  rowAriaLabel,
  minWidthClassName = "min-w-[800px]",
  className,
  tableClassName,
  selectionKeyboardNavigation,
}: SortableListTableProps<TRow, TSortKey>) {
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);
  const interactive = Boolean(onRowActivate);
  const nav = selectionKeyboardNavigation;
  const navRef = useRef(nav);
  navRef.current = nav;

  useEffect(() => {
    if (!nav) return;
    function onWindowKeyDown(ev: KeyboardEvent) {
      if (ev.defaultPrevented) return;
      if (shouldIgnoreForListArrowNavigation(ev.target)) return;
      if (
        ev.target instanceof HTMLElement &&
        ev.target.closest("thead") != null
      ) {
        return;
      }
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(ev.key)) return;
      const n = navRef.current;
      if (!n) return;
      const { fullRows, selectedKey: activeRowKey, onNavigateToRow } = n;
      if (activeRowKey == null || activeRowKey === "") return;
      const idx = fullRows.findIndex((r) => getRowKey(r) === activeRowKey);
      if (idx < 0) return;
      if (ev.key === "ArrowDown" && idx < fullRows.length - 1) {
        ev.preventDefault();
        onNavigateToRow(fullRows[idx + 1]);
      } else if (ev.key === "ArrowUp" && idx > 0) {
        ev.preventDefault();
        onNavigateToRow(fullRows[idx - 1]);
      } else if (ev.key === "Home" && idx > 0) {
        ev.preventDefault();
        onNavigateToRow(fullRows[0]);
      } else if (ev.key === "End" && idx < fullRows.length - 1) {
        ev.preventDefault();
        onNavigateToRow(fullRows[fullRows.length - 1]);
      }
    }
    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  }, [nav, getRowKey]);

  return (
    <div className={cn("max-w-full min-h-0 overflow-x-auto rounded-md", className)}>
      <table
        className={cn(
          "w-full border-collapse text-left text-sm",
          minWidthClassName,
          tableClassName,
        )}
      >
        <thead>
          <tr>
            {columns.map((col) => {
              const sortable = col.sortable !== false;
              return (
                <th
                  key={String(col.id)}
                  className={cn(stickyThClass, col.thClassName)}
                >
                  {sortable ? (
                    <button
                      type="button"
                      className={sortHeaderButtonClass}
                      onClick={() => onSortToggle(col.id)}
                    >
                      {col.header}
                      <SortIcon
                        active={sort.column === col.id}
                        direction={sort.direction}
                      />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="border-b border-border px-2 py-3 text-muted-foreground whitespace-nowrap"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => {
              const key = getRowKey(row);
              const selected = selectedKey === key;
              const ariaLabel = rowAriaLabel?.(row);

              return (
                <tr
                  key={key}
                  ref={(el) => {
                    rowRefs.current[rowIndex] = el;
                  }}
                  tabIndex={interactive ? 0 : undefined}
                  className={cn(
                    interactive
                      ? "group cursor-pointer border-b border-border/80 outline-none"
                      : "border-b border-border/80",
                    selected
                      ? "bg-muted/50 hover:bg-muted/55"
                      : interactive
                        ? "hover:bg-muted/40"
                        : undefined,
                  )}
                  aria-selected={interactive && selected ? true : undefined}
                  aria-label={interactive ? ariaLabel : undefined}
                  onClick={interactive ? () => onRowActivate?.(row) : undefined}
                  onKeyDown={
                    interactive
                      ? (ev) => {
                          const id = getRowKey(row);
                          if (shouldIgnoreForListArrowNavigation(ev.target)) {
                            return;
                          }
                          if (nav) {
                            // Use URL-driven selection when present so arrows stay correct
                            // even if focus remains on a different `<tr>` than the selected row.
                            const anchorKey =
                              selectedKey != null && selectedKey !== ""
                                ? selectedKey
                                : id;
                            const idx = nav.fullRows.findIndex(
                              (r) => getRowKey(r) === anchorKey,
                            );
                            if (idx < 0) return;
                            const { fullRows, onNavigateToRow } = nav;
                            if (ev.key === "ArrowDown") {
                              if (idx >= fullRows.length - 1) return;
                              ev.preventDefault();
                              ev.stopPropagation();
                              onNavigateToRow(fullRows[idx + 1]);
                            } else if (ev.key === "ArrowUp") {
                              if (idx <= 0) return;
                              ev.preventDefault();
                              ev.stopPropagation();
                              onNavigateToRow(fullRows[idx - 1]);
                            } else if (ev.key === "Home") {
                              if (idx <= 0) return;
                              ev.preventDefault();
                              ev.stopPropagation();
                              onNavigateToRow(fullRows[0]);
                            } else if (ev.key === "End") {
                              if (idx >= fullRows.length - 1) return;
                              ev.preventDefault();
                              ev.stopPropagation();
                              onNavigateToRow(
                                fullRows[fullRows.length - 1],
                              );
                            } else if (ev.key === "Enter" || ev.key === " ") {
                              ev.preventDefault();
                              ev.stopPropagation();
                              onRowActivate?.(row);
                            }
                            return;
                          }
                          const idx = rows.findIndex((r) => getRowKey(r) === id);
                          if (idx < 0) return;
                          if (ev.key === "ArrowDown") {
                            ev.preventDefault();
                            ev.stopPropagation();
                            const next = Math.min(idx + 1, rows.length - 1);
                            rowRefs.current[next]?.focus();
                          } else if (ev.key === "ArrowUp") {
                            ev.preventDefault();
                            ev.stopPropagation();
                            const prev = Math.max(idx - 1, 0);
                            rowRefs.current[prev]?.focus();
                          } else if (ev.key === "Home") {
                            ev.preventDefault();
                            ev.stopPropagation();
                            rowRefs.current[0]?.focus();
                          } else if (ev.key === "End") {
                            ev.preventDefault();
                            ev.stopPropagation();
                            const last = rows.length - 1;
                            rowRefs.current[last]?.focus();
                          } else if (ev.key === "Enter" || ev.key === " ") {
                            ev.preventDefault();
                            ev.stopPropagation();
                            onRowActivate?.(row);
                          }
                        }
                      : undefined
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.id)}
                      className={cn(
                        "px-2 py-1.5 align-middle whitespace-nowrap",
                        col.tdClassName,
                      )}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
