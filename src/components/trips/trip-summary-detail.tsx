import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { TripForm } from "@/components/trips/TripForm";
import { buttonVariants } from "@/components/ui/button";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { tripSchema } from "@/lib/schemas/trip";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

type TripSummaryDetailProps = {
  tripId: string;
  /**
   * When set (school trips list–detail pane), show recovery if the trip
   * belongs to another school.
   */
  expectedSchoolId?: string;
};

/**
 * Trip edit form only; used from `/trips/$tripId/summary` and
 * `/schools/$schoolId/trips/$tripId` so school-scoped flows keep the trips list.
 */
export function TripSummaryDetail({
  tripId,
  expectedSchoolId,
}: TripSummaryDetailProps) {
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

  if (
    expectedSchoolId &&
    isUuid(expectedSchoolId) &&
    trip.schoolId !== expectedSchoolId
  ) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground" role="alert">
          Esta viagem não pertence a esta escola.
        </p>
        <Link
          to="/schools/$schoolId/trips"
          params={{ schoolId: expectedSchoolId }}
          className="mt-2 inline-block text-sm text-primary"
        >
          ← {ptBR.entities.trips}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-w-0 p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-medium">
            {trip.title?.trim() ||
              `${ptBR.entities.trip} ${tripId.slice(0, 8)}…`}
          </h1>
          {expectedSchoolId && isUuid(expectedSchoolId) ? (
            <Link
              to="/schools/$schoolId/trips/$tripId/passengers"
              params={{ schoolId: expectedSchoolId, tripId }}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "no-underline",
              )}
            >
              {ptBR.entities.passengers}
            </Link>
          ) : (
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
          )}
        </div>

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
      </div>
    </div>
  );
}
