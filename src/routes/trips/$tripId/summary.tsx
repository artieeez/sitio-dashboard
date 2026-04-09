import { createFileRoute } from "@tanstack/react-router";

import { TripSummaryDetail } from "@/components/trips/trip-summary-detail";

export const Route = createFileRoute("/trips/$tripId/summary")({
  component: TripSummaryPage,
});

function TripSummaryPage() {
  const { tripId } = Route.useParams();
  return <TripSummaryDetail tripId={tripId} />;
}
