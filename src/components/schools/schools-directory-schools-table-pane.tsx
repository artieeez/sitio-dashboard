import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { z } from "zod";
import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import {
  ListPaneFilters,
  ListPaneLead,
  ListPanePageHeader,
  ListPaneScrollArea,
  ListPaneShell,
} from "@/components/layout/list-pane-layout";
import { DeleteSchoolDialog } from "@/components/schools/delete-school-dialog";
import { BooleanFilterChip } from "@/components/ui/boolean-filter-chip";
import { buttonVariants } from "@/components/ui/button";
import { RowKebabMenu } from "@/components/ui/row-kebab-menu";
import type { SortableListTableSortState } from "@/components/ui/sortable-list-table";
import { SortableListTable } from "@/components/ui/sortable-list-table";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { School } from "@/lib/schemas/school";
import { schoolSchema } from "@/lib/schemas/school";
import {
  tableStickyActionCellBackdropSelected,
  tableStickyActionCellBackdropUnselected,
  tableStickyActionEdge,
  tableStickyActionSelected,
  tableStickyActionUnselected,
} from "@/lib/table-sticky-action-surface";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

function formatSchoolCreatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(d);
}

function schoolTitle(s: School): string {
  return s.title?.trim() || `${ptBR.entities.school} ${s.id.slice(0, 8)}…`;
}

function navigateToSchoolTrips(
  navigate: ReturnType<typeof useNavigate>,
  schoolId: string,
) {
  void navigate({
    to: "/schools/$schoolId/trips",
    params: { schoolId },
  });
}

/** Row click: trips from directory; stay on `/schools/$id/edit` when the table is shown next to school edit. */
function navigateFromSchoolTableRowClick(
  navigate: ReturnType<typeof useNavigate>,
  schoolId: string,
  keepSchoolEditRoute: boolean,
) {
  if (keepSchoolEditRoute) {
    void navigate({
      to: "/schools/$schoolId/edit",
      params: { schoolId },
    });
    return;
  }
  navigateToSchoolTrips(navigate, schoolId);
}

type SchoolTableSortColumn = "thumb" | "title" | "created" | "actions";

function noopSort(_column: SchoolTableSortColumn) {
  return;
}

export type SchoolsDirectorySchoolsTablePaneProps = {
  /**
   * When set, marks the current school row and makes **row click / Enter / Space**
   * navigate to `/schools/$schoolId/edit` (switch school while staying on edit)
   * instead of opening trips.
   */
  highlightSchoolId?: string;
};

/**
 * Schools table in the **left** list pane for the schools directory (`/schools`,
 * `/schools/`, `/schools/new`) and for **school edit** under `/schools/$schoolId/edit`.
 * Layout matches list-pane primitives + `SortableListTable` (image, title, created, sticky kebab).
 */
export function SchoolsDirectorySchoolsTablePane({
  highlightSchoolId,
}: SchoolsDirectorySchoolsTablePaneProps) {
  const navigate = useNavigate();
  const { selectedKey, requestSelect } = useListDetailLayout();
  const includeInactive = useUiPreferencesStore(
    (s) => s.includeInactiveSchools,
  );
  const setIncludeInactive = useUiPreferencesStore(
    (s) => s.setIncludeInactiveSchools,
  );

  const [schoolPendingDelete, setSchoolPendingDelete] = useState<School | null>(
    null,
  );

  const schoolsQuery = useQuery({
    queryKey: queryKeys.schools(includeInactive),
    queryFn: async () => {
      const q = includeInactive ? "?includeInactive=true" : "";
      const raw = await apiJson<unknown>(`/schools${q}`);
      return z.array(schoolSchema).parse(raw);
    },
  });

  const rows = schoolsQuery.data ?? [];
  const rowClickKeepsSchoolEdit = highlightSchoolId !== undefined;

  const sortState = useMemo<SortableListTableSortState<SchoolTableSortColumn>>(
    () => ({ column: "title", direction: "asc" }),
    [],
  );

  const navigateToSchoolRow = useCallback(
    (s: School) => {
      navigateFromSchoolTableRowClick(navigate, s.id, rowClickKeepsSchoolEdit);
    },
    [navigate, rowClickKeepsSchoolEdit],
  );

  const selectionKeyboardNavigation = useMemo(() => {
    if (highlightSchoolId == null || rows.length === 0) return undefined;
    return {
      fullRows: rows,
      selectedKey: highlightSchoolId,
      onNavigateToRow: navigateToSchoolRow,
    };
  }, [highlightSchoolId, navigateToSchoolRow, rows]);

  const columns = useMemo(
    () => [
      {
        id: "thumb" as const,
        header: null,
        sortable: false,
        thClassName: "w-14 min-w-14 pl-2",
        tdClassName: "whitespace-nowrap pr-2",
        render: (s: School) => {
          const image = s.imageUrl?.trim();
          const favicon = s.faviconUrl?.trim();
          if (image) {
            return (
              <img
                src={image}
                alt=""
                className="size-10 shrink-0 rounded-md object-cover"
              />
            );
          }
          if (favicon) {
            return (
              <img
                src={favicon}
                alt=""
                className="size-10 shrink-0 rounded-md bg-muted/40 object-contain p-1.5"
              />
            );
          }
          return (
            <span
              className="inline-block size-10 shrink-0 rounded-md border border-dashed border-border bg-muted/40"
              aria-hidden
            />
          );
        },
      },
      {
        id: "title" as const,
        header: ptBR.fields.title,
        sortable: false,
        tdClassName: "whitespace-normal",
        render: (s: School) => (
          <>
            <span className="font-medium text-foreground">
              {schoolTitle(s)}
            </span>
            {!s.active ? (
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
        render: (s: School) => formatSchoolCreatedAt(s.createdAt),
      },
      {
        id: "actions" as const,
        header: <span className="sr-only">{ptBR.aria.rowMenu}</span>,
        sortable: false,
        thClassName: cn(
          "sticky right-0 top-0 z-[3] w-11 min-w-11 bg-background text-right font-medium",
          tableStickyActionEdge,
        ),
        tdClassName: cn(
          "sticky right-0 z-[2] w-11 min-w-11 !p-0 whitespace-nowrap align-middle",
          tableStickyActionEdge,
        ),
        render: (s: School) => {
          const rowHighlighted =
            (highlightSchoolId !== undefined && s.id === highlightSchoolId) ||
            s.id === selectedKey;
          return (
            // biome-ignore lint/a11y/noStaticElementInteractions: absorbs pointer events so row <tr> does not activate
            // biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation only; menu items handle keyboard
            <div
              className={cn(
                "flex justify-end px-2 py-1.5",
                rowHighlighted
                  ? tableStickyActionCellBackdropSelected
                  : tableStickyActionCellBackdropUnselected,
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={cn(
                  rowHighlighted
                    ? tableStickyActionSelected
                    : tableStickyActionUnselected,
                  "pointer-events-auto rounded-sm py-0.5",
                )}
              >
                <RowKebabMenu
                  ariaLabel={ptBR.aria.rowMenu}
                  items={[
                    {
                      id: "view",
                      label: ptBR.actions.viewSchool,
                      onClick: () => requestSelect(s.id),
                    },
                    {
                      id: "edit",
                      label: ptBR.actions.edit,
                      onClick: () => {
                        void navigate({
                          to: "/schools/$schoolId/edit",
                          params: { schoolId: s.id },
                        });
                      },
                    },
                    {
                      id: "trips",
                      label: ptBR.actions.viewTrips,
                      onClick: () => navigateToSchoolTrips(navigate, s.id),
                    },
                    {
                      id: "delete",
                      label: ptBR.actions.delete,
                      destructive: true,
                      onClick: () => {
                        setSchoolPendingDelete(s);
                      },
                    },
                  ]}
                />
              </div>
            </div>
          );
        },
      },
    ],
    [highlightSchoolId, navigate, requestSelect, selectedKey],
  );

  return (
    <ListPaneShell>
      <DeleteSchoolDialog
        open={schoolPendingDelete != null}
        onOpenChange={(next) => {
          if (!next) {
            setSchoolPendingDelete(null);
          }
        }}
        school={schoolPendingDelete}
        includeInactive={includeInactive}
      />
      <ListPaneScrollArea>
        <ListPaneLead>
          <ListPanePageHeader
            title={ptBR.entities.schools}
            menu={
              <Link
                to="/schools/new"
                aria-label={`${ptBR.actions.create} ${ptBR.entities.school}`}
                aria-current={selectedKey === "__new__" ? true : undefined}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-fit gap-1 no-underline",
                )}
              >
                <Plus className="size-4 shrink-0" aria-hidden />
                {ptBR.actions.create} {ptBR.entities.school}
              </Link>
            }
          />
          <ListPaneFilters>
            <BooleanFilterChip
              checked={includeInactive}
              onCheckedChange={setIncludeInactive}
            >
              {ptBR.toggles.includeInactiveSchools}
            </BooleanFilterChip>
          </ListPaneFilters>
        </ListPaneLead>

        {schoolsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : schoolsQuery.isError ? (
          <p className="text-sm text-red-600" role="alert">
            Não foi possível carregar as escolas.
          </p>
        ) : (
          <SortableListTable<School, SchoolTableSortColumn>
            sort={sortState}
            onSortToggle={noopSort}
            rows={rows}
            getRowKey={(s) => s.id}
            emptyMessage={ptBR.emptyStates.schools}
            selectedKey={highlightSchoolId ?? null}
            isRowHighlighted={(s) =>
              (highlightSchoolId !== undefined && s.id === highlightSchoolId) ||
              s.id === selectedKey
            }
            rowAriaLabel={schoolTitle}
            onRowActivate={navigateToSchoolRow}
            selectionKeyboardNavigation={selectionKeyboardNavigation}
            minWidthClassName="min-w-[480px]"
            columns={columns}
          />
        )}
      </ListPaneScrollArea>
    </ListPaneShell>
  );
}
