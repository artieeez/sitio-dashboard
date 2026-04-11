import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";

import { ListDetailLayout } from "@/components/layout/list-detail-layout";
import { NavigationUnsavedGuard } from "@/components/layout/navigation-unsaved-guard";
import { SchoolsDirectoryHomePane } from "@/components/schools/schools-directory-home-pane";
import { WorkspaceDirtyProvider } from "@/contexts/workspace-dirty-context";

export const Route = createFileRoute("/schools")({
  component: SchoolsShell,
});

/**
 * M3: **Schools directory** list–detail at `/schools`, `/schools/`, and
 * `/schools/new` (create in **detail** pane). List pane shows the schools table
 * (trip-style). Index detail is a placeholder (no duplicate school list). Scoped
 * `/schools/$schoolId/trips` (and below) is a single main column.
 */
function SchoolsShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isSchoolsDirectoryShell =
    pathname === "/schools" ||
    pathname === "/schools/" ||
    pathname === "/schools/new";

  const directorySelectedKey = useMemo(
    () => (pathname === "/schools/new" ? "__new__" : null),
    [pathname],
  );

  const hidePaneDetailClose = pathname === "/schools/new";

  const [workspaceDirty, setWorkspaceDirty] = useState(false);
  const [outletKey, setOutletKey] = useState(0);
  const handleDiscardDirty = useCallback(() => {
    setWorkspaceDirty(false);
    setOutletKey((k) => k + 1);
  }, []);

  const onDirectorySelectedKeyChange = useCallback(
    (key: string | null) => {
      if (key == null) {
        void navigate({ to: "/schools" });
        return;
      }
      if (key === "__new__") {
        void navigate({ to: "/schools/new" });
        return;
      }
      void navigate({
        to: "/schools/$schoolId",
        params: { schoolId: key },
      });
    },
    [navigate],
  );

  if (isSchoolsDirectoryShell) {
    return (
      <WorkspaceDirtyProvider setWorkspaceDirty={setWorkspaceDirty}>
        <NavigationUnsavedGuard
          isDirty={workspaceDirty}
          onDiscard={handleDiscardDirty}
        />
        <ListDetailLayout
          selectedKey={directorySelectedKey}
          onSelectedKeyChange={onDirectorySelectedKeyChange}
          hidePaneDetailClose={hidePaneDetailClose}
          disableLocalUnsavedGuard
          isDirty={workspaceDirty}
          onDiscardDirty={handleDiscardDirty}
          narrowDetailPane={directorySelectedKey == null}
          list={<SchoolsDirectoryHomePane />}
          detail={<Outlet key={outletKey} />}
        />
      </WorkspaceDirtyProvider>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <Outlet />
    </div>
  );
}
