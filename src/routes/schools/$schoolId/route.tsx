import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";

import { ListDetailLayout } from "@/components/layout/list-detail-layout";
import { NavigationUnsavedGuard } from "@/components/layout/navigation-unsaved-guard";
import { SchoolHomeListPane } from "@/components/schools/school-home-list-pane";
import { WorkspaceDirtyProvider } from "@/contexts/workspace-dirty-context";
import { isUuid } from "@/lib/uuid";

export const Route = createFileRoute("/schools/$schoolId")({
  component: SchoolIdLayout,
});

function SchoolIdLayout() {
  const { schoolId } = Route.useParams();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isTripsBranch = useMemo(
    () => pathname.startsWith(`/schools/${schoolId}/trips`),
    [pathname, schoolId],
  );

  const selectedKey = useMemo(() => {
    const base = `/schools/${schoolId}`;
    const normalized = pathname.replace(/\/$/, "") || pathname;
    if (normalized === `${base}/edit`) return "edit";
    return null;
  }, [pathname, schoolId]);

  const onSelectedKeyChange = useCallback(
    (key: string | null) => {
      if (key == null) {
        void navigate({ to: "/schools/$schoolId", params: { schoolId } });
        return;
      }
      if (key === "edit") {
        void navigate({ to: "/schools/$schoolId/edit", params: { schoolId } });
      }
    },
    [navigate, schoolId],
  );

  const [workspaceDirty, setWorkspaceDirty] = useState(false);
  const [outletKey, setOutletKey] = useState(0);
  const handleDiscardDirty = useCallback(() => {
    setWorkspaceDirty(false);
    setOutletKey((k) => k + 1);
  }, []);

  if (!isUuid(schoolId)) {
    return <Outlet />;
  }

  if (isTripsBranch) {
    return <Outlet />;
  }

  return (
    <WorkspaceDirtyProvider setWorkspaceDirty={setWorkspaceDirty}>
      <NavigationUnsavedGuard
        isDirty={workspaceDirty}
        onDiscard={handleDiscardDirty}
      />
      <ListDetailLayout
        selectedKey={selectedKey}
        onSelectedKeyChange={onSelectedKeyChange}
        hidePaneDetailClose={selectedKey === "edit"}
        isDirty={workspaceDirty}
        onDiscardDirty={handleDiscardDirty}
        list={<SchoolHomeListPane />}
        detail={<Outlet key={outletKey} />}
      />
    </WorkspaceDirtyProvider>
  );
}
