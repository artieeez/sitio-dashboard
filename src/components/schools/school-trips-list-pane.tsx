import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useCallback, useMemo } from "react";
import { z } from "zod";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import {
  ListPaneFilters,
  ListPaneLead,
  ListPanePageHeader,
  ListPaneScrollArea,
  ListPaneShell,
} from "@/components/layout/list-pane-layout";
import { TripWorkspaceListOptionsMenu } from "@/components/trips/trip-workspace-list-options-menu";
import { BooleanFilterChip } from "@/components/ui/boolean-filter-chip";
import { buttonVariants } from "@/components/ui/button";
import type { SortableListTableSortState } from "@/components/ui/sortable-list-table";
import { SortableListTable } from "@/components/ui/sortable-list-table";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { type Trip, tripSchema } from "@/lib/schemas/trip";
import {
  tableStickyActionSelected,
  tableStickyActionUnselected,
} from "@/lib/table-sticky-action-surface";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

type SchoolTripsListPaneProps = {
  schoolId: string;
};

function formatTripCreatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(d);
}

function tripTitle(t: Trip): string {
  return t.title?.trim() || `${ptBR.entities.trip} ${t.id.slice(0, 8)}…`;
}

type TripTableSortColumn = "thumb" | "title" | "created" | "actions";

function noopSort(_column: TripTableSortColumn) {
  return;
}

/**
 * Trips collection for the M3 list pane under `/schools/$schoolId/trips` (004).
 * Table via `SortableListTable` (image, title, created, sticky kebab)—aligned with schools directory.
 */
function navigateToSchoolTripPassengers(
  navigate: ReturnType<typeof useNavigate>,
  schoolId: string,
  tripId: string,
) {
  void navigate({
    to: "/schools/$schoolId/trips/$tripId/passengers",
    params: { schoolId, tripId },
  });
}

export function SchoolTripsListPane({ schoolId }: SchoolTripsListPaneProps) {
  const navigate = useNavigate();
  const { selectedKey } = useListDetailLayout();
  const includeInactive = useUiPreferencesStore((s) => s.includeInactiveTrips);
  const setIncludeInactive = useUiPreferencesStore(
    (s) => s.setIncludeInactiveTrips,
  );
  const schoolIdValid = isUuid(schoolId);

  const tripsQuery = useQuery({
    queryKey: queryKeys.trips(schoolId, includeInactive),
    queryFn: async () => {
      const q = includeInactive ? "?includeInactive=true" : "";
      const raw = await apiJson<unknown>(`/schools/${schoolId}/trips${q}`);
      return z.array(tripSchema).parse(raw);
    },
    enabled: schoolIdValid,
  });

  const rows = tripsQuery.data ?? [];

  const sortState = useMemo<SortableListTableSortState<TripTableSortColumn>>(
    () => ({ column: "title", direction: "asc" }),
    [],
  );

  const navigateToTripRow = useCallback(
    (t: Trip) => {
      navigateToSchoolTripPassengers(navigate, schoolId, t.id);
    },
    [navigate, schoolId],
  );

  const selectionKeyboardNavigation = useMemo(() => {
    if (
      selectedKey == null ||
      selectedKey === "" ||
      selectedKey === "__new__" ||
      rows.length === 0
    ) {
      return undefined;
    }
    return {
      fullRows: rows,
      selectedKey,
      onNavigateToRow: navigateToTripRow,
    };
  }, [rows, selectedKey, navigateToTripRow]);

  const columns = useMemo(
    () => [
      {
        id: "thumb" as const,
        header: null,
        sortable: false,
        thClassName: "w-14 min-w-14 pl-2",
        tdClassName: "whitespace-nowrap pr-2",
        render: (t: Trip) =>
          t.imageUrl?.trim() ? (
            <img
              src={t.imageUrl}
              alt=""
              className="size-10 shrink-0 rounded-md object-cover"
            />
          ) : (
            <span
              className="inline-block size-10 shrink-0 rounded-md border border-dashed border-border bg-muted/40"
              aria-hidden
            />
          ),
      },
      {
        id: "title" as const,
        header: ptBR.fields.title,
        sortable: false,
        tdClassName: "whitespace-normal",
        render: (t: Trip) => (
          <>
            <span className="font-medium text-foreground">{tripTitle(t)}</span>
            {!t.active ? (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({ptBR.fields.inactive})
              </span>
            ) : null}
          </>
        ),
      },
      {
        id: "created" as const,
        header: ptBR.fields.createdAt,
        sortable: false,
        tdClassName: "tabular-nums whitespace-nowrap",
        render: (t: Trip) => formatTripCreatedAt(t.createdAt),
      },
      {
        id: "actions" as const,
        header: <span className="sr-only">{ptBR.aria.rowMenu}</span>,
        sortable: false,
        thClassName:
          "sticky right-0 top-0 z-[3] w-11 min-w-11 bg-background text-right font-medium",
        tdClassName:
          "sticky right-0 z-[2] w-11 min-w-11 !p-0 whitespace-nowrap align-middle",
        render: (t: Trip) => (
          // biome-ignore lint/a11y/noStaticElementInteractions: absorbs pointer events so row <tr> does not activate
          // biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation only; menu items handle keyboard
          <div
            className="flex h-full justify-end px-2 py-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                selectedKey === t.id
                  ? tableStickyActionSelected
                  : tableStickyActionUnselected,
                "pointer-events-auto rounded-sm py-0.5",
              )}
            >
              <TripWorkspaceListOptionsMenu
                tripId={t.id}
                schoolId={schoolId}
                showViewPassengers
              />
            </div>
          </div>
        ),
      },
    ],
    [schoolId, selectedKey],
  );

  if (!schoolIdValid) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {ptBR.listDetail.invalidSchoolContext}
      </div>
    );
  }

  return (
    <ListPaneShell>
      <ListPaneScrollArea>
        <ListPaneLead>
          <ListPanePageHeader
            title={ptBR.entities.trips}
            menu={
              <Link
                to="/schools/$schoolId/trips/new"
                params={{ schoolId }}
                aria-label={ptBR.actions.addTrip}
                aria-current={selectedKey === "__new__" ? true : undefined}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-fit gap-1 no-underline",
                  selectedKey === "__new__" && "ring-2 ring-ring ring-offset-2",
                )}
              >
                <Plus className="size-4 shrink-0" aria-hidden />
                {ptBR.actions.addTrip}
              </Link>
            }
          />
          <ListPaneFilters>
            <BooleanFilterChip
              checked={includeInactive}
              onCheckedChange={setIncludeInactive}
            >
              {ptBR.toggles.includeInactiveTrips}
            </BooleanFilterChip>
          </ListPaneFilters>
        </ListPaneLead>

        {tripsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : tripsQuery.isError ? (
          <p className="text-sm text-red-600" role="alert">
            Não foi possível carregar as viagens.
          </p>
        ) : (
          <SortableListTable<Trip, TripTableSortColumn>
            sort={sortState}
            onSortToggle={noopSort}
            rows={rows}
            getRowKey={(t) => t.id}
            emptyMessage={ptBR.emptyStates.trips}
            selectedKey={selectedKey}
            rowAriaLabel={tripTitle}
            onRowActivate={navigateToTripRow}
            selectionKeyboardNavigation={selectionKeyboardNavigation}
            minWidthClassName="min-w-[480px]"
            columns={columns}
          />
        )}
      </ListPaneScrollArea>
    </ListPaneShell>
  );
}
