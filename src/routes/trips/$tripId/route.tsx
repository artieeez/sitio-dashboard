import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

import { ListDetailLayout } from "@/components/layout/list-detail-layout";
import { TripWorkspaceListPane } from "@/components/trips/trip-workspace-list-pane";
import {
  navigateFromTripWorkspaceKey,
  tripWorkspaceSelectionKey,
} from "@/lib/trip-workspace-navigation";

export const Route = createFileRoute("/trips/$tripId")({
  component: TripWorkspaceShell,
});

function TripWorkspaceShell() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const selectedKey = useMemo(
    () => tripWorkspaceSelectionKey(pathname, tripId),
    [pathname, tripId],
  );
  const onSelectedKeyChange = useCallback(
    (key: string | null) => {
      navigateFromTripWorkspaceKey({ navigate, tripId, key });
    },
    [navigate, tripId],
  );

  return (
    <ListDetailLayout
      selectedKey={selectedKey}
      onSelectedKeyChange={onSelectedKeyChange}
      list={<TripWorkspaceListPane tripId={tripId} />}
      detail={<Outlet />}
    />
  );
}
