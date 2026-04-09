import { createFileRoute } from "@tanstack/react-router";

import { PassengerPaymentsIndexBody } from "@/components/trips/passenger-payments-route-bodies";

export const Route = createFileRoute(
  "/trips/$tripId/passengers/$passengerId/payments/",
)({
  component: PassengerPaymentsIndexPage,
});

function PassengerPaymentsIndexPage() {
  const { tripId, passengerId } = Route.useParams();
  return (
    <PassengerPaymentsIndexBody tripId={tripId} passengerId={passengerId} />
  );
}
