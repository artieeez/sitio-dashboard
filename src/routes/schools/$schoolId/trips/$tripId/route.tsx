import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/schools/$schoolId/trips/$tripId")({
  component: SchoolTripSegmentLayout,
});

function SchoolTripSegmentLayout() {
  return <Outlet />;
}
