import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { TripForm } from "@/components/trips/TripForm";
import { queryKeys } from "@/lib/query-keys";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

export const Route = createFileRoute("/schools/$schoolId/trips/new")({
  component: NewTripPage,
});

function NewTripPage() {
  const { schoolId } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const includeInactive = useUiPreferencesStore((s) => s.includeInactiveTrips);
  const schoolIdValid = isUuid(schoolId);

  if (!schoolIdValid) {
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
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-lg font-medium">
          {ptBR.actions.create} {ptBR.entities.trip}
        </h1>
        <p className="text-xs text-muted-foreground">
          A viagem é sempre criada para esta escola (sem seletor de escola).
        </p>
      </header>

      <TripForm
        mode="create"
        schoolId={schoolId}
        onSuccess={async () => {
          await qc.invalidateQueries({
            queryKey: queryKeys.trips(schoolId, includeInactive),
          });
          await navigate({
            to: "/schools/$schoolId/trips",
            params: { schoolId },
          });
        }}
      />
    </div>
  );
}
