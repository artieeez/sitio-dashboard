import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { PassengerPaymentHistory } from "@/components/trips/PassengerPaymentHistory";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { passengerWithStatusSchema } from "@/lib/schemas/passenger";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";

export const Route = createFileRoute(
  "/trips/$tripId/passengers/$passengerId/payments/",
)({
  component: PassengerPaymentsIndexPage,
});

function PassengerPaymentsIndexPage() {
  const { tripId, passengerId } = Route.useParams();
  const idsValid = isUuid(tripId) && isUuid(passengerId);

  const passengersQuery = useQuery({
    queryKey: queryKeys.passengers(tripId, true),
    queryFn: async () => {
      const raw = await apiJson<unknown>(
        `/trips/${tripId}/passengers?includeRemoved=true`,
      );
      return z.array(passengerWithStatusSchema).parse(raw);
    },
    enabled: idsValid,
  });

  if (!idsValid) {
    return (
      <RouteInvalidRecovery
        backTo="/schools"
        linkLabel={ptBR.entities.schools}
      />
    );
  }

  const passenger = passengersQuery.data?.find((p) => p.id === passengerId);

  if (passengersQuery.isLoading) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  if (!passenger) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600" role="alert">
          Passageiro não encontrado nesta viagem.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <PassengerPaymentHistory
        tripId={tripId}
        passengerId={passengerId}
        removedAt={passenger.removedAt}
      />
    </div>
  );
}
