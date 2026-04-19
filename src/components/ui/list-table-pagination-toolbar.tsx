import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const DEFAULT_LIST_TABLE_PAGE_SIZES = [10, 25, 100] as const;

export type DefaultListTablePageSize =
  (typeof DEFAULT_LIST_TABLE_PAGE_SIZES)[number];

export type ListTablePaginationLabels = {
  pageSize: string;
  prev: string;
  next: string;
  pageOf: (page: number, totalPages: number) => string;
  pageOfAria: (page: number, totalPages: number) => string;
};

export type ListTablePaginationToolbarProps = {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  pageIndex: number;
  totalPages: number;
  onPageIndexChange: (index: number) => void;
  labels: ListTablePaginationLabels;
  /** Options shown in the page-size select (must include the current `pageSize`). */
  pageSizes?: ReadonlyArray<number>;
  className?: string;
};

export function ListTablePaginationToolbar({
  pageSize,
  onPageSizeChange,
  pageIndex,
  totalPages,
  onPageIndexChange,
  labels,
  pageSizes = DEFAULT_LIST_TABLE_PAGE_SIZES,
  className,
}: ListTablePaginationToolbarProps) {
  const safeTotal = Math.max(1, totalPages);
  const current = Math.min(pageIndex + 1, safeTotal);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className,
      )}
    >
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{labels.pageSize}</span>
        <select
          className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {pageSizes.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          disabled={pageIndex <= 0}
          onClick={() => onPageIndexChange(pageIndex - 1)}
          aria-label={labels.prev}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Button>
        <span className="min-w-0 shrink text-center text-muted-foreground text-sm tabular-nums">
          <span className="sr-only">
            {labels.pageOfAria(current, safeTotal)}
          </span>
          <span aria-hidden="true">
            {labels.pageOf(current, safeTotal)}
          </span>
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          disabled={pageIndex >= safeTotal - 1}
          onClick={() => onPageIndexChange(pageIndex + 1)}
          aria-label={labels.next}
        >
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
