import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  CircleOff,
  Clock,
  CreditCard,
  User,
  XIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { z } from "zod";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { PassengerAdjustToPaidChip } from "@/components/trips/passenger-adjust-to-paid-chip";
import { PassengerClearManualPaidControl } from "@/components/trips/passenger-clear-manual-paid-control";
import { PassengerWorkspaceOptionsMenu } from "@/components/trips/passenger-workspace-options-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { apiJson } from "@/lib/api-client";
import {
  passengerPaymentStatusBadgeClass,
  passengerPaymentStatusLabel,
} from "@/lib/passenger-payment-status";
import { queryKeys } from "@/lib/query-keys";
import {
  type PassengerWithStatus,
  type PaymentStatus,
  passengerWithStatusSchema,
} from "@/lib/schemas/passenger";
import { passengerEditLink, paymentsIndexLink } from "@/lib/trip-payment-links";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";

function PassengerPaymentStatusBadgeIcon({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  const iconClass = cn("size-3.5 shrink-0", className);
  switch (status) {
    case "pending":
      return <Clock className={iconClass} aria-hidden />;
    case "settled_payments":
      return <CreditCard className={iconClass} aria-hidden />;
    case "settled_manual":
      return <BadgeCheck className={iconClass} aria-hidden />;
    default:
      return <CircleOff className={iconClass} aria-hidden />;
  }
}

function PassengerWorkspacePaneHeader(props: {
  tripId: string;
  passenger: PassengerWithStatus;
}) {
  const { requestCloseDetail } = useListDetailLayout();
  const { passenger } = props;
  const cpfLine = passenger.cpf?.trim() ? passenger.cpf : "—";
  const statusText = passengerPaymentStatusLabel(passenger.status);

  return (
    <header className="mb-6 flex flex-wrap items-start gap-3">
      <Avatar size="lg" variant="circle" className="shrink-0">
        <AvatarFallback aria-hidden>
          <User className="size-5 text-muted-foreground" strokeWidth={1.75} />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <h1 className="break-words font-semibold text-lg tracking-tight">
          {passenger.fullName}
        </h1>
        <p className="truncate text-muted-foreground text-sm">{cpfLine}</p>
      </div>
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
      <div className="min-w-full shrink-0 basis-full">
        <div className="flex flex-wrap items-start gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-medium text-xs",
              passengerPaymentStatusBadgeClass(passenger.status),
            )}
          >
            <PassengerPaymentStatusBadgeIcon status={passenger.status} />
            {statusText}
          </span>
          <PassengerAdjustToPaidChip
            tripId={props.tripId}
            passenger={passenger}
          />
          <PassengerClearManualPaidControl
            tripId={props.tripId}
            passenger={passenger}
          />
        </div>
      </div>
    </header>
  );
}

const tabLinkClass =
  "inline-flex items-center border-b-2 px-3 py-2 font-medium text-sm transition-colors";

function PassengerDetailPaymentsTabNav(props: {
  tripId: string;
  passengerId: string;
  schoolId?: string;
  active: "details" | "payments";
  passenger: PassengerWithStatus;
}) {
  const { tripId, passengerId, schoolId, active, passenger } = props;
  const ids = { tripId, passengerId, schoolId };
  const editLink = passengerEditLink(ids);
  const paymentsLink = paymentsIndexLink(ids);

  return (
    <div className="mb-6 flex w-full min-w-0 items-center gap-2">
      <nav
        className="flex min-w-0 flex-1 gap-1"
        aria-label={ptBR.passengerWorkspace.tabNavAria}
      >
        <Link
          {...editLink}
          className={cn(
            tabLinkClass,
            active === "details"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
          aria-current={active === "details" ? "page" : undefined}
        >
          {ptBR.passengerWorkspace.detailsTab}
        </Link>
        <Link
          {...paymentsLink}
          className={cn(
            tabLinkClass,
            active === "payments"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
          aria-current={active === "payments" ? "page" : undefined}
        >
          {ptBR.passengerWorkspace.paymentsTab}
        </Link>
      </nav>
      <PassengerWorkspaceOptionsMenu
        tripId={tripId}
        passenger={passenger}
        schoolId={schoolId}
      />
    </div>
  );
}

export function PassengerWorkspacePageShell(props: {
  tripId: string;
  passengerId: string;
  schoolId?: string;
  activeTab: "details" | "payments";
  children: (passenger: PassengerWithStatus) => ReactNode;
}) {
  const { tripId, passengerId, schoolId, activeTab, children } = props;
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

  return (
    <div className="min-w-0 p-6">
      <PassengerWorkspacePaneHeader tripId={tripId} passenger={passenger} />
      <PassengerDetailPaymentsTabNav
        tripId={tripId}
        passengerId={passengerId}
        schoolId={schoolId}
        active={activeTab}
        passenger={passenger}
      />
      {children(passenger)}
    </div>
  );
}
