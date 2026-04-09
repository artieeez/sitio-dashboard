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
 * M3: **Schools directory** is list–detail only at `/schools` / `/schools/`.
 * Scoped school hub (`/schools/$schoolId/*`) is a **single** main column so it
 * does not stack the directory list beside trips or other nested list–detail
 * shells. `/schools/$schoolId/` redirects to `.../home` (no bare id index URL).
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
              to: "/schools/$schoolId/home",
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
