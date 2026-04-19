import { createFileRoute } from "@tanstack/react-router";

import { NewPassengerPaymentBody } from "@/components/trips/passenger-payments-route-bodies";

export const Route = createFileRoute(
  "/trips/$tripId/passengers/$passengerId/payments/new",
)({
  component: NewPassengerPaymentPage,
});

function NewPassengerPaymentPage() {
  const { tripId, passengerId } = Route.useParams();
  return <NewPassengerPaymentBody tripId={tripId} passengerId={passengerId} />;
}
