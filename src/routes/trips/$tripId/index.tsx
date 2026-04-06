import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { TripForm } from "@/components/trips/TripForm";
import { TripStatusSummary } from "@/components/trips/TripStatusSummary";
import { buttonVariants } from "@/components/ui/button";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { tripSchema } from "@/lib/schemas/trip";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";
import { useUiPreferencesStore } from "@/stores/ui-preferences-store";

export const Route = createFileRoute("/trips/$tripId/")({
  component: TripDetailPage,
});

function TripDetailPage() {
  const { tripId } = Route.useParams();
  const qc = useQueryClient();
  const tripIdValid = isUuid(tripId);

  const schoolIdForBack = useQuery({
    queryKey: queryKeys.trip(tripId),
    queryFn: async () => {
      const raw = await apiJson<unknown>(`/trips/${tripId}`);
      return tripSchema.parse(raw);
    },
    enabled: tripIdValid,
  });

  const includeInactiveTrips = useUiPreferencesStore(
    (s) => s.includeInactiveTrips,
  );

  if (!tripIdValid) {
    return (
      <RouteInvalidRecovery
        backTo="/schools"
        linkLabel={ptBR.entities.schools}
      />
    );
  }

  if (schoolIdForBack.isLoading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  if (schoolIdForBack.isError || !schoolIdForBack.data) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600" role="alert">
          Viagem não encontrada.
        </p>
        <Link to="/schools" className="mt-2 inline-block text-sm text-primary">
          ← {ptBR.entities.schools}
        </Link>
      </div>
    );
  }

  const trip = schoolIdForBack.data;
  const schoolId = trip.schoolId;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          {ptBR.nav.home}
        </Link>
        <span className="mx-1.5">/</span>
        <Link to="/schools" className="hover:text-foreground">
          {ptBR.entities.schools}
        </Link>
        <span className="mx-1.5">/</span>
        <Link
          to="/schools/$schoolId/trips"
          params={{ schoolId }}
          className="hover:text-foreground"
        >
          {ptBR.entities.trips}
        </Link>
      </nav>
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div>
            <Link
              to="/schools/$schoolId/trips"
              params={{ schoolId }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← {ptBR.entities.trips}
            </Link>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-lg font-medium">
                {trip.title?.trim() ||
                  `${ptBR.entities.trip} ${tripId.slice(0, 8)}…`}
              </h1>
              <Link
                to="/trips/$tripId/passengers"
                params={{ tripId }}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "no-underline",
                )}
              >
                {ptBR.entities.passengers}
              </Link>
            </div>
          </div>

          <section className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-medium">
              {ptBR.actions.edit} {ptBR.entities.trip}
            </h2>
            <TripForm
              mode="edit"
              schoolId={schoolId}
              trip={trip}
              onSuccess={async () => {
                await qc.invalidateQueries({
                  queryKey: queryKeys.trip(tripId),
                });
                await qc.invalidateQueries({
                  queryKey: queryKeys.trips(schoolId, includeInactiveTrips),
                });
                await qc.invalidateQueries({
                  queryKey: queryKeys.passengers(tripId, false),
                });
                await qc.invalidateQueries({
                  queryKey: queryKeys.passengers(tripId, true),
                });
                await qc.invalidateQueries({
                  queryKey: ["passengerAggregates", tripId],
                });
              }}
            />
          </section>
        </div>
        <div className="lg:col-span-1">
          <TripStatusSummary tripId={tripId} />
        </div>
      </div>
    </div>
  );
}
