import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";
import { z } from "zod";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { buttonVariants } from "@/components/ui/button";
import { RowKebabMenu } from "@/components/ui/row-kebab-menu";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { tripSchema } from "@/lib/schemas/trip";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

type SchoolTripsListPaneProps = {
  schoolId: string;
};

/**
 * Trips collection for the M3 list pane under `/schools/$schoolId/trips` (004).
 */
export function SchoolTripsListPane({ schoolId }: SchoolTripsListPaneProps) {
  const navigate = useNavigate();
  const { requestSelect, selectedKey } = useListDetailLayout();
  const rowButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
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
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "w-fit",
            )}
          >
            {ptBR.actions.create} {ptBR.entities.trip}
          </Link>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(ev) => setIncludeInactive(ev.target.checked)}
          />
          {ptBR.toggles.includeInactiveTrips}
        </label>
      </header>

      {tripsQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : tripsQuery.isError ? (
        <p className="text-sm text-red-600" role="alert">
          Não foi possível carregar as viagens.
        </p>
      ) : (
        <ul className="flex flex-col gap-2" role="listbox" aria-label={ptBR.entities.trips}>
          {tripsQuery.data?.length === 0 ? (
            <li className="p-4 text-sm text-muted-foreground">
              {ptBR.emptyStates.trips}
            </li>
          ) : null}
          {(tripsQuery.data ?? []).map((t, rowIndex) => (
            <li key={t.id}>
              <div
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2",
                  selectedKey === t.id &&
                    "bg-muted/40 ring-2 ring-ring ring-offset-2",
                )}
              >
                <button
                  ref={(el) => {
                    rowButtonRefs.current[rowIndex] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={selectedKey === t.id}
                  className="min-w-0 flex-1 rounded-md text-left outline-none focus-visible:ring-0"
                  onClick={() => requestSelect(t.id)}
                  onKeyDown={(ev) => {
                    const rows = tripsQuery.data ?? [];
                    const idx = rows.findIndex((trip) => trip.id === t.id);
                    if (idx < 0) return;
                    if (ev.key === "ArrowDown") {
                      ev.preventDefault();
                      const next = Math.min(idx + 1, rows.length - 1);
                      rowButtonRefs.current[next]?.focus();
                      requestSelect(rows[next].id);
                    } else if (ev.key === "ArrowUp") {
                      ev.preventDefault();
                      const prev = Math.max(idx - 1, 0);
                      rowButtonRefs.current[prev]?.focus();
                      requestSelect(rows[prev].id);
                    } else if (ev.key === "Home") {
                      ev.preventDefault();
                      rowButtonRefs.current[0]?.focus();
                      requestSelect(rows[0].id);
                    } else if (ev.key === "End") {
                      ev.preventDefault();
                      const last = rows.length - 1;
                      rowButtonRefs.current[last]?.focus();
                      requestSelect(rows[last].id);
                    } else if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      requestSelect(t.id);
                    }
                  }}
                >
                  <span className="flex items-center gap-3">
                    {t.imageUrl?.trim() ? (
                      <img
                        src={t.imageUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <span className="h-10 w-10 shrink-0 rounded-md border border-dashed border-border bg-muted/40" />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-foreground">
                        {t.title?.trim() || `Viagem ${t.id.slice(0, 8)}…`}
                      </span>
                      {t.description?.trim() ? (
                        <span className="block truncate text-muted-foreground text-sm">
                          {t.description.trim()}
                        </span>
                      ) : null}
                      {!t.active ? (
                        <span className="text-xs font-normal text-muted-foreground">
                          ({ptBR.fields.inactive})
                        </span>
                      ) : null}
                    </span>
                  </span>
                </button>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
