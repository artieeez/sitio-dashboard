import { createFileRoute } from "@tanstack/react-router";

import { EditPassengerPaymentBody } from "@/components/trips/passenger-payments-route-bodies";

export const Route = createFileRoute(
  "/trips/$tripId/passengers/$passengerId/payments/$paymentId/edit",
)({
  component: EditPassengerPaymentPage,
});

function EditPassengerPaymentPage() {
  const { tripId, passengerId, paymentId } = Route.useParams();
  return (
    <EditPassengerPaymentBody
      tripId={tripId}
      passengerId={passengerId}
      paymentId={paymentId}
    />
  );
}
