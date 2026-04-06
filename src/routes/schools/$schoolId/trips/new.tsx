import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
      <RouteInvalidRecovery
        backTo="/schools"
        linkLabel={ptBR.entities.schools}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <Link
          to="/schools/$schoolId/trips"
          params={{ schoolId }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {ptBR.entities.trips}
        </Link>
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
