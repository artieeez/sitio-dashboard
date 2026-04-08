import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { PassengerTable } from "@/components/trips/PassengerTable";
import { buttonVariants } from "@/components/ui/button";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { passengerWithStatusSchema } from "@/lib/schemas/passenger";
import { tripSchema } from "@/lib/schemas/trip";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

export const Route = createFileRoute("/trips/$tripId/passengers/")({
  component: TripPassengersPage,
});

function TripPassengersPage() {
  const { tripId } = Route.useParams();
  const tripIdValid = isUuid(tripId);

  const tripQuery = useQuery({
    queryKey: queryKeys.trip(tripId),
    queryFn: async () => {
      const raw = await apiJson<unknown>(`/trips/${tripId}`);
      return tripSchema.parse(raw);
    },
    enabled: tripIdValid,
  });

  const includeRemoved = useUiPreferencesStore(
    (s) => s.includeRemovedPassengers,
  );
  const setIncludeRemoved = useUiPreferencesStore(
    (s) => s.setIncludeRemovedPassengers,
  );

  const passengersQuery = useQuery({
    queryKey: queryKeys.passengers(tripId, includeRemoved),
    queryFn: async () => {
      const q = includeRemoved ? "?includeRemoved=true" : "";
      const raw = await apiJson<unknown>(`/trips/${tripId}/passengers${q}`);
      return z.array(passengerWithStatusSchema).parse(raw);
    },
    enabled: tripIdValid,
  });

  if (!tripIdValid) {
    return (
      <RouteInvalidRecovery
        backTo="/schools"
        linkLabel={ptBR.entities.schools}
      />
    );
  }

  if (tripQuery.isLoading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  if (tripQuery.isError || !tripQuery.data) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600" role="alert">
          Viagem não encontrada.
        </p>
        <Link to="/schools" className="mt-2 inline-block text-sm text-primary">
          ← {ptBR.entities.schools}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mt-4">
        <Link
          to="/trips/$tripId"
          params={{ tripId }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {ptBR.actions.edit} {ptBR.entities.trip}
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-medium">{ptBR.entities.passengers}</h1>
          <Link
            to="/trips/$tripId/passengers/new"
            params={{ tripId }}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "w-fit no-underline",
            )}
          >
            {ptBR.actions.create} {ptBR.entities.passenger}
          </Link>
        </div>
      </div>

      <section className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        {passengersQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : passengersQuery.isError ? (
          <p className="text-sm text-red-600" role="alert">
            Não foi possível carregar os passageiros.
          </p>
        ) : (
          <PassengerTable
            tripId={tripId}
            rows={passengersQuery.data ?? []}
            includeRemoved={includeRemoved}
            onIncludeRemovedChange={(v) => {
              setIncludeRemoved(v);
            }}
          />
        )}
      </section>
    </div>
  );
}
