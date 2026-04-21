import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { TripFormWorkspace } from "@/components/trips/trip-form-workspace";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { tripSchema } from "@/lib/schemas/trip";
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
 * Trip workspace detail outlet: edit form for the trip (`TripForm`).
 */
export function TripSummaryDetail({
  tripId,
  expectedSchoolId,
}: TripSummaryDetailProps) {
  const qc = useQueryClient();
  const { requestCloseDetail } = useListDetailLayout();
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

  const schoolId = trip.schoolId;

  const onSaved = async () => {
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
  };

  return (
    <TripFormWorkspace
      mode="edit"
      schoolId={schoolId}
      trip={trip}
      onClose={requestCloseDetail}
      onSuccess={onSaved}
    />
  );
}
