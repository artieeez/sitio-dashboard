import { useNavigate } from "@tanstack/react-router";
import { MoreVertical, Settings2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { WixPaymentEventListItem } from "@/lib/wix-payment-event-schemas";
import type { DefaultListTablePageSize } from "@/components/ui/list-table-pagination-toolbar";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/uuid";
import { MOCK_WIX_PAYMENT_EVENT_ROWS } from "@/lib/wix-payment-events.fixtures";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import {
  ListPaneFilters,
  ListPaneFooter,
  ListPaneLead,
  ListPanePageHeader,
  ListPaneScrollArea,
  ListPaneShell,
} from "@/components/layout/list-pane-layout";
import { BooleanFilterChip } from "@/components/ui/boolean-filter-chip";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListTablePaginationToolbar } from "@/components/ui/list-table-pagination-toolbar";
import { SortableListTable } from "@/components/ui/sortable-list-table";
import { WIX_CONFIG_SELECTED_KEY } from "@/components/wix/wix-integration-config-context";
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
  rowsOverride?: Array<WixPaymentEventListItem>;
};

export function WixPaymentEventsListPane({
  schoolId,
  rowsOverride,
}: WixPaymentEventsListPaneProps) {
  const sourceRows = rowsOverride ?? MOCK_WIX_PAYMENT_EVENT_ROWS;
  const navigate = useNavigate();
  const { selectedKey } = useListDetailLayout();

  const [orphanOnly, setOrphanOnly] = useState(false);
  const [sort, setSort] = useState<SortState>({
    column: "date",
    direction: "desc",
  });
  const [pageSize, setPageSize] = useState<DefaultListTablePageSize>(10);
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

  const navigateToWixEvent = useCallback(
    (row: WixPaymentEventListItem) => {
      const index = sorted.findIndex((r) => r.event.id === row.event.id);
      if (index < 0) return;
      void navigate({
        to: "/schools/$schoolId/integrations/wix/$eventId",
        params: { schoolId, eventId: row.event.id },
      });
      setPageIndex(Math.floor(index / pageSize));
    },
    [navigate, pageSize, schoolId, sorted],
  );

  const selectionKeyboardNavigation = useMemo(
    () => ({
      fullRows: sorted,
      selectedKey,
      onNavigateToRow: navigateToWixEvent,
    }),
    [navigateToWixEvent, selectedKey, sorted],
  );

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
    <ListPaneShell>
      <ListPaneScrollArea>
        <ListPaneLead>
          <ListPanePageHeader
            title={ptBR.wixIntegration.pageTitle}
            subtitle={ptBR.wixIntegration.pageSubtitle}
            menu={
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
            }
          />
          <ListPaneFilters>
            <BooleanFilterChip
              checked={orphanOnly}
              onCheckedChange={(next) => {
                setOrphanOnly(next);
                setPageIndex(0);
              }}
            >
              {ptBR.wixIntegration.toggles.orphanOnly}
            </BooleanFilterChip>
          </ListPaneFilters>
        </ListPaneLead>

        <SortableListTable<WixPaymentEventListItem, WixEventSortColumn>
          sort={sort}
          onSortToggle={toggleSort}
          rows={pagedRows}
          getRowKey={(r) => r.event.id}
          emptyMessage={emptyMessage}
          selectedKey={selectedKey}
          selectionKeyboardNavigation={selectionKeyboardNavigation}
          rowAriaLabel={buyerName}
          onRowActivate={navigateToWixEvent}
          columns={[
            {
              id: "trip",
              header: ptBR.wixIntegration.columns.trip,
              render: (row) => (
                <>
                  <span className="font-medium text-foreground">
                    {tripCell(row)}
                  </span>
                  {row.isOrphan ? (
                    <span className="ml-2 shrink-0 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-amber-900 text-xs whitespace-nowrap dark:text-amber-100">
                      {ptBR.wixIntegration.orphanBadge}
                    </span>
                  ) : null}
                </>
              ),
            },
            {
              id: "value",
              header: ptBR.wixIntegration.columns.value,
              tdClassName: "tabular-nums",
              render: (row) => formatBrl(row.event.orderTotal),
            },
            {
              id: "name",
              header: ptBR.wixIntegration.columns.buyerName,
              render: (row) => buyerName(row),
            },
            {
              id: "email",
              header: ptBR.wixIntegration.columns.email,
              render: (row) => row.event.buyerIndoEmail,
            },
            {
              id: "date",
              header: ptBR.wixIntegration.columns.date,
              tdClassName: "tabular-nums",
              render: (row) => formatEventDate(row.event.dateCreated),
            },
          ]}
        />
      </ListPaneScrollArea>

      {sorted.length > 0 ? (
        <ListPaneFooter>
          <ListTablePaginationToolbar
            labels={ptBR.listTable.pagination}
            pageSize={pageSize}
            onPageSizeChange={(size) => {
              setPageSize(size as DefaultListTablePageSize);
              setPageIndex(0);
            }}
            pageIndex={pageIndex}
            totalPages={totalPages}
            onPageIndexChange={setPageIndex}
          />
        </ListPaneFooter>
      ) : null}
    </ListPaneShell>
  );
}
