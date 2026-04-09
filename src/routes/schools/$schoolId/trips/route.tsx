import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";

import { ListDetailLayout } from "@/components/layout/list-detail-layout";
import { NavigationUnsavedGuard } from "@/components/layout/navigation-unsaved-guard";
import { SchoolTripsListPane } from "@/components/schools/school-trips-list-pane";
import { WorkspaceDirtyProvider } from "@/contexts/workspace-dirty-context";

export const Route = createFileRoute("/schools/$schoolId/trips")({
  component: SchoolTripsShell,
});

function SchoolTripsShell() {
  const { schoolId } = Route.useParams();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const selectedKey = useMemo(() => {
    if (pathname.includes("/trips/new")) return "__new__";
    return null;
  }, [pathname]);

  const onSelectedKeyChange = useCallback(
    (key: string | null) => {
      if (key == null) {
        void navigate({
          to: "/schools/$schoolId/trips",
          params: { schoolId },
        });
        return;
      }
      if (!key || key === "__new__") return;
      void navigate({ to: "/trips/$tripId", params: { tripId: key } });
    },
    [navigate, schoolId],
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
        isDirty={workspaceDirty}
        onDiscardDirty={handleDiscardDirty}
        list={<SchoolTripsListPane schoolId={schoolId} />}
        detail={<Outlet key={outletKey} />}
      />
    </WorkspaceDirtyProvider>
  );
}
