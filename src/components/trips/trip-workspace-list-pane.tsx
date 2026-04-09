import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { z } from "zod";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { PassengerTable } from "@/components/trips/PassengerTable";
import { Button } from "@/components/ui/button";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { passengerWithStatusSchema } from "@/lib/schemas/passenger";
import { scopedSchoolIdFromPathname } from "@/lib/trip-payment-links";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

type TripWorkspaceListPaneProps = {
  tripId: string;
};

/**
 * Passengers-only list pane for the trip workspace (breadcrumbs carry trip/school context).
 */
export function TripWorkspaceListPane({ tripId }: TripWorkspaceListPaneProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { requestSelect } = useListDetailLayout();
  const tripIdValid = isUuid(tripId);

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

  const passengerSegment = `/trips/${tripId}/passengers/`;
  const pIdx = pathname.indexOf(passengerSegment);
  const selectedPassengerId =
    pIdx >= 0
      ? (pathname
          .slice(pIdx + passengerSegment.length)
          .match(/^([0-9a-f-]{36})\/payments/)?.[1] ?? null)
      : null;

  if (!tripIdValid) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {ptBR.listDetail.invalidTripContext}
      </div>
    );
  }

  const paymentsSchoolId = scopedSchoolIdFromPathname(pathname);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
      <Button
        type="button"
        variant="default"
        size="sm"
        className="w-fit"
        onClick={() => requestSelect("passengers-new")}
      >
        {ptBR.actions.create} {ptBR.entities.passenger}
      </Button>
      {passengersQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : passengersQuery.isError ? (
        <p className="text-sm text-red-600" role="alert">
          {ptBR.listDetail.passengersLoadError}
        </p>
      ) : (
        <PassengerTable
          tripId={tripId}
          rows={passengersQuery.data ?? []}
          includeRemoved={includeRemoved}
          onIncludeRemovedChange={(v) => setIncludeRemoved(v)}
          selectedPassengerId={selectedPassengerId}
          schoolId={paymentsSchoolId}
        />
      )}
    </div>
  );
}
