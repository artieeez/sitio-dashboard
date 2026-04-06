import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { PaymentForm } from "@/components/trips/PaymentForm";
import { buttonVariants } from "@/components/ui/button";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { passengerWithStatusSchema } from "@/lib/schemas/passenger";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";

export const Route = createFileRoute(
  "/trips/$tripId/passengers/$passengerId/payments/new",
)({
  component: NewPassengerPaymentPage,
});

function NewPassengerPaymentPage() {
  const { tripId, passengerId } = Route.useParams();
  const navigate = useNavigate();
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

  if (passenger.removedAt) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <p className="text-sm text-amber-800 dark:text-amber-200" role="status">
          Passageiro removido — não é possível registrar novos pagamentos.
        </p>
        <Link
          to="/trips/$tripId/passengers/$passengerId/payments"
          params={{ tripId, passengerId }}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "mt-4 inline-flex no-underline",
          )}
        >
          ← {ptBR.actions.paymentHistory}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 p-6">
      <Link
        to="/trips/$tripId/passengers/$passengerId/payments"
        params={{ tripId, passengerId }}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← {ptBR.actions.paymentHistory}
      </Link>
      <PaymentForm
        tripId={tripId}
        passengerId={passengerId}
        defaultAmountMinor={passenger.effectiveExpectedMinor}
        onSuccess={() => {
          void navigate({
            to: "/trips/$tripId/passengers/$passengerId/payments",
            params: { tripId, passengerId },
          });
        }}
      />
    </div>
  );
}
