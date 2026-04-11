import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useRef } from "react";
import { z } from "zod";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { BooleanFilterChip } from "@/components/ui/boolean-filter-chip";
import { buttonVariants } from "@/components/ui/button";
import { RowKebabMenu } from "@/components/ui/row-kebab-menu";
import { apiDelete, apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { type School, schoolSchema } from "@/lib/schemas/school";
import {
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

export type SchoolsDirectorySchoolsTablePaneProps = {
  /** Highlight this row (e.g. school open for edit in the detail pane). */
  highlightSchoolId?: string;
};

/**
 * Schools table in the **left** list pane for the schools directory (`/schools`,
 * `/schools/`, `/schools/new`) and for **school edit** under `/schools/$schoolId/edit`.
 * Layout matches `SchoolTripsListPane` (image, title, created date, sticky kebab).
 */
export function SchoolsDirectorySchoolsTablePane({
  highlightSchoolId,
}: SchoolsDirectorySchoolsTablePaneProps) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { selectedKey, requestSelect } = useListDetailLayout();
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);
  const includeInactive = useUiPreferencesStore(
    (s) => s.includeInactiveSchools,
  );
  const setIncludeInactive = useUiPreferencesStore(
    (s) => s.setIncludeInactiveSchools,
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

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-medium">{ptBR.entities.schools}</h1>
          <Link
            to="/schools/new"
            aria-label={`${ptBR.actions.create} ${ptBR.entities.school}`}
            aria-current={selectedKey === "__new__" ? true : undefined}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-fit gap-1 no-underline",
              selectedKey === "__new__" && "ring-2 ring-ring ring-offset-2",
            )}
          >
            <Plus className="size-4 shrink-0" aria-hidden />
            {ptBR.actions.create} {ptBR.entities.school}
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BooleanFilterChip
            checked={includeInactive}
            onCheckedChange={setIncludeInactive}
          >
            {ptBR.toggles.includeInactiveSchools}
          </BooleanFilterChip>
        </div>
      </header>

      {schoolsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : schoolsQuery.isError ? (
        <p className="text-sm text-red-600" role="alert">
          Não foi possível carregar as escolas.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md">
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="w-14 min-w-14 px-2 py-1.5" aria-hidden />
                <th className="px-2 py-1.5 font-medium whitespace-normal">
                  {ptBR.fields.title}
                </th>
                <th className="px-2 py-1.5 font-medium whitespace-normal">
                  {ptBR.fields.createdAt}
                </th>
                <th className="sticky right-0 z-[3] w-11 min-w-11 bg-background px-2 py-1.5 text-right font-medium whitespace-normal">
                  <span className="sr-only">{ptBR.aria.rowMenu}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="border-b border-border px-2 py-3 text-muted-foreground whitespace-nowrap"
                  >
                    {ptBR.emptyStates.schools}
                  </td>
                </tr>
              ) : (
                rows.map((s, rowIndex) => {
                  const rowHighlighted =
                    highlightSchoolId === s.id || selectedKey === s.id;
                  return (
                    <tr
                      key={s.id}
                      ref={(el) => {
                        rowRefs.current[rowIndex] = el;
                      }}
                      tabIndex={0}
                      className={cn(
                        "group cursor-pointer border-b border-border/80 outline-none",
                        rowHighlighted
                          ? "bg-muted/50 hover:bg-muted/55"
                          : "hover:bg-muted/40",
                      )}
                      aria-selected={rowHighlighted ? true : undefined}
                      aria-label={schoolTitle(s)}
                      onClick={() => navigateToSchoolTrips(navigate, s.id)}
                      onKeyDown={(ev) => {
                        const idx = rows.findIndex((row) => row.id === s.id);
                        if (idx < 0) return;
                        if (ev.key === "ArrowDown") {
                          ev.preventDefault();
                          const next = Math.min(idx + 1, rows.length - 1);
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
                          const last = rows.length - 1;
                          rowRefs.current[last]?.focus();
                        } else if (ev.key === "Enter" || ev.key === " ") {
                          ev.preventDefault();
                          navigateToSchoolTrips(navigate, s.id);
                        }
                      }}
                    >
                      <td className="px-2 py-1.5 align-middle whitespace-nowrap">
                        {s.imageUrl?.trim() ? (
                          <img
                            src={s.imageUrl}
                            alt=""
                            className="size-10 shrink-0 rounded-md object-cover"
                          />
                        ) : (
                          <span
                            className="inline-block size-10 shrink-0 rounded-md border border-dashed border-border bg-muted/40"
                            aria-hidden
                          />
                        )}
                      </td>
                      <td className="px-2 py-1.5 align-middle">
                        <span className="font-medium text-foreground">
                          {schoolTitle(s)}
                        </span>
                        {!s.active ? (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            ({ptBR.fields.inactive})
                          </span>
                        ) : null}
                      </td>
                      <td className="px-2 py-1.5 align-middle tabular-nums whitespace-nowrap">
                        {formatSchoolCreatedAt(s.createdAt)}
                      </td>
                      {/* biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation only; menu handles keyboard */}
                      <td
                        className={cn(
                          "sticky right-0 z-[2] w-11 min-w-11 cursor-default px-2 py-1.5 align-middle whitespace-nowrap",
                          rowHighlighted
                            ? tableStickyActionSelected
                            : tableStickyActionUnselected,
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-end">
                          <RowKebabMenu ariaLabel={ptBR.aria.rowMenu}>
                            <button
                              type="button"
                              role="menuitem"
                              className="rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                              onClick={() => requestSelect(s.id)}
                            >
                              {ptBR.actions.viewSchool}
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              className="rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                              onClick={() => {
                                void navigate({
                                  to: "/schools/$schoolId/edit",
                                  params: { schoolId: s.id },
                                });
                              }}
                            >
                              {ptBR.actions.edit}
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              className="rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                              onClick={() =>
                                navigateToSchoolTrips(navigate, s.id)
                              }
                            >
                              {ptBR.actions.viewTrips}
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              className="rounded px-2 py-1.5 text-left text-sm text-destructive hover:bg-muted"
                              onClick={async () => {
                                await apiDelete(`/schools/${s.id}`);
                                await qc.invalidateQueries({
                                  queryKey: queryKeys.schools(includeInactive),
                                });
                              }}
                            >
                              {ptBR.actions.delete}
                            </button>
                          </RowKebabMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
