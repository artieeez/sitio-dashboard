import {
  createFileRoute,
  Outlet,
  useNavigate,
  useParams,
  useRouterState,
} from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";

import { ListDetailLayout } from "@/components/layout/list-detail-layout";
import { NavigationUnsavedGuard } from "@/components/layout/navigation-unsaved-guard";
import { SchoolTripsListPane } from "@/components/schools/school-trips-list-pane";
import { TripWorkspaceListPane } from "@/components/trips/trip-workspace-list-pane";
import { WorkspaceDirtyProvider } from "@/contexts/workspace-dirty-context";
import {
  isPassengerEditDetailPath,
  isPassengerNewFormPath,
  isPassengerPaymentsBranchPath,
  isTripPassengersListHubPath,
  passengersListLink,
} from "@/lib/trip-payment-links";
import {
  isTripSummaryEditDetailPath,
  navigateFromTripWorkspaceKey,
} from "@/lib/trip-workspace-navigation";
import { isUuid } from "@/lib/uuid";

export const Route = createFileRoute("/schools/$schoolId/trips")({
  component: SchoolTripsShell,
});

function SchoolTripsShell() {
  const { schoolId } = Route.useParams();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { tripId: tripIdFromChild } = useParams({ strict: false }) as {
    tripId?: string;
  };

  const selectedKey = useMemo(() => {
    if (pathname.includes("/trips/new")) return "__new__";
    if (tripIdFromChild && isUuid(tripIdFromChild)) {
      if (isTripPassengersListHubPath(pathname, tripIdFromChild)) {
        return null;
      }
      return tripIdFromChild;
    }
    return null;
  }, [pathname, tripIdFromChild]);

  /** Narrow when trips hub or passengers hub (placeholder until a passenger row is opened). */
  const narrowDetailPane =
    selectedKey == null &&
    (!(tripIdFromChild && isUuid(tripIdFromChild)) ||
      isTripPassengersListHubPath(pathname, tripIdFromChild));

  const showTripWorkspaceList =
    tripIdFromChild &&
    isUuid(tripIdFromChild) &&
    (pathname.includes(`/trips/${tripIdFromChild}/passengers`) ||
      isTripSummaryEditDetailPath(pathname, tripIdFromChild));

  const onSelectedKeyChange = useCallback(
    (key: string | null) => {
      if (key == null) {
        void navigate({
          to: "/schools/$schoolId/trips",
          params: { schoolId },
        });
        return;
      }
      if (key === "__new__") {
        void navigate({
          to: "/schools/$schoolId/trips/new",
          params: { schoolId },
        });
        return;
      }
      if (
        key === "trip" ||
        key === "passengers" ||
        key === "passengers-new" ||
        key.startsWith("passenger:")
      ) {
        if (!tripIdFromChild || !isUuid(tripIdFromChild)) return;
        navigateFromTripWorkspaceKey({
          navigate,
          tripId: tripIdFromChild,
          key,
          scopedSchoolId: schoolId,
        });
        return;
      }
      if (!isUuid(key)) return;
      void navigate({
        to: "/schools/$schoolId/trips/$tripId",
        params: { schoolId, tripId: key },
      });
    },
    [navigate, schoolId, tripIdFromChild],
  );

  const onCloseDetail = useMemo(() => {
    if (!tripIdFromChild || !isUuid(tripIdFromChild) || !isUuid(schoolId)) {
      return undefined;
    }
    const tid = tripIdFromChild;
    if (
      isPassengerNewFormPath(pathname) ||
      isPassengerEditDetailPath(pathname) ||
      isPassengerPaymentsBranchPath(pathname) ||
      isTripSummaryEditDetailPath(pathname, tid)
    ) {
      return () => {
        void navigate(passengersListLink({ tripId: tid, schoolId }));
      };
    }
    return undefined;
  }, [pathname, tripIdFromChild, schoolId, navigate]);

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
        disableLocalUnsavedGuard
        isDirty={workspaceDirty}
        onDiscardDirty={handleDiscardDirty}
        narrowDetailPane={narrowDetailPane}
        list={
          showTripWorkspaceList && tripIdFromChild ? (
            <TripWorkspaceListPane tripId={tripIdFromChild} />
          ) : (
            <SchoolTripsListPane schoolId={schoolId} />
          )
        }
        detail={<Outlet key={outletKey} />}
      />
    </WorkspaceDirtyProvider>
  );
}
