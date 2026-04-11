import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { XIcon } from "lucide-react";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { PassengerCreateForm } from "@/components/trips/PassengerCreateForm";
import { Button } from "@/components/ui/button";
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
  const { requestCloseDetail } = useListDetailLayout();
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
      <header className="flex min-w-0 items-center justify-between gap-3">
        <h1 className="min-w-0 text-lg font-medium leading-snug">
          {ptBR.actions.create} {ptBR.entities.passenger}
        </h1>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label={ptBR.listDetail.detailClose}
          onClick={() => requestCloseDetail()}
        >
          <XIcon className="size-4 shrink-0" aria-hidden />
        </Button>
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
