import { useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, MoreVertical, Settings2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { BooleanFilterChip } from "@/components/ui/boolean-filter-chip";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WIX_CONFIG_SELECTED_KEY } from "@/components/wix/wix-integration-config-context";
import {
  type WixPageSize,
  WixPaymentEventsTableToolbar,
} from "@/components/wix/wix-payment-events-table-toolbar";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/uuid";
import type { WixPaymentEventListItem } from "@/lib/wix-payment-event-schemas";
import { MOCK_WIX_PAYMENT_EVENT_ROWS } from "@/lib/wix-payment-events.fixtures";
import { ptBR } from "@/messages/pt-BR";

export type WixEventSortColumn = "trip" | "value" | "name" | "email" | "date";

type SortState = {
  column: WixEventSortColumn;
  direction: "asc" | "desc";
};

function formatBrl(orderTotal: string): string {
  const n = Number.parseFloat(orderTotal.replace(",", "."));
  if (Number.isNaN(n)) return orderTotal;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);
}

function formatEventDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

function buyerName(row: WixPaymentEventListItem): string {
  return `${row.event.buyerIndoFirstname} ${row.event.buyerIndoLastname}`.trim();
}

function tripCell(row: WixPaymentEventListItem): string {
  const t = row.tripTitle?.trim();
  if (t) return t;
  return ptBR.wixIntegration.noTripLabel;
}

function compareRows(
  a: WixPaymentEventListItem,
  b: WixPaymentEventListItem,
  sort: SortState,
): number {
  const dir = sort.direction === "asc" ? 1 : -1;
  switch (sort.column) {
    case "trip": {
      const at = tripCell(a);
      const bt = tripCell(b);
      return at.localeCompare(bt, "pt-BR") * dir;
    }
    case "value": {
      const av = Number.parseFloat(a.event.orderTotal.replace(",", "."));
      const bv = Number.parseFloat(b.event.orderTotal.replace(",", "."));
      const safeA = Number.isNaN(av) ? 0 : av;
      const safeB = Number.isNaN(bv) ? 0 : bv;
      if (safeA === safeB) return 0;
      return safeA < safeB ? -1 * dir : 1 * dir;
    }
    case "name":
      return buyerName(a).localeCompare(buyerName(b), "pt-BR") * dir;
    case "email":
      return (
        a.event.buyerIndoEmail.localeCompare(b.event.buyerIndoEmail, "pt-BR") *
        dir
      );
    case "date": {
      const ad = new Date(a.event.dateCreated).getTime();
      const bd = new Date(b.event.dateCreated).getTime();
      const safeA = Number.isNaN(ad) ? 0 : ad;
      const safeB = Number.isNaN(bd) ? 0 : bd;
      if (safeA === safeB) return 0;
      return safeA < safeB ? -1 * dir : 1 * dir;
    }
    default:
      return 0;
  }
}

export type WixPaymentEventsListPaneProps = {
  schoolId: string;
  /** Optional fixture override for automated tests (defaults to mock rows). */
  rowsOverride?: WixPaymentEventListItem[];
};

export function WixPaymentEventsListPane({
  schoolId,
  rowsOverride,
}: WixPaymentEventsListPaneProps) {
  const sourceRows = rowsOverride ?? MOCK_WIX_PAYMENT_EVENT_ROWS;
  const navigate = useNavigate();
  const { selectedKey } = useListDetailLayout();
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);

  const [orphanOnly, setOrphanOnly] = useState(false);
  const [sort, setSort] = useState<SortState>({
    column: "date",
    direction: "desc",
  });
  const [pageSize, setPageSize] = useState<WixPageSize>(10);
  const [pageIndex, setPageIndex] = useState(0);

  const schoolIdValid = isUuid(schoolId);

  const filtered = useMemo(() => {
    if (!orphanOnly) return sourceRows;
    return sourceRows.filter((r) => r.isOrphan);
  }, [orphanOnly, sourceRows]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => compareRows(a, b, sort));
    return copy;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  const pagedRows = useMemo(() => {
    const start = pageIndex * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, pageIndex, pageSize]);

  useEffect(() => {
    if (pageIndex > totalPages - 1) {
      setPageIndex(Math.max(0, totalPages - 1));
    }
  }, [pageIndex, totalPages]);

  useEffect(() => {
    if (!selectedKey) return;
    if (selectedKey === WIX_CONFIG_SELECTED_KEY) return;
    const allowed = new Set(filtered.map((r) => r.event.id));
    if (!allowed.has(selectedKey)) {
      void navigate({
        to: "/schools/$schoolId/integrations/wix",
        params: { schoolId },
      });
    }
  }, [filtered, selectedKey, navigate, schoolId]);

  function toggleSort(column: WixEventSortColumn) {
    setSort((prev) => {
      if (prev.column === column) {
        return {
          column,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { column, direction: "asc" };
    });
    setPageIndex(0);
  }

  function sortIcon(column: WixEventSortColumn) {
    if (sort.column !== column) return null;
    return sort.direction === "asc" ? (
      <ArrowUp className="size-3.5 shrink-0 opacity-70" aria-hidden />
    ) : (
      <ArrowDown className="size-3.5 shrink-0 opacity-70" aria-hidden />
    );
  }

  if (!schoolIdValid) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {ptBR.listDetail.invalidSchoolContext}
      </div>
    );
  }

  const emptyMessage = orphanOnly
    ? ptBR.wixIntegration.emptyOrphans
    : ptBR.wixIntegration.emptyTable;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 basis-0 flex-col gap-4 px-4 pb-4 pt-2">
      <div className="flex min-h-0 min-w-0 flex-1 basis-0 flex-col gap-4 overflow-y-auto">
        <header className="flex shrink-0 flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-medium">
                {ptBR.wixIntegration.pageTitle}
              </h1>
              <p className="text-muted-foreground text-sm">
                {ptBR.wixIntegration.pageSubtitle}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon-sm" }),
                  "shrink-0",
                )}
                aria-label={ptBR.wixIntegration.optionsMenuAria}
              >
                <MoreVertical className="size-4" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-44"
                sideOffset={4}
              >
                <DropdownMenuItem
                  onClick={() => {
                    void navigate({
                      to: "/schools/$schoolId/integrations/wix/configuration",
                      params: { schoolId },
                    });
                  }}
                >
                  <Settings2 className="size-4" aria-hidden />
                  {ptBR.wixIntegration.configureKeys}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <BooleanFilterChip
              checked={orphanOnly}
              onCheckedChange={(next) => {
                setOrphanOnly(next);
                setPageIndex(0);
              }}
            >
              {ptBR.wixIntegration.toggles.orphanOnly}
            </BooleanFilterChip>
          </div>
        </header>

        <div className="max-w-full min-h-0 overflow-x-auto rounded-md">
          <table className="w-full min-w-[800px] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="sticky top-0 z-[1] border-border border-b bg-background px-2 py-1.5 align-middle font-medium whitespace-nowrap">
                  <button
                    type="button"
                    className="inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => toggleSort("trip")}
                  >
                    {ptBR.wixIntegration.columns.trip}
                    {sortIcon("trip")}
                  </button>
                </th>
                <th className="sticky top-0 z-[1] border-border border-b bg-background px-2 py-1.5 align-middle font-medium whitespace-nowrap">
                  <button
                    type="button"
                    className="inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => toggleSort("value")}
                  >
                    {ptBR.wixIntegration.columns.value}
                    {sortIcon("value")}
                  </button>
                </th>
                <th className="sticky top-0 z-[1] border-border border-b bg-background px-2 py-1.5 align-middle font-medium whitespace-nowrap">
                  <button
                    type="button"
                    className="inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => toggleSort("name")}
                  >
                    {ptBR.wixIntegration.columns.buyerName}
                    {sortIcon("name")}
                  </button>
                </th>
                <th className="sticky top-0 z-[1] border-border border-b bg-background px-2 py-1.5 align-middle font-medium whitespace-nowrap">
                  <button
                    type="button"
                    className="inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => toggleSort("email")}
                  >
                    {ptBR.wixIntegration.columns.email}
                    {sortIcon("email")}
                  </button>
                </th>
                <th className="sticky top-0 z-[1] border-border border-b bg-background px-2 py-1.5 align-middle font-medium whitespace-nowrap">
                  <button
                    type="button"
                    className="inline-flex max-w-full items-center gap-1 whitespace-nowrap rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => toggleSort("date")}
                  >
                    {ptBR.wixIntegration.columns.date}
                    {sortIcon("date")}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="border-b border-border px-2 py-3 text-muted-foreground whitespace-nowrap"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                pagedRows.map((row, rowIndex) => {
                  const id = row.event.id;
                  const selected = selectedKey === id;
                  return (
                    <tr
                      key={id}
                      ref={(el) => {
                        rowRefs.current[rowIndex] = el;
                      }}
                      tabIndex={0}
                      className={cn(
                        "group cursor-pointer border-b border-border/80 outline-none",
                        selected
                          ? "bg-muted/50 hover:bg-muted/55"
                          : "hover:bg-muted/40",
                      )}
                      aria-selected={selected ? true : undefined}
                      aria-label={buyerName(row)}
                      onClick={() => {
                        void navigate({
                          to: "/schools/$schoolId/integrations/wix/$eventId",
                          params: { schoolId, eventId: id },
                        });
                      }}
                      onKeyDown={(ev) => {
                        const idx = pagedRows.findIndex(
                          (r) => r.event.id === id,
                        );
                        if (idx < 0) return;
                        if (ev.key === "ArrowDown") {
                          ev.preventDefault();
                          const next = Math.min(idx + 1, pagedRows.length - 1);
                          rowRefs.current[next]?.focus();
                        } else if (ev.key === "ArrowUp") {
                          ev.preventDefault();
                          const prev = Math.max(idx - 1, 0);
                          rowRefs.current[prev]?.focus();
                        } else if (ev.key === "Home") {
                          ev.preventDefault();
                          rowRefs.current[0]?.focus();
                        } else if (ev.key === "End") {
                          ev.preventDefault();
                          const last = pagedRows.length - 1;
                          rowRefs.current[last]?.focus();
                        } else if (ev.key === "Enter" || ev.key === " ") {
                          ev.preventDefault();
                          void navigate({
                            to: "/schools/$schoolId/integrations/wix/$eventId",
                            params: { schoolId, eventId: id },
                          });
                        }
                      }}
                    >
                      <td className="px-2 py-1.5 align-middle whitespace-nowrap">
                        <span className="font-medium text-foreground">
                          {tripCell(row)}
                        </span>
                        {row.isOrphan ? (
                          <span className="ml-2 shrink-0 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-amber-900 text-xs whitespace-nowrap dark:text-amber-100">
                            {ptBR.wixIntegration.orphanBadge}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-2 py-1.5 align-middle tabular-nums whitespace-nowrap">
                        {formatBrl(row.event.orderTotal)}
                      </td>
                      <td className="px-2 py-1.5 align-middle whitespace-nowrap">
                        {buyerName(row)}
                      </td>
                      <td className="px-2 py-1.5 align-middle whitespace-nowrap">
                        {row.event.buyerIndoEmail}
                      </td>
                      <td className="px-2 py-1.5 align-middle tabular-nums whitespace-nowrap">
                        {formatEventDate(row.event.dateCreated)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {sorted.length > 0 ? (
        <div className="shrink-0">
          <WixPaymentEventsTableToolbar
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPageIndex(0);
            }}
            pageIndex={pageIndex}
            totalPages={totalPages}
            onPageIndexChange={setPageIndex}
          />
        </div>
      ) : null}
    </div>
  );
}
