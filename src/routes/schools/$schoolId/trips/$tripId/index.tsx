import { createFileRoute } from "@tanstack/react-router";

import { TripSummaryDetail } from "@/components/trips/trip-summary-detail";

export const Route = createFileRoute("/schools/$schoolId/trips/$tripId/")({
  component: SchoolScopedTripDetailPage,
});

function SchoolScopedTripDetailPage() {
  const { schoolId, tripId } = Route.useParams();
  return <TripSummaryDetail tripId={tripId} expectedSchoolId={schoolId} />;
}
