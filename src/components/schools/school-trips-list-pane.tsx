import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useRef } from "react";
import { z } from "zod";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { BooleanFilterChip } from "@/components/ui/boolean-filter-chip";
import { buttonVariants } from "@/components/ui/button";
import { RowKebabMenu } from "@/components/ui/row-kebab-menu";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { type Trip, tripSchema } from "@/lib/schemas/trip";
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

/**
 * Trips collection for the M3 list pane under `/schools/$schoolId/trips` (004).
 * Table layout aligned with `PassengerTable` (image, title, created date).
 */
export function SchoolTripsListPane({ schoolId }: SchoolTripsListPaneProps) {
  const navigate = useNavigate();
  const { requestSelect, selectedKey } = useListDetailLayout();
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);
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

  if (!schoolIdValid) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {ptBR.listDetail.invalidSchoolContext}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-medium">{ptBR.entities.trips}</h1>
          <Link
            to="/schools/$schoolId/trips/new"
            params={{ schoolId }}
            aria-label={ptBR.actions.addTrip}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "w-fit gap-1",
            )}
          >
            <Plus className="size-4 shrink-0" aria-hidden />
            {ptBR.actions.addTrip}
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BooleanFilterChip
            checked={includeInactive}
            onCheckedChange={setIncludeInactive}
          >
            {ptBR.toggles.includeInactiveTrips}
          </BooleanFilterChip>
        </div>
      </header>

      {tripsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : tripsQuery.isError ? (
        <p className="text-sm text-red-600" role="alert">
          Não foi possível carregar as viagens.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[480px] border-separate border-spacing-0 text-left text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th
                  className="w-14 min-w-14 border-b border-border p-2"
                  aria-hidden
                />
                <th className="border-b border-border p-2 font-medium whitespace-normal">
                  {ptBR.fields.title}
                </th>
                <th className="border-b border-border p-2 font-medium whitespace-normal">
                  {ptBR.fields.createdAt}
                </th>
                <th className="sticky right-0 z-[3] w-12 min-w-12 border-border border-b border-l bg-muted/40 p-2 text-right font-medium whitespace-normal">
                  <span className="sr-only">{ptBR.aria.rowMenu}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="border-b border-border p-4 text-muted-foreground whitespace-nowrap"
                  >
                    {ptBR.emptyStates.trips}
                  </td>
                </tr>
              ) : (
                rows.map((t, rowIndex) => (
                  <tr
                    key={t.id}
                    ref={(el) => {
                      rowRefs.current[rowIndex] = el;
                    }}
                    tabIndex={0}
                    className={cn(
                      "border-b border-border/80 cursor-pointer outline-none",
                      selectedKey === t.id && "bg-muted/50",
                    )}
                    aria-selected={selectedKey === t.id ? true : undefined}
                    aria-label={tripTitle(t)}
                    onClick={() => requestSelect(t.id)}
                    onKeyDown={(ev) => {
                      const idx = rows.findIndex((trip) => trip.id === t.id);
                      if (idx < 0) return;
                      if (ev.key === "ArrowDown") {
                        ev.preventDefault();
                        const next = Math.min(idx + 1, rows.length - 1);
                        rowRefs.current[next]?.focus();
                        requestSelect(rows[next].id);
                      } else if (ev.key === "ArrowUp") {
                        ev.preventDefault();
                        const prev = Math.max(idx - 1, 0);
                        rowRefs.current[prev]?.focus();
                        requestSelect(rows[prev].id);
                      } else if (ev.key === "Home") {
                        ev.preventDefault();
                        rowRefs.current[0]?.focus();
                        requestSelect(rows[0].id);
                      } else if (ev.key === "End") {
                        ev.preventDefault();
                        const last = rows.length - 1;
                        rowRefs.current[last]?.focus();
                        requestSelect(rows[last].id);
                      } else if (ev.key === "Enter" || ev.key === " ") {
                        ev.preventDefault();
                        requestSelect(t.id);
                      }
                    }}
                  >
                    <td className="border-b border-border p-2 align-middle whitespace-nowrap">
                      {t.imageUrl?.trim() ? (
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
                      )}
                    </td>
                    <td className="border-b border-border p-2 align-middle">
                      <span className="font-medium text-foreground">
                        {tripTitle(t)}
                      </span>
                      {!t.active ? (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          ({ptBR.fields.inactive})
                        </span>
                      ) : null}
                    </td>
                    <td className="border-b border-border p-2 align-middle tabular-nums whitespace-nowrap">
                      {formatTripCreatedAt(t.createdAt)}
                    </td>
                    {/* biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation only; menu items handle their own keyboard activation */}
                    <td
                      className={cn(
                        "sticky right-0 z-[2] w-12 min-w-12 border-border border-b border-l p-2 align-middle whitespace-nowrap",
                        selectedKey === t.id ? "bg-muted/50" : "bg-background",
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-end">
                        <RowKebabMenu ariaLabel={ptBR.aria.rowMenu}>
                          <button
                            type="button"
                            role="menuitem"
                            className="rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                            onClick={() => requestSelect(t.id)}
                          >
                            {ptBR.actions.edit} {ptBR.entities.trip}
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            className="rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                            onClick={() => {
                              void navigate({
                                to: "/schools/$schoolId/trips/$tripId/passengers",
                                params: { schoolId, tripId: t.id },
                              });
                            }}
                          >
                            {ptBR.actions.viewPassengers}
                          </button>
                        </RowKebabMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
