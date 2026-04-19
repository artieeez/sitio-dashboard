import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { PassengerEditForm } from "@/components/trips/PassengerEditForm";
import { PassengerWorkspacePageShell } from "@/components/trips/passenger-workspace-chrome";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";

export const Route = createFileRoute(
  "/trips/$tripId/passengers/$passengerId/edit",
)({
  component: EditPassengerPage,
});

function EditPassengerPage() {
  const { tripId, passengerId } = Route.useParams();
  const navigate = useNavigate();
  const tripIdValid = isUuid(tripId);
  const passengerIdValid = isUuid(passengerId);

  if (!tripIdValid || !passengerIdValid) {
    return (
      <div className="p-6">
        <RouteInvalidRecovery
          backTo="/schools"
          linkLabel={ptBR.entities.schools}
        />
      </div>
    );
  }

  return (
    <PassengerWorkspacePageShell
      tripId={tripId}
      passengerId={passengerId}
      activeTab="details"
    >
      {() => (
        <PassengerEditForm
          tripId={tripId}
          passengerId={passengerId}
          onSuccess={() => {
            void navigate({
              to: "/trips/$tripId/passengers",
              params: { tripId },
            });
          }}
        />
      )}
    </PassengerWorkspacePageShell>
  );
}
