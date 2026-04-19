import { useCallback, useMemo } from "react";
import { ListPaneFilters } from "@/components/layout/list-pane-layout";
import { BooleanFilterChip } from "@/components/ui/boolean-filter-chip";
import type { SortableListTableSortState } from "@/components/ui/sortable-list-table";
import { SortableListTable } from "@/components/ui/sortable-list-table";
import {
  passengerPaymentStatusLabel,
  passengerPaymentStatusToneClass,
} from "@/lib/passenger-payment-status";
import type { PassengerWithStatus } from "@/lib/schemas/passenger";
import { ptBR } from "@/messages/pt-BR";

type PassengerTableSortColumn = "name" | "cpf" | "status";

function noopSort(_column: PassengerTableSortColumn) {
  return;
}

export function PassengerTable(props: {
  rows: PassengerWithStatus[];
  includeRemoved: boolean;
  onIncludeRemovedChange: (value: boolean) => void;
  /** When set, highlights the row for the passenger payments context (M3 list pane). */
  selectedPassengerId?: string | null;
  /** When set, row click and arrow keys move the detail pane (same pattern as school trips list). */
  onPassengerRowNavigate?: (passengerId: string) => void;
}) {
  const {
    rows,
    includeRemoved,
    onIncludeRemovedChange,
    selectedPassengerId = null,
    onPassengerRowNavigate,
  } = props;

  const sortState = useMemo<
    SortableListTableSortState<PassengerTableSortColumn>
  >(() => ({ column: "name", direction: "asc" }), []);

  const navigateToPassengerRow = useCallback(
    (p: PassengerWithStatus) => {
      onPassengerRowNavigate?.(p.id);
    },
    [onPassengerRowNavigate],
  );

  const selectionKeyboardNavigation = useMemo(() => {
    if (!onPassengerRowNavigate) return undefined;
    if (
      selectedPassengerId == null ||
      selectedPassengerId === "" ||
      rows.length === 0
    ) {
      return undefined;
    }
    return {
      fullRows: rows,
      selectedKey: selectedPassengerId,
      onNavigateToRow: navigateToPassengerRow,
    };
  }, [
    rows,
    selectedPassengerId,
    onPassengerRowNavigate,
    navigateToPassengerRow,
  ]);

  const columns = useMemo(
    () => [
      {
        id: "name" as const,
        header: ptBR.fields.name,
        sortable: false,
        thClassName: "whitespace-normal",
        tdClassName: "whitespace-nowrap",
        render: (p: PassengerWithStatus) => (
          <>
            {p.fullName}
            {p.removedAt ? (
              <span className="ml-2 text-xs text-muted-foreground">
                ({ptBR.fields.removedPassenger})
              </span>
            ) : null}
          </>
        ),
      },
      {
        id: "cpf" as const,
        header: ptBR.fields.cpf,
        sortable: false,
        tdClassName: "tabular-nums whitespace-nowrap",
        render: (p: PassengerWithStatus) => p.cpf ?? "—",
      },
      {
        id: "status" as const,
        header: ptBR.fields.paymentStatus,
        sortable: false,
        tdClassName: "whitespace-nowrap",
        render: (p: PassengerWithStatus) => (
          <span className={passengerPaymentStatusToneClass(p.status)}>
            {passengerPaymentStatusLabel(p.status)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-3">
      <ListPaneFilters>
        <BooleanFilterChip
          checked={includeRemoved}
          onCheckedChange={onIncludeRemovedChange}
        >
          {ptBR.toggles.includeRemovedPassengers}
        </BooleanFilterChip>
      </ListPaneFilters>
      <SortableListTable<PassengerWithStatus, PassengerTableSortColumn>
        sort={sortState}
        onSortToggle={noopSort}
        rows={rows}
        getRowKey={(p) => p.id}
        emptyMessage={`${ptBR.entities.passengers} — nenhum registro.`}
        selectedKey={selectedPassengerId}
        rowAriaLabel={(p) => p.fullName}
        onRowActivate={
          onPassengerRowNavigate ? navigateToPassengerRow : undefined
        }
        selectionKeyboardNavigation={selectionKeyboardNavigation}
        minWidthClassName="min-w-[24rem]"
        columns={columns}
      />
    </div>
  );
}
