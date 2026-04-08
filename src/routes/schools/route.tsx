import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";

import { ListDetailLayout } from "@/components/layout/list-detail-layout";
import { SchoolsListPane } from "@/components/schools/schools-list-pane";
import { isUuid } from "@/lib/uuid";

export const Route = createFileRoute("/schools")({
  component: SchoolsShell,
});

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

  const segment = pathname.match(/^\/schools\/([^/]+)/)?.[1];
  const selectedKey =
    segment && segment !== "new" && isUuid(segment) ? segment : null;

  return (
    <ListDetailLayout
      selectedKey={selectedKey}
      onSelectedKeyChange={(key) => {
        if (key) {
          void navigate({
            to: "/schools/$schoolId",
            params: { schoolId: key },
          });
        } else {
          void navigate({ to: "/schools" });
        }
      }}
      list={<SchoolsListPane />}
      detail={<Outlet />}
    />
  );
}
