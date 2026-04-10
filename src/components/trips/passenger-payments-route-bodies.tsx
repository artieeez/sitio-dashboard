import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { XIcon } from "lucide-react";
import { z } from "zod";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { PassengerPaymentHistory } from "@/components/trips/PassengerPaymentHistory";
import { PaymentForm } from "@/components/trips/PaymentForm";
import { PassengerWorkspacePageShell } from "@/components/trips/passenger-workspace-chrome";
import { Button, buttonVariants } from "@/components/ui/button";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { passengerWithStatusSchema } from "@/lib/schemas/passenger";
import { paymentSchema } from "@/lib/schemas/payment";
import { paymentsIndexLink } from "@/lib/trip-payment-links";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";

function PaymentFormDetailHeader(props: { title: string }) {
  const { requestCloseDetail } = useListDetailLayout();
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h1 className="text-lg font-medium">{props.title}</h1>
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
  );
}

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
      <div className="p-6">
        <RouteInvalidRecovery
          backTo="/schools"
          linkLabel={ptBR.entities.schools}
        />
      </div>
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

  const base = { tripId, passengerId, schoolId };

  if (passenger.removedAt) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <p className="text-sm text-amber-800 dark:text-amber-200" role="status">
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
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6 p-6">
      <PaymentFormDetailHeader
        title={`${ptBR.actions.create} ${ptBR.entities.payment}`}
      />
      <PaymentForm
        tripId={tripId}
        passengerId={passengerId}
        defaultAmountMinor={passenger.effectiveExpectedMinor}
        onSuccess={() => {
          void navigate(paymentsIndexLink(base));
        }}
      />
    </div>
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

  const base = { tripId, passengerId, schoolId };

  if (!passenger) {
    return (
      <div className="mx-auto max-w-4xl p-6">
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
          {...paymentsIndexLink(base)}
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
          {...paymentsIndexLink(base)}
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
    void navigate(paymentsIndexLink(base));
  };

  return (
    <div className="flex min-w-0 flex-col gap-6 p-6">
      <PaymentFormDetailHeader title={ptBR.actions.editPayment} />
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
