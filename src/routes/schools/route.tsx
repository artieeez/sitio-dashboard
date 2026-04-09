import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";

import { ListDetailLayout } from "@/components/layout/list-detail-layout";
import { NavigationUnsavedGuard } from "@/components/layout/navigation-unsaved-guard";
import { SchoolsListPane } from "@/components/schools/schools-list-pane";
import { WorkspaceDirtyProvider } from "@/contexts/workspace-dirty-context";

export const Route = createFileRoute("/schools")({
  component: SchoolsShell,
});

/**
 * M3: **Schools directory** list–detail at `/schools`, `/schools/`, and
 * `/schools/new` (create in **detail** pane). Scoped `/schools/$schoolId/*` is a
 * single main column (no directory list beside hub/trips).
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
        to: "/schools/$schoolId/home",
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
          isDirty={workspaceDirty}
          onDiscardDirty={handleDiscardDirty}
          list={<SchoolsListPane />}
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
