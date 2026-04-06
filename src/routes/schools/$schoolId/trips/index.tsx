import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { buttonVariants } from "@/components/ui/button";
import { RowKebabMenu } from "@/components/ui/row-kebab-menu";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { tripSchema } from "@/lib/schemas/trip";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

export const Route = createFileRoute("/schools/$schoolId/trips/")({
  component: SchoolTripsPage,
});

function SchoolTripsPage() {
  const { schoolId } = Route.useParams();
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
      <RouteInvalidRecovery
        backTo="/schools"
        linkLabel={ptBR.entities.schools}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 p-6">
      <div>
        <Link
          to="/schools/$schoolId"
          params={{ schoolId }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {ptBR.entities.school}
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
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
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(ev) => setIncludeInactive(ev.target.checked)}
          />
          {ptBR.toggles.includeInactiveTrips}
        </label>
      </div>

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
            <li
              key={t.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
            >
              <span className="min-w-0 flex-1 font-medium text-foreground">
                {t.title?.trim() || `Viagem ${t.id.slice(0, 8)}…`}
                {!t.active ? (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({ptBR.fields.inactive})
                  </span>
                ) : null}
              </span>
              <RowKebabMenu ariaLabel={ptBR.aria.rowMenu}>
                <Link
                  role="menuitem"
                  to="/trips/$tripId"
                  params={{ tripId: t.id }}
                  className="rounded px-2 py-1.5 text-sm hover:bg-muted"
                >
                  {ptBR.actions.edit} {ptBR.entities.trip}
                </Link>
                <Link
                  role="menuitem"
                  to="/trips/$tripId/passengers"
                  params={{ tripId: t.id }}
                  className="rounded px-2 py-1.5 text-sm hover:bg-muted"
                >
                  {ptBR.actions.viewPassengers}
                </Link>
              </RowKebabMenu>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
