import { createFileRoute } from "@tanstack/react-router";

import { EditPassengerPaymentBody } from "@/components/trips/passenger-payments-route-bodies";

export const Route = createFileRoute(
  "/schools/$schoolId/trips/$tripId/passengers/$passengerId/payments/$paymentId/edit",
)({
  component: SchoolScopedEditPassengerPaymentPage,
});

function SchoolScopedEditPassengerPaymentPage() {
  const { schoolId, tripId, passengerId, paymentId } = Route.useParams();
  return (
    <EditPassengerPaymentBody
      tripId={tripId}
      passengerId={passengerId}
      paymentId={paymentId}
      schoolId={schoolId}
    />
  );
}
