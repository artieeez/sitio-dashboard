import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { TripForm } from "@/components/trips/TripForm";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { tripSchema } from "@/lib/schemas/trip";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

export const Route = createFileRoute("/schools/$schoolId/trips/")({
  component: SchoolTripsPage,
});

function SchoolTripsPage() {
  const { schoolId } = Route.useParams();
  const qc = useQueryClient();
  const includeInactive = useUiPreferencesStore((s) => s.includeInactiveTrips);
  const setIncludeInactive = useUiPreferencesStore(
    (s) => s.setIncludeInactiveTrips,
  );

  const tripsQuery = useQuery({
    queryKey: queryKeys.trips(schoolId, includeInactive),
    queryFn: async () => {
      const q = includeInactive ? "?includeInactive=true" : "";
      const raw = await apiJson<unknown>(`/schools/${schoolId}/trips${q}`);
      return z.array(tripSchema).parse(raw);
    },
  });

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
        <h1 className="mt-2 text-lg font-medium">{ptBR.entities.trips}</h1>
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
        <ul className="flex flex-col gap-2">
          {tripsQuery.data?.map((t) => (
            <li key={t.id}>
              <Link
                to="/trips/$tripId"
                params={{ tripId: t.id }}
                className="block rounded-md border border-border px-3 py-2 font-medium text-primary hover:bg-muted/50"
              >
                {t.title?.trim() || `Viagem ${t.id.slice(0, 8)}…`}
                {!t.active ? (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({ptBR.fields.inactive})
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">
          {ptBR.actions.create} {ptBR.entities.trip}
        </h2>
        <p className="text-xs text-muted-foreground">
          A viagem é sempre criada para esta escola (sem seletor de escola).
        </p>
        <TripForm
          mode="create"
          schoolId={schoolId}
          onSuccess={async () => {
            await qc.invalidateQueries({
              queryKey: queryKeys.trips(schoolId, includeInactive),
            });
          }}
        />
      </section>
    </div>
  );
}
