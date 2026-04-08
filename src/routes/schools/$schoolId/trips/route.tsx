import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

import { ListDetailLayout } from "@/components/layout/list-detail-layout";
import { SchoolTripsListPane } from "@/components/schools/school-trips-list-pane";

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
      if (!key || key === "__new__") return;
      void navigate({ to: "/trips/$tripId", params: { tripId: key } });
    },
    [navigate],
  );

  return (
    <ListDetailLayout
      selectedKey={selectedKey}
      onSelectedKeyChange={onSelectedKeyChange}
      list={<SchoolTripsListPane schoolId={schoolId} />}
      detail={<Outlet />}
    />
  );
}
