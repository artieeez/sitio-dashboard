import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
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
  const { requestSelect } = useListDetailLayout();
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
        <ul className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 shadow-sm">
          {tripsQuery.data?.length === 0 ? (
            <li className="p-4 text-sm text-muted-foreground">
              {ptBR.emptyStates.trips}
            </li>
          ) : null}
          {tripsQuery.data?.map((t) => (
            <li key={t.id}>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                <button
                  type="button"
                  className="min-w-0 flex-1 rounded-md text-left"
                  onClick={() => requestSelect(t.id)}
                >
                  <span className="font-medium text-foreground">
                    {t.title?.trim() || `Viagem ${t.id.slice(0, 8)}…`}
                  </span>
                  {!t.active ? (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      ({ptBR.fields.inactive})
                    </span>
                  ) : null}
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
