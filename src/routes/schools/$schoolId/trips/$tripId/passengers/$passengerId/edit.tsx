import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { PassengerEditForm } from "@/components/trips/PassengerEditForm";
import { PassengerWorkspacePageShell } from "@/components/trips/passenger-workspace-chrome";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";

export const Route = createFileRoute(
  "/schools/$schoolId/trips/$tripId/passengers/$passengerId/edit",
)({
  component: SchoolScopedEditPassengerPage,
});

function SchoolScopedEditPassengerPage() {
  const { schoolId, tripId, passengerId } = Route.useParams();
  const navigate = useNavigate();
  const idsValid = isUuid(schoolId) && isUuid(tripId) && isUuid(passengerId);

  if (!idsValid) {
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
      schoolId={schoolId}
      activeTab="details"
    >
      {() => (
        <PassengerEditForm
          tripId={tripId}
          passengerId={passengerId}
          onSuccess={() => {
            void navigate({
              to: "/schools/$schoolId/trips/$tripId/passengers",
              params: { schoolId, tripId },
            });
          }}
        />
      )}
    </PassengerWorkspacePageShell>
  );
}
