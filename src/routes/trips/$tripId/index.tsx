import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { PassengerCreateForm } from "@/components/trips/PassengerCreateForm";
import { PassengerTable } from "@/components/trips/PassengerTable";
import { TripForm } from "@/components/trips/TripForm";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { passengerWithStatusSchema } from "@/lib/schemas/passenger";
import { tripSchema } from "@/lib/schemas/trip";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

export const Route = createFileRoute("/trips/$tripId/")({
  component: TripDetailPage,
});

function TripDetailPage() {
  const { tripId } = Route.useParams();
  const qc = useQueryClient();
  const schoolIdForBack = useQuery({
    queryKey: queryKeys.trip(tripId),
    queryFn: async () => {
      const raw = await apiJson<unknown>(`/trips/${tripId}`);
      return tripSchema.parse(raw);
    },
  });

  const includeInactiveTrips = useUiPreferencesStore(
    (s) => s.includeInactiveTrips,
  );
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
  });

  if (schoolIdForBack.isLoading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  if (schoolIdForBack.isError || !schoolIdForBack.data) {
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

  const trip = schoolIdForBack.data;
  const schoolId = trip.schoolId;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-6">
      <div>
        <Link
          to="/schools/$schoolId/trips"
          params={{ schoolId }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {ptBR.entities.trips}
        </Link>
        <h1 className="mt-2 text-lg font-medium">
          {trip.title?.trim() || `${ptBR.entities.trip} ${tripId.slice(0, 8)}…`}
        </h1>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">
          {ptBR.actions.edit} {ptBR.entities.trip}
        </h2>
        <TripForm
          mode="edit"
          schoolId={schoolId}
          trip={trip}
          onSuccess={async () => {
            await qc.invalidateQueries({ queryKey: queryKeys.trip(tripId) });
            await qc.invalidateQueries({
              queryKey: queryKeys.trips(schoolId, includeInactiveTrips),
            });
            await qc.invalidateQueries({
              queryKey: queryKeys.passengers(tripId, false),
            });
            await qc.invalidateQueries({
              queryKey: queryKeys.passengers(tripId, true),
            });
          }}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">{ptBR.entities.passengers}</h2>
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

      <PassengerCreateForm tripId={tripId} />
    </div>
  );
}
