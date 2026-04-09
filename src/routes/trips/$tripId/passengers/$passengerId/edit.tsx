import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { XIcon } from "lucide-react";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { PassengerEditForm } from "@/components/trips/PassengerEditForm";
import { Button } from "@/components/ui/button";
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
  const { requestCloseDetail } = useListDetailLayout();
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
          void navigate({ to: "/trips/$tripId/passengers", params: { tripId } });
        }}
      />
    </div>
  );
}
