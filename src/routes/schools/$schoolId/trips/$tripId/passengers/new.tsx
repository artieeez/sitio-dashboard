import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { PassengerCreateForm } from "@/components/trips/PassengerCreateForm";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";

export const Route = createFileRoute(
  "/schools/$schoolId/trips/$tripId/passengers/new",
)({
  component: SchoolScopedNewPassengerPage,
});

function SchoolScopedNewPassengerPage() {
  const { schoolId, tripId } = Route.useParams();
  const navigate = useNavigate();
  const tripIdValid = isUuid(tripId);
  const schoolIdValid = isUuid(schoolId);

  if (!tripIdValid || !schoolIdValid) {
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
    <div className="flex min-w-0 flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-lg font-medium">
          {ptBR.actions.create} {ptBR.entities.passenger}
        </h1>
      </header>

      <PassengerCreateForm
        tripId={tripId}
        onCreated={() => {
          void navigate({
            to: "/schools/$schoolId/trips/$tripId/passengers",
            params: { schoolId, tripId },
          });
        }}
      />
    </div>
  );
}
