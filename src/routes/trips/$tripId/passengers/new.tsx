import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { DetailPanePageHeader } from "@/components/layout/detail-pane-page-header";
import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { PassengerCreateForm } from "@/components/trips/PassengerCreateForm";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";

export const Route = createFileRoute("/trips/$tripId/passengers/new")({
  component: NewPassengerPage,
});

function NewPassengerPage() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const { requestCloseDetail } = useListDetailLayout();
  const tripIdValid = isUuid(tripId);

  if (!tripIdValid) {
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
      <DetailPanePageHeader
        title={`${ptBR.actions.create} ${ptBR.entities.passenger}`}
        onClose={requestCloseDetail}
        rowLayout="dense"
        closeButtonSize="icon"
      />

      <PassengerCreateForm
        tripId={tripId}
        onCreated={() => {
          void navigate({
            to: "/trips/$tripId/passengers",
            params: { tripId },
          });
        }}
      />
    </div>
  );
}
