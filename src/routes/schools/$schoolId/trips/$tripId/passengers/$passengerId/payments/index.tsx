import { createFileRoute } from "@tanstack/react-router";

import { PassengerPaymentsIndexBody } from "@/components/trips/passenger-payments-route-bodies";

export const Route = createFileRoute(
  "/schools/$schoolId/trips/$tripId/passengers/$passengerId/payments/",
)({
  component: SchoolScopedPassengerPaymentsIndexPage,
});

function SchoolScopedPassengerPaymentsIndexPage() {
  const { schoolId, tripId, passengerId } = Route.useParams();
  return (
    <PassengerPaymentsIndexBody
      tripId={tripId}
      passengerId={passengerId}
      schoolId={schoolId}
    />
  );
}
