import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { z } from "zod";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { PassengerTable } from "@/components/trips/PassengerTable";
import { Button } from "@/components/ui/button";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { passengerWithStatusSchema } from "@/lib/schemas/passenger";
import { tripSchema } from "@/lib/schemas/trip";
import { scopedSchoolIdFromPathname } from "@/lib/trip-payment-links";
import { tripWorkspaceSelectionKey } from "@/lib/trip-workspace-navigation";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

type TripWorkspaceListPaneProps = {
  tripId: string;
};

export function TripWorkspaceListPane({ tripId }: TripWorkspaceListPaneProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { requestSelect } = useListDetailLayout();
  const tripIdValid = isUuid(tripId);
  const navKey = tripWorkspaceSelectionKey(pathname, tripId) ?? "trip";

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

  const showPassengerTable =
    tripIdValid && pathname.includes(`/trips/${tripId}/passengers`);

  const passengersQuery = useQuery({
    queryKey: queryKeys.passengers(tripId, includeRemoved),
    queryFn: async () => {
      const q = includeRemoved ? "?includeRemoved=true" : "";
      const raw = await apiJson<unknown>(`/trips/${tripId}/passengers${q}`);
      return z.array(passengerWithStatusSchema).parse(raw);
    },
    enabled: tripIdValid && showPassengerTable,
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

  const schoolId = tripQuery.data?.schoolId;
  const paymentsSchoolId = scopedSchoolIdFromPathname(pathname);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
      <div className="flex flex-col gap-1">
        {schoolId ? (
          <Link
            to="/schools/$schoolId/trips"
            params={{ schoolId }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {ptBR.entities.trips}
          </Link>
        ) : tripQuery.isLoading ? (
          <span className="text-sm text-muted-foreground">Carregando…</span>
        ) : null}
        {tripQuery.data ? (
          <p className="font-medium text-foreground text-sm">
            {tripQuery.data.title?.trim() ||
              `${ptBR.entities.trip} ${tripId.slice(0, 8)}…`}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1 border-border border-b pb-3">
        <p className="text-muted-foreground text-xs uppercase tracking-wide">
          {ptBR.listDetail.tripWorkspaceNavLabel}
        </p>
        <button
          type="button"
          className={cn(
            "rounded-md px-2 py-2 text-left text-sm hover:bg-muted",
            navKey === "trip" && "bg-muted/60",
          )}
          aria-current={navKey === "trip" ? true : undefined}
          onClick={() => requestSelect("trip")}
        >
          {ptBR.listDetail.tripWorkspaceNavTrip}
        </button>
        <button
          type="button"
          className={cn(
            "rounded-md px-2 py-2 text-left text-sm hover:bg-muted",
            (navKey === "passengers" ||
              navKey === "passengers-new" ||
              navKey.startsWith("passenger:")) &&
              "bg-muted/60",
          )}
          aria-current={
            navKey === "passengers" ||
            navKey === "passengers-new" ||
            navKey.startsWith("passenger:")
              ? true
              : undefined
          }
          onClick={() => requestSelect("passengers")}
        >
          {ptBR.listDetail.tripWorkspaceNavPassengers}
        </button>
      </div>

      {showPassengerTable ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
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
      ) : null}
    </div>
  );
}
