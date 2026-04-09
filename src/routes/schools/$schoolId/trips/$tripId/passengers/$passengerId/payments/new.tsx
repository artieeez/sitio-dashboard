import { createFileRoute } from "@tanstack/react-router";

import { NewPassengerPaymentBody } from "@/components/trips/passenger-payments-route-bodies";

export const Route = createFileRoute(
  "/schools/$schoolId/trips/$tripId/passengers/$passengerId/payments/new",
)({
  component: SchoolScopedNewPassengerPaymentPage,
});

function SchoolScopedNewPassengerPaymentPage() {
  const { schoolId, tripId, passengerId } = Route.useParams();
  return (
    <NewPassengerPaymentBody
      tripId={tripId}
      passengerId={passengerId}
      schoolId={schoolId}
    />
  );
}
