import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { User, XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { z } from "zod";

import { useListDetailLayout } from "@/components/layout/list-detail-layout";
import { RouteInvalidRecovery } from "@/components/layout/route-invalid-recovery";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  type PassengerWithStatus,
  passengerWithStatusSchema,
} from "@/lib/schemas/passenger";
import { passengerEditLink, paymentsIndexLink } from "@/lib/trip-payment-links";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/uuid";
import { ptBR } from "@/messages/pt-BR";

function PassengerWorkspacePaneHeader(props: {
  fullName: string;
  cpf: string | null;
}) {
  const { requestCloseDetail } = useListDetailLayout();
  const cpfLine = props.cpf?.trim() ? props.cpf : "—";
  return (
    <header className="mb-6 flex items-start gap-3">
      <Avatar size="lg" variant="circle" className="shrink-0">
        <AvatarFallback aria-hidden>
          <User className="size-5 text-muted-foreground" strokeWidth={1.75} />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-semibold text-lg tracking-tight">
          {props.fullName}
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
}) {
  const { tripId, passengerId, schoolId, active } = props;
  const ids = { tripId, passengerId, schoolId };
  const editLink = passengerEditLink(ids);
  const paymentsLink = paymentsIndexLink(ids);

  return (
    <nav
      className="mb-6 flex w-full min-w-0 gap-1"
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
      <PassengerWorkspacePaneHeader
        fullName={passenger.fullName}
        cpf={passenger.cpf}
      />
      <PassengerDetailPaymentsTabNav
        tripId={tripId}
        passengerId={passengerId}
        schoolId={schoolId}
        active={activeTab}
      />
      {children(passenger)}
    </div>
  );
}
