import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { XIcon } from "lucide-react";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { PassengerEditForm } from "@/components/trips/PassengerEditForm";
import { Button } from "@/components/ui/button";
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
  const { requestCloseDetail } = useListDetailLayout();
  const idsValid =
    isUuid(schoolId) && isUuid(tripId) && isUuid(passengerId);

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
    <div className="flex min-w-0 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-medium">
          {ptBR.actions.edit} {ptBR.entities.passenger}
        </h1>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 gap-1 px-2"
          onClick={() => requestCloseDetail()}
          aria-label={ptBR.listDetail.detailClose}
        >
          <XIcon className="size-4 shrink-0" aria-hidden />
        </Button>
      </div>
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
    </div>
  );
}
