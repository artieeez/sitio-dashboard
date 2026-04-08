import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";

import { ListDetailLayout } from "@/components/layout/list-detail-layout";
import { SchoolsListPane } from "@/components/schools/schools-list-pane";

export const Route = createFileRoute("/schools")({
  component: SchoolsShell,
});

/**
 * M3 shell: **two-pane list–detail only** at `/schools` (pick a school). Active school
 * lives in the sidebar scope control, so `/schools/$schoolId/*` is a **single** main
 * column; nested routes (e.g. trips) supply their **own** list+detail pair—replacing
 * the previous list, never stacking a school directory list beside them.
 */
function SchoolsShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (pathname === "/schools/new") {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <Outlet />
      </div>
    );
  }

  const isSchoolsDirectory =
    pathname === "/schools" || pathname === "/schools/";

  if (isSchoolsDirectory) {
    return (
      <ListDetailLayout
        selectedKey={null}
        onSelectedKeyChange={(key) => {
          if (key) {
            void navigate({
              to: "/schools/$schoolId",
              params: { schoolId: key },
            });
          }
        }}
        list={<SchoolsListPane />}
        detail={<Outlet />}
      />
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <Outlet />
    </div>
  );
}
