import { useQuery } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useCallback } from "react";
import { z } from "zod";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { PassengerTable } from "@/components/trips/PassengerTable";
import { Button } from "@/components/ui/button";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { passengerWithStatusSchema } from "@/lib/schemas/passenger";
import {
  highlightedPassengerIdFromTripWorkspacePathname,
  scopedSchoolIdFromPathname,
} from "@/lib/trip-payment-links";
import { navigateToTripWorkspacePassengerDetail } from "@/lib/trip-workspace-navigation";
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
  const navigate = useNavigate();
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

  const selectedPassengerId = highlightedPassengerIdFromTripWorkspacePathname(
    pathname,
    tripId,
  );

  const paymentsSchoolId = scopedSchoolIdFromPathname(pathname);

  const onPassengerRowNavigate = useCallback(
    (passengerId: string) => {
      navigateToTripWorkspacePassengerDetail({
        navigate,
        pathname,
        tripId,
        passengerId,
        ...(paymentsSchoolId ? { scopedSchoolId: paymentsSchoolId } : {}),
      });
    },
    [navigate, pathname, tripId, paymentsSchoolId],
  );

  if (!tripIdValid) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {ptBR.listDetail.invalidTripContext}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-medium">{ptBR.entities.passengers}</h1>
        <Button
          type="button"
          variant="default"
          size="sm"
          aria-label={ptBR.actions.addPassenger}
          className="w-fit gap-1"
          onClick={() => requestSelect("passengers-new")}
        >
          <Plus className="size-4 shrink-0" aria-hidden />
          {ptBR.actions.addPassenger}
        </Button>
      </div>
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
          onPassengerRowNavigate={onPassengerRowNavigate}
        />
      )}
    </div>
  );
}
