import { useNavigate } from "@tanstack/react-router";
import { MoreVertical, Settings2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import type { DefaultListTablePageSize } from "@/components/ui/list-table-pagination-toolbar";
import { ListTablePaginationToolbar } from "@/components/ui/list-table-pagination-toolbar";
import { SortableListTable } from "@/components/ui/sortable-list-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsoleEventTypeChips } from "@/components/wix/wix-console-event-type-chips";
import { WIX_CONFIG_SELECTED_KEY } from "@/components/wix/wix-integration-config-context";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/uuid";
import type {
  PaymentConsoleEventType,
  SchoolConsoleEventRow,
  SchoolConsoleEventType,
  TripConsoleEventRow,
  TripConsoleEventType,
} from "@/lib/wix-console-schemas";
import { MOCK_WIX_SCHOOL_CONSOLE_ROWS } from "@/lib/wix-console-school-events.fixtures";
import { MOCK_WIX_TRIP_CONSOLE_ROWS } from "@/lib/wix-console-trip-events.fixtures";
import type { WixPaymentEventListItem } from "@/lib/wix-payment-event-schemas";
import { MOCK_WIX_PAYMENT_EVENT_ROWS } from "@/lib/wix-payment-events.fixtures";
import { ptBR } from "@/messages/pt-BR";

export type WixEventSortColumn =
  | "trip"
  | "value"
  | "name"
  | "email"
  | "date"
  | "kind";

type SchoolSortColumn = "eventType" | "categoryName" | "id" | "date";
type TripSortColumn = "eventType" | "tripName" | "id" | "date";

type SortDir = "asc" | "desc";

type WixConsoleTab = "schools" | "trips" | "payments";

const ALL_SCHOOL_EVENT_TYPES = [
  "create",
  "updated",
  "deleted",
  "removedTrip",
  "addedTrip",
] as const satisfies readonly SchoolConsoleEventType[];

const ALL_TRIP_EVENT_TYPES = [
  "create",
  "updated",
  "deleted",
] as const satisfies readonly TripConsoleEventType[];

const ALL_PAYMENT_EVENT_TYPES = [
  "order_paid",
  "order_updated",
  "refund",
  "payment_failed",
] as const satisfies readonly PaymentConsoleEventType[];

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

function comparePaymentRows(
  a: WixPaymentEventListItem,
  b: WixPaymentEventListItem,
  sort: { column: WixEventSortColumn; direction: SortDir },
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
    case "kind":
      return a.integrationEventType.localeCompare(b.integrationEventType) * dir;
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

function compareSchoolRows(
  a: SchoolConsoleEventRow,
  b: SchoolConsoleEventRow,
  sort: { column: SchoolSortColumn; direction: SortDir },
): number {
  const dir = sort.direction === "asc" ? 1 : -1;
  switch (sort.column) {
    case "eventType":
      return a.eventType.localeCompare(b.eventType) * dir;
    case "categoryName":
      return (
        (a.categoryName ?? "").localeCompare(b.categoryName ?? "", "pt-BR") *
        dir
      );
    case "id":
      return a.id.localeCompare(b.id) * dir;
    case "date": {
      const ad = new Date(a.date).getTime();
      const bd = new Date(b.date).getTime();
      if (ad === bd) return 0;
      return ad < bd ? -1 * dir : 1 * dir;
    }
    default:
      return 0;
  }
}

function compareTripRows(
  a: TripConsoleEventRow,
  b: TripConsoleEventRow,
  sort: { column: TripSortColumn; direction: SortDir },
): number {
  const dir = sort.direction === "asc" ? 1 : -1;
  switch (sort.column) {
    case "eventType":
      return a.eventType.localeCompare(b.eventType) * dir;
    case "tripName":
      return (a.tripName ?? "").localeCompare(b.tripName ?? "", "pt-BR") * dir;
    case "id":
      return a.id.localeCompare(b.id) * dir;
    case "date": {
      const ad = new Date(a.date).getTime();
      const bd = new Date(b.date).getTime();
      if (ad === bd) return 0;
      return ad < bd ? -1 * dir : 1 * dir;
    }
    default:
      return 0;
  }
}

function toggleTypeFilter<T extends string>(prev: Set<T>, type: T): Set<T> {
  const next = new Set(prev);
  if (next.has(type)) {
    if (next.size <= 1) return prev;
    next.delete(type);
  } else {
    next.add(type);
  }
  return next;
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
  const sourcePaymentRows = rowsOverride ?? MOCK_WIX_PAYMENT_EVENT_ROWS;
  const navigate = useNavigate();
  const { selectedKey } = useListDetailLayout();

  const [activeTab, setActiveTab] = useState<WixConsoleTab>("payments");

  const [orphanOnly, setOrphanOnly] = useState(false);
  const [paymentSort, setPaymentSort] = useState<{
    column: WixEventSortColumn;
    direction: SortDir;
  }>({ column: "date", direction: "desc" });
  const [schoolSort, setSchoolSort] = useState<{
    column: SchoolSortColumn;
    direction: SortDir;
  }>({ column: "date", direction: "desc" });
  const [tripSort, setTripSort] = useState<{
    column: TripSortColumn;
    direction: SortDir;
  }>({ column: "date", direction: "desc" });

  const [schoolTypeFilter, setSchoolTypeFilter] = useState<
    Set<SchoolConsoleEventType>
  >(() => new Set(ALL_SCHOOL_EVENT_TYPES));
  const [tripTypeFilter, setTripTypeFilter] = useState<
    Set<TripConsoleEventType>
  >(() => new Set(ALL_TRIP_EVENT_TYPES));
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<
    Set<PaymentConsoleEventType>
  >(() => new Set(ALL_PAYMENT_EVENT_TYPES));

  const [pageSize, setPageSize] = useState<DefaultListTablePageSize>(10);
  const [pageIndex, setPageIndex] = useState(0);

  const schoolIdValid = isUuid(schoolId);

  const paymentFiltered = useMemo(() => {
    let rows = sourcePaymentRows.filter((r) =>
      paymentTypeFilter.has(r.integrationEventType),
    );
    if (orphanOnly) rows = rows.filter((r) => r.isOrphan);
    return rows;
  }, [orphanOnly, paymentTypeFilter, sourcePaymentRows]);

  const schoolFiltered = useMemo(() => {
    return MOCK_WIX_SCHOOL_CONSOLE_ROWS.filter((r) =>
      schoolTypeFilter.has(r.eventType),
    );
  }, [schoolTypeFilter]);

  const tripFiltered = useMemo(() => {
    return MOCK_WIX_TRIP_CONSOLE_ROWS.filter((r) =>
      tripTypeFilter.has(r.eventType),
    );
  }, [tripTypeFilter]);

  const sortedPayments = useMemo(() => {
    const copy = [...paymentFiltered];
    copy.sort((a, b) => comparePaymentRows(a, b, paymentSort));
    return copy;
  }, [paymentFiltered, paymentSort]);

  const sortedSchools = useMemo(() => {
    const copy = [...schoolFiltered];
    copy.sort((a, b) => compareSchoolRows(a, b, schoolSort));
    return copy;
  }, [schoolFiltered, schoolSort]);

  const sortedTrips = useMemo(() => {
    const copy = [...tripFiltered];
    copy.sort((a, b) => compareTripRows(a, b, tripSort));
    return copy;
  }, [tripFiltered, tripSort]);

  const activeSorted =
    activeTab === "payments"
      ? sortedPayments
      : activeTab === "schools"
        ? sortedSchools
        : sortedTrips;

  const totalPages = Math.max(1, Math.ceil(activeSorted.length / pageSize));

  const pagedPayments = useMemo(() => {
    const start = pageIndex * pageSize;
    return sortedPayments.slice(start, start + pageSize);
  }, [sortedPayments, pageIndex, pageSize]);

  const pagedSchools = useMemo(() => {
    const start = pageIndex * pageSize;
    return sortedSchools.slice(start, start + pageSize);
  }, [sortedSchools, pageIndex, pageSize]);

  const pagedTrips = useMemo(() => {
    const start = pageIndex * pageSize;
    return sortedTrips.slice(start, start + pageSize);
  }, [sortedTrips, pageIndex, pageSize]);

  useEffect(() => {
    if (pageIndex > totalPages - 1) {
      setPageIndex(Math.max(0, totalPages - 1));
    }
  }, [pageIndex, totalPages]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset pagination when console tab changes
  useEffect(() => {
    setPageIndex(0);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "payments") return;
    if (!selectedKey) return;
    if (selectedKey === WIX_CONFIG_SELECTED_KEY) return;
    const allowed = new Set(paymentFiltered.map((r) => r.event.id));
    if (!allowed.has(selectedKey)) {
      void navigate({
        to: "/schools/$schoolId/integrations/wix",
        params: { schoolId },
      });
    }
  }, [activeTab, paymentFiltered, selectedKey, navigate, schoolId]);

  useEffect(() => {
    if (activeTab === "payments") return;
    if (selectedKey && selectedKey !== WIX_CONFIG_SELECTED_KEY) {
      void navigate({
        to: "/schools/$schoolId/integrations/wix",
        params: { schoolId },
      });
    }
  }, [activeTab, navigate, schoolId, selectedKey]);

  const navigateToWixEvent = useCallback(
    (row: WixPaymentEventListItem) => {
      const index = sortedPayments.findIndex(
        (r) => r.event.id === row.event.id,
      );
      if (index < 0) return;
      void navigate({
        to: "/schools/$schoolId/integrations/wix/$eventId",
        params: { schoolId, eventId: row.event.id },
      });
      setPageIndex(Math.floor(index / pageSize));
    },
    [navigate, pageSize, schoolId, sortedPayments],
  );

  const selectionKeyboardNavigation = useMemo(
    () => ({
      fullRows: sortedPayments,
      selectedKey,
      onNavigateToRow: navigateToWixEvent,
    }),
    [navigateToWixEvent, selectedKey, sortedPayments],
  );

  function togglePaymentSort(column: WixEventSortColumn) {
    setPaymentSort((prev) => {
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

  function toggleSchoolSort(column: SchoolSortColumn) {
    setSchoolSort((prev) => {
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

  function toggleTripSort(column: TripSortColumn) {
    setTripSort((prev) => {
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
      <div className="p-4 text-muted-foreground text-sm">
        {ptBR.listDetail.invalidSchoolContext}
      </div>
    );
  }

  const emptyPayments =
    orphanOnly && paymentFiltered.length === 0
      ? ptBR.wixIntegration.emptyOrphans
      : ptBR.wixIntegration.emptyTable;
  const emptySchools = ptBR.wixIntegration.emptySchoolConsole;
  const emptyTrips = ptBR.wixIntegration.emptyTripConsole;

  const schoolLabels = ptBR.wixIntegration.schoolEventTypes;
  const tripLabels = ptBR.wixIntegration.tripEventTypes;
  const paymentLabels = ptBR.wixIntegration.paymentEventTypes;

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
            <div className="flex min-w-0 flex-col gap-3">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as WixConsoleTab)}
              >
                <TabsList className="w-full min-w-0 justify-start overflow-x-auto">
                  <TabsTrigger value="schools">
                    {ptBR.wixIntegration.tabs.schools}
                  </TabsTrigger>
                  <TabsTrigger value="trips">
                    {ptBR.wixIntegration.tabs.trips}
                  </TabsTrigger>
                  <TabsTrigger value="payments">
                    {ptBR.wixIntegration.tabs.payments}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                {activeTab === "schools" ? (
                  <ConsoleEventTypeChips
                    label={ptBR.wixIntegration.eventTypeFilterHint}
                    types={ALL_SCHOOL_EVENT_TYPES}
                    labels={schoolLabels}
                    selected={schoolTypeFilter}
                    onToggle={(t) =>
                      setSchoolTypeFilter((prev) => toggleTypeFilter(prev, t))
                    }
                  />
                ) : null}
                {activeTab === "trips" ? (
                  <ConsoleEventTypeChips
                    label={ptBR.wixIntegration.eventTypeFilterHint}
                    types={ALL_TRIP_EVENT_TYPES}
                    labels={tripLabels}
                    selected={tripTypeFilter}
                    onToggle={(t) =>
                      setTripTypeFilter((prev) => toggleTypeFilter(prev, t))
                    }
                  />
                ) : null}
                {activeTab === "payments" ? (
                  <>
                    <ConsoleEventTypeChips
                      label={ptBR.wixIntegration.eventTypeFilterHint}
                      types={ALL_PAYMENT_EVENT_TYPES}
                      labels={paymentLabels}
                      selected={paymentTypeFilter}
                      onToggle={(t) =>
                        setPaymentTypeFilter((prev) =>
                          toggleTypeFilter(prev, t),
                        )
                      }
                    />
                    <BooleanFilterChip
                      checked={orphanOnly}
                      onCheckedChange={(next) => {
                        setOrphanOnly(next);
                        setPageIndex(0);
                      }}
                    >
                      {ptBR.wixIntegration.toggles.orphanOnly}
                    </BooleanFilterChip>
                  </>
                ) : null}
              </div>
            </div>
          </ListPaneFilters>
        </ListPaneLead>

        {activeTab === "payments" ? (
          <SortableListTable<WixPaymentEventListItem, WixEventSortColumn>
            sort={paymentSort}
            onSortToggle={togglePaymentSort}
            rows={pagedPayments}
            getRowKey={(r) => r.event.id}
            emptyMessage={emptyPayments}
            selectedKey={selectedKey}
            selectionKeyboardNavigation={selectionKeyboardNavigation}
            rowAriaLabel={buyerName}
            onRowActivate={navigateToWixEvent}
            minWidthClassName="min-w-[880px]"
            columns={[
              {
                id: "kind",
                header: ptBR.wixIntegration.columns.integrationEventType,
                render: (row) => (
                  <span className="font-mono text-xs">
                    {paymentLabels[row.integrationEventType]}
                  </span>
                ),
              },
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
        ) : null}

        {activeTab === "schools" ? (
          <SortableListTable<SchoolConsoleEventRow, SchoolSortColumn>
            sort={schoolSort}
            onSortToggle={toggleSchoolSort}
            rows={pagedSchools}
            getRowKey={(r) => r.id}
            emptyMessage={emptySchools}
            minWidthClassName="min-w-[720px]"
            columns={[
              {
                id: "eventType",
                header: ptBR.wixIntegration.columns.eventType,
                render: (row) => (
                  <span className="font-mono text-xs">
                    {schoolLabels[row.eventType]}
                  </span>
                ),
              },
              {
                id: "categoryName",
                header: ptBR.wixIntegration.columns.categoryName,
                render: (row) =>
                  row.categoryName ? (
                    <span className="truncate">{row.categoryName}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  ),
              },
              {
                id: "id",
                header: ptBR.wixIntegration.columns.id,
                tdClassName: "font-mono text-xs",
                render: (row) => row.id,
              },
              {
                id: "date",
                header: ptBR.wixIntegration.columns.date,
                tdClassName: "tabular-nums",
                render: (row) => formatEventDate(row.date),
              },
            ]}
          />
        ) : null}

        {activeTab === "trips" ? (
          <SortableListTable<TripConsoleEventRow, TripSortColumn>
            sort={tripSort}
            onSortToggle={toggleTripSort}
            rows={pagedTrips}
            getRowKey={(r) => r.id}
            emptyMessage={emptyTrips}
            minWidthClassName="min-w-[640px]"
            columns={[
              {
                id: "eventType",
                header: ptBR.wixIntegration.columns.eventType,
                render: (row) => (
                  <span className="font-mono text-xs">
                    {tripLabels[row.eventType]}
                  </span>
                ),
              },
              {
                id: "tripName",
                header: ptBR.wixIntegration.columns.tripName,
                render: (row) =>
                  row.tripName ? (
                    <span className="truncate">{row.tripName}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  ),
              },
              {
                id: "id",
                header: ptBR.wixIntegration.columns.id,
                tdClassName: "font-mono text-xs",
                render: (row) => row.id,
              },
              {
                id: "date",
                header: ptBR.wixIntegration.columns.date,
                tdClassName: "tabular-nums",
                render: (row) => formatEventDate(row.date),
              },
            ]}
          />
        ) : null}
      </ListPaneScrollArea>

      {activeSorted.length > 0 ? (
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
