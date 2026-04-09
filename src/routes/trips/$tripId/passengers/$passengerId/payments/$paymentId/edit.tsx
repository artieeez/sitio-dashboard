import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { PaymentForm } from "@/components/trips/PaymentForm";
import { buttonVariants } from "@/components/ui/button";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { passengerWithStatusSchema } from "@/lib/schemas/passenger";
import { paymentSchema } from "@/lib/schemas/payment";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";

export const Route = createFileRoute(
  "/trips/$tripId/passengers/$passengerId/payments/$paymentId/edit",
)({
  component: EditPassengerPaymentPage,
});

function EditPassengerPaymentPage() {
  const { tripId, passengerId, paymentId } = Route.useParams();
  const navigate = useNavigate();
  const idsValid = isUuid(tripId) && isUuid(passengerId) && isUuid(paymentId);

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

  const paymentsQuery = useQuery({
    queryKey: queryKeys.payments(passengerId),
    queryFn: async () => {
      const raw = await apiJson<unknown>(`/passengers/${passengerId}/payments`);
      return z.array(paymentSchema).parse(raw);
    },
    enabled: idsValid,
  });

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

  const passenger = passengersQuery.data?.find((p) => p.id === passengerId);
  const payment = paymentsQuery.data?.find((p) => p.id === paymentId);

  if (passengersQuery.isLoading || paymentsQuery.isLoading) {
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

  if (!payment) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <p className="text-sm text-red-600" role="alert">
          Pagamento não encontrado.
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

  if (passenger.removedAt) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <p className="text-sm text-amber-800 dark:text-amber-200" role="status">
          Passageiro removido — não é possível editar pagamentos.
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

  const back = () => {
    void navigate({
      to: "/trips/$tripId/passengers/$passengerId/payments",
      params: { tripId, passengerId },
    });
  };

  return (
    <div className="flex min-w-0 flex-col gap-4 p-6">
      <Link
        to="/trips/$tripId/passengers/$passengerId/payments"
        params={{ tripId, passengerId }}
        className="w-fit text-sm text-muted-foreground hover:text-foreground"
      >
        ← {ptBR.actions.paymentHistory}
      </Link>
      <PaymentForm
        tripId={tripId}
        passengerId={passengerId}
        mode="edit"
        payment={payment}
        onSuccess={back}
        onCancel={back}
      />
    </div>
  );
}
