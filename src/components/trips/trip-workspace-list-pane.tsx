import { useQuery } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { useCallback } from "react";
import { z } from "zod";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import {
  ListPanePageHeader,
  ListPaneScrollArea,
  ListPaneShell,
} from "@/components/layout/list-pane-layout";
import { PassengerTable } from "@/components/trips/PassengerTable";
import { TripWorkspaceListOptionsMenu } from "@/components/trips/trip-workspace-list-options-menu";
import { Button } from "@/components/ui/button";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { passengerWithStatusSchema } from "@/lib/schemas/passenger";
import { type Trip, tripSchema } from "@/lib/schemas/trip";
import {
  highlightedPassengerIdFromTripWorkspacePathname,
  scopedSchoolIdFromPathname,
} from "@/lib/trip-payment-links";
import {
  navigateFromTripWorkspaceKey,
  navigateToTripWorkspacePassengerDetail,
} from "@/lib/trip-workspace-navigation";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

type TripWorkspaceListPaneProps = {
  tripId: string;
};

function tripWorkspaceTitle(t: Trip): string {
  return t.title?.trim() || `${ptBR.entities.trip} ${t.id.slice(0, 8)}…`;
}

/**
 * Passengers list pane for the trip workspace (breadcrumbs carry trip/school context).
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

  const tripQuery = useQuery({
    queryKey: queryKeys.trip(tripId),
    queryFn: async () => {
      const raw = await apiJson<unknown>(`/trips/${tripId}`);
      return tripSchema.parse(raw);
    },
    enabled: tripIdValid,
  });

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

  const onGoBack = useCallback(() => {
    navigateFromTripWorkspaceKey({
      navigate,
      tripId,
      key: null,
      ...(paymentsSchoolId ? { scopedSchoolId: paymentsSchoolId } : {}),
      tripSchoolIdForClose: tripQuery.data?.schoolId ?? null,
    });
  }, [navigate, tripId, paymentsSchoolId, tripQuery.data?.schoolId]);

  if (!tripIdValid) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {ptBR.listDetail.invalidTripContext}
      </div>
    );
  }

  return (
    <ListPaneShell className="pt-4">
      <ListPaneScrollArea>
        <header className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label={ptBR.tripWorkspace.goBackAria}
              onClick={onGoBack}
            >
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
            </Button>
          </div>
          {tripQuery.isLoading ? (
            <span
              className="size-12 shrink-0 animate-pulse rounded-lg bg-muted"
              aria-hidden
            />
          ) : tripQuery.isError || !tripQuery.data ? (
            <span
              className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-muted-foreground text-xs"
              aria-hidden
            >
              —
            </span>
          ) : tripQuery.data.imageUrl?.trim() ? (
            <img
              src={tripQuery.data.imageUrl}
              alt=""
              className="size-12 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <span
              className="inline-block size-12 shrink-0 rounded-lg border border-dashed border-border bg-muted/40"
              aria-hidden
            />
          )}
          <div className="min-w-0 flex-1">
            {tripQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : tripQuery.isError || !tripQuery.data ? (
              <p className="text-sm text-muted-foreground" role="status">
                {ptBR.listDetail.tripContextLoadError}
              </p>
            ) : (
              <div className="min-w-0">
                <h2 className="break-words font-semibold text-base leading-snug tracking-tight">
                  {tripWorkspaceTitle(tripQuery.data)}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="text-muted-foreground text-xs">
                    {ptBR.tripWorkspace.subtitleDateMock}
                  </p>
                  {!tripQuery.data.active ? (
                    <span className="inline-flex rounded-md border border-border bg-muted/50 px-2 py-0.5 font-medium text-muted-foreground text-xs">
                      {ptBR.fields.inactive}
                    </span>
                  ) : null}
                </div>
              </div>
            )}
          </div>
          <div className="mt-0.5 shrink-0">
            <TripWorkspaceListOptionsMenu
              tripId={tripId}
              {...(paymentsSchoolId ? { schoolId: paymentsSchoolId } : {})}
            />
          </div>
        </header>
        <ListPanePageHeader
          variant="compact"
          title={ptBR.tripWorkspace.passengersTab}
          menu={
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={ptBR.actions.addPassenger}
              className="w-fit gap-1"
              onClick={() => requestSelect("passengers-new")}
            >
              <Plus className="size-4 shrink-0" aria-hidden />
              {ptBR.actions.addPassenger}
            </Button>
          }
        />
        {passengersQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : passengersQuery.isError ? (
          <p className="text-sm text-red-600" role="alert">
            {ptBR.listDetail.passengersLoadError}
          </p>
        ) : (
          <PassengerTable
            rows={passengersQuery.data ?? []}
            includeRemoved={includeRemoved}
            onIncludeRemovedChange={(v) => setIncludeRemoved(v)}
            selectedPassengerId={selectedPassengerId}
            onPassengerRowNavigate={onPassengerRowNavigate}
          />
        )}
      </ListPaneScrollArea>
    </ListPaneShell>
  );
}
