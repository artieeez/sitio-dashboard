import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { TripForm } from "@/components/trips/TripForm";
import { TripStatusSummary } from "@/components/trips/TripStatusSummary";
import { buttonVariants } from "@/components/ui/button";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { tripSchema } from "@/lib/schemas/trip";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

export const Route = createFileRoute("/trips/$tripId/summary")({
  component: TripSummaryPage,
});

function TripSummaryPage() {
  const { tripId } = Route.useParams();
  const qc = useQueryClient();
  const tripIdValid = isUuid(tripId);

  const tripQuery = useQuery({
    queryKey: queryKeys.trip(tripId),
    queryFn: async () => {
      const raw = await apiJson<unknown>(`/trips/${tripId}`);
      return tripSchema.parse(raw);
    },
    enabled: tripIdValid,
  });

  const includeInactiveTrips = useUiPreferencesStore(
    (s) => s.includeInactiveTrips,
  );

  if (!tripIdValid) {
    return (
      <div className="p-6">
        <RouteInvalidRecovery
          backTo="/schools"
          linkLabel={ptBR.entities.schools}
        />
      </div>
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

  const trip = tripQuery.data;
  const schoolId = trip.schoolId;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-lg font-medium">
              {trip.title?.trim() ||
                `${ptBR.entities.trip} ${tripId.slice(0, 8)}…`}
            </h1>
            <Link
              to="/trips/$tripId/passengers"
              params={{ tripId }}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "no-underline",
              )}
            >
              {ptBR.entities.passengers}
            </Link>
          </div>

          <section className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-medium">
              {ptBR.actions.edit} {ptBR.entities.trip}
            </h2>
            <TripForm
              mode="edit"
              schoolId={schoolId}
              trip={trip}
              onSuccess={async () => {
                await qc.invalidateQueries({
                  queryKey: queryKeys.trip(tripId),
                });
                await qc.invalidateQueries({
                  queryKey: queryKeys.trips(schoolId, includeInactiveTrips),
                });
                await qc.invalidateQueries({
                  queryKey: queryKeys.passengers(tripId, false),
                });
                await qc.invalidateQueries({
                  queryKey: queryKeys.passengers(tripId, true),
                });
                await qc.invalidateQueries({
                  queryKey: ["passengerAggregates", tripId],
                });
              }}
            />
          </section>
        </div>
        <div className="lg:col-span-1">
          <TripStatusSummary tripId={tripId} />
        </div>
      </div>
    </div>
  );
}
