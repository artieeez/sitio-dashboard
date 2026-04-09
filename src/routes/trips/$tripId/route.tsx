import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";

import { ListDetailLayout } from "@/components/layout/list-detail-layout";
import { NavigationUnsavedGuard } from "@/components/layout/navigation-unsaved-guard";
import { TripWorkspaceListPane } from "@/components/trips/trip-workspace-list-pane";
import { WorkspaceDirtyProvider } from "@/contexts/workspace-dirty-context";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { tripSchema } from "@/lib/schemas/trip";
import {
  isPassengerPaymentFormDetailPath,
  isPassengerPaymentsBranchPath,
  passengersListLink,
} from "@/lib/trip-payment-links";
import {
  isTripSummaryEditDetailPath,
  navigateFromTripWorkspaceKey,
  tripWorkspaceSelectionKey,
} from "@/lib/trip-workspace-navigation";
import { isUuid } from "@/lib/uuid";

export const Route = createFileRoute("/trips/$tripId")({
  beforeLoad: ({ params, location }) => {
    const id = params.tripId;
    const p = location.pathname;
    const base = `/trips/${id}`;
    if (p === base || p === `${base}/`) {
      throw redirect({
        to: "/trips/$tripId/summary",
        params: { tripId: id },
      });
    }
  },
  component: TripWorkspaceShell,
});

function TripWorkspaceShell() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const tripIdValid = isUuid(tripId);
  const tripQuery = useQuery({
    queryKey: queryKeys.trip(tripId),
    queryFn: async () => {
      const raw = await apiJson<unknown>(`/trips/${tripId}`);
      return tripSchema.parse(raw);
    },
    enabled: tripIdValid,
  });

  const selectedKey = useMemo(
    () => tripWorkspaceSelectionKey(pathname, tripId),
    [pathname, tripId],
  );
  const onSelectedKeyChange = useCallback(
    (key: string | null) => {
      navigateFromTripWorkspaceKey({
        navigate,
        tripId,
        key,
        tripSchoolIdForClose: tripQuery.data?.schoolId ?? null,
      });
    },
    [navigate, tripId, tripQuery.data?.schoolId],
  );

  const onCloseDetail = useMemo(() => {
    if (!isPassengerPaymentsBranchPath(pathname)) return undefined;
    return () => {
      void navigate(passengersListLink({ tripId }));
    };
  }, [pathname, tripId, navigate]);

  const hidePaneDetailClose = useMemo(
    () =>
      isPassengerPaymentFormDetailPath(pathname) ||
      isTripSummaryEditDetailPath(pathname, tripId),
    [pathname, tripId],
  );

  const [workspaceDirty, setWorkspaceDirty] = useState(false);
  const [outletKey, setOutletKey] = useState(0);
  const handleDiscardDirty = useCallback(() => {
    setWorkspaceDirty(false);
    setOutletKey((k) => k + 1);
  }, []);

  return (
    <WorkspaceDirtyProvider setWorkspaceDirty={setWorkspaceDirty}>
      <NavigationUnsavedGuard
        isDirty={workspaceDirty}
        onDiscard={handleDiscardDirty}
      />
      <ListDetailLayout
        selectedKey={selectedKey}
        onSelectedKeyChange={onSelectedKeyChange}
        onCloseDetail={onCloseDetail}
        hidePaneDetailClose={hidePaneDetailClose}
        disableLocalUnsavedGuard
        isDirty={workspaceDirty}
        onDiscardDirty={handleDiscardDirty}
        list={<TripWorkspaceListPane tripId={tripId} />}
        detail={<Outlet key={outletKey} />}
      />
    </WorkspaceDirtyProvider>
  );
}
