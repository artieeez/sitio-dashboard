import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ptBR } from "@/messages/pt-BR";

const PAGE_SIZES = [10, 25, 100] as const;

export type WixPageSize = (typeof PAGE_SIZES)[number];

export type WixPaymentEventsTableToolbarProps = {
  pageSize: WixPageSize;
  onPageSizeChange: (size: WixPageSize) => void;
  pageIndex: number;
  totalPages: number;
  onPageIndexChange: (index: number) => void;
};

export function WixPaymentEventsTableToolbar({
  pageSize,
  onPageSizeChange,
  pageIndex,
  totalPages,
  onPageIndexChange,
}: WixPaymentEventsTableToolbarProps) {
  const safeTotal = Math.max(1, totalPages);
  const current = Math.min(pageIndex + 1, safeTotal);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">
          {ptBR.wixIntegration.pagination.pageSize}
        </span>
        <select
          className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={pageSize}
          onChange={(e) =>
            onPageSizeChange(Number(e.target.value) as WixPageSize)
          }
        >
          {PAGE_SIZES.map((n) => (
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
          aria-label={ptBR.wixIntegration.pagination.prev}
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Button>
        <span className="min-w-0 shrink text-center text-muted-foreground text-sm tabular-nums">
          <span className="sr-only">
            {ptBR.wixIntegration.pagination.pageOfAria(current, safeTotal)}
          </span>
          <span aria-hidden="true">
            {ptBR.wixIntegration.pagination.pageOf(current, safeTotal)}
          </span>
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          disabled={pageIndex >= safeTotal - 1}
          onClick={() => onPageIndexChange(pageIndex + 1)}
          aria-label={ptBR.wixIntegration.pagination.next}
        >
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
