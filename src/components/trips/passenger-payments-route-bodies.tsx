import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { PassengerPaymentHistory } from "@/components/trips/PassengerPaymentHistory";
import { PaymentForm } from "@/components/trips/PaymentForm";
import { PassengerWorkspacePageShell } from "@/components/trips/passenger-workspace-chrome";
import { buttonVariants } from "@/components/ui/button";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { paymentSchema } from "@/lib/schemas/payment";
import { paymentsIndexLink } from "@/lib/trip-payment-links";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";

export function PassengerPaymentsIndexBody(props: {
  tripId: string;
  passengerId: string;
  schoolId?: string;
}) {
  const { tripId, passengerId, schoolId } = props;

  return (
    <PassengerWorkspacePageShell
      tripId={tripId}
      passengerId={passengerId}
      schoolId={schoolId}
      activeTab="payments"
    >
      {(passenger) => (
        <PassengerPaymentHistory
          tripId={tripId}
          passengerId={passengerId}
          removedAt={passenger.removedAt}
          schoolId={schoolId}
        />
      )}
    </PassengerWorkspacePageShell>
  );
}

export function NewPassengerPaymentBody(props: {
  tripId: string;
  passengerId: string;
  schoolId?: string;
}) {
  const { tripId, passengerId, schoolId } = props;
  const navigate = useNavigate();

  if (!isUuid(tripId) || !isUuid(passengerId)) {
    return (
      <div className="p-6">
        <RouteInvalidRecovery
          backTo="/schools"
          linkLabel={ptBR.entities.schools}
        />
      </div>
    );
  }

  const base = { tripId, passengerId, schoolId };

  return (
    <PassengerWorkspacePageShell
      tripId={tripId}
      passengerId={passengerId}
      schoolId={schoolId}
      activeTab="payments"
    >
      {(passenger) => {
        if (passenger.removedAt) {
          return (
            <>
              <p
                className="text-sm text-amber-800 dark:text-amber-200"
                role="status"
              >
                Passageiro removido — não é possível registrar novos pagamentos.
              </p>
              <Link
                {...paymentsIndexLink(base)}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "mt-4 inline-flex no-underline",
                )}
              >
                ← {ptBR.actions.paymentHistory}
              </Link>
            </>
          );
        }

        const goBack = () => {
          void navigate(paymentsIndexLink(base));
        };

        return (
          <div className="flex min-w-0 flex-col gap-4">
            <h2 className="text-sm font-medium">
              {`${ptBR.actions.create} ${ptBR.entities.payment}`}
            </h2>
            <PaymentForm
              tripId={tripId}
              passengerId={passengerId}
              defaultAmountMinor={passenger.effectiveExpectedMinor}
              onSuccess={goBack}
              onCancel={goBack}
            />
          </div>
        );
      }}
    </PassengerWorkspacePageShell>
  );
}

export function EditPassengerPaymentBody(props: {
  tripId: string;
  passengerId: string;
  paymentId: string;
  schoolId?: string;
}) {
  const { tripId, passengerId, paymentId, schoolId } = props;
  const navigate = useNavigate();
  const idsValid = isUuid(tripId) && isUuid(passengerId) && isUuid(paymentId);

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

  const base = { tripId, passengerId, schoolId };

  return (
    <PassengerWorkspacePageShell
      tripId={tripId}
      passengerId={passengerId}
      schoolId={schoolId}
      activeTab="payments"
    >
      {(passenger) => {
        if (passenger.removedAt) {
          return (
            <>
              <p
                className="text-sm text-amber-800 dark:text-amber-200"
                role="status"
              >
                Passageiro removido — não é possível editar pagamentos.
              </p>
              <Link
                {...paymentsIndexLink(base)}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "mt-4 inline-flex no-underline",
                )}
              >
                ← {ptBR.actions.paymentHistory}
              </Link>
            </>
          );
        }

        if (paymentsQuery.isLoading) {
          return <p className="text-sm text-muted-foreground">Carregando…</p>;
        }

        const payment = paymentsQuery.data?.find((p) => p.id === paymentId);

        if (!payment) {
          return (
            <>
              <p className="text-sm text-red-600" role="alert">
                Pagamento não encontrado.
              </p>
              <Link
                {...paymentsIndexLink(base)}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "mt-4 inline-flex no-underline",
                )}
              >
                ← {ptBR.actions.paymentHistory}
              </Link>
            </>
          );
        }

        const goBack = () => {
          void navigate(paymentsIndexLink(base));
        };

        return (
          <div className="flex min-w-0 flex-col gap-4">
            <h2 className="text-sm font-medium">{ptBR.actions.editPayment}</h2>
            <PaymentForm
              tripId={tripId}
              passengerId={passengerId}
              mode="edit"
              payment={payment}
              onSuccess={goBack}
              onCancel={goBack}
            />
          </div>
        );
      }}
    </PassengerWorkspacePageShell>
  );
}
