import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { PassengerManualPaidMenuItems } from "@/components/trips/passenger-manual-paid-menu-items";
import { RowKebabMenu } from "@/components/ui/row-kebab-menu";
import { ApiError, apiPatchJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  type PassengerWithStatus,
  type PaymentStatus,
  passengerWithStatusSchema,
} from "@/lib/schemas/passenger";
import {
  passengerEditLink,
  paymentsIndexLink,
  paymentsNewLink,
} from "@/lib/trip-payment-links";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";

function statusLabel(s: PaymentStatus): string {
  switch (s) {
    case "pending":
      return ptBR.status.pending;
    case "settled_payments":
      return ptBR.status.settledPayments;
    case "settled_manual":
      return ptBR.status.settledManual;
    case "unavailable":
      return ptBR.status.unavailable;
    default:
      return s;
  }
}

function statusToneClass(s: PaymentStatus): string {
  switch (s) {
    case "settled_payments":
      return "text-blue-800 dark:text-blue-200";
    case "settled_manual":
      return "text-emerald-800 dark:text-emerald-200";
    case "pending":
      return "text-amber-800 dark:text-amber-200";
    default:
      return "text-muted-foreground";
  }
}

export function PassengerTable(props: {
  tripId: string;
  rows: PassengerWithStatus[];
  includeRemoved: boolean;
  onIncludeRemovedChange: (value: boolean) => void;
  /** When set, highlights the row for the passenger payments context (M3 list pane). */
  selectedPassengerId?: string | null;
  /** Under `/schools/.../trips/...`, payment links keep the school list–detail shell. */
  schoolId?: string;
}) {
  const {
    tripId,
    rows,
    includeRemoved,
    onIncludeRemovedChange,
    selectedPassengerId = null,
    schoolId,
  } = props;
  const qc = useQueryClient();
  const [manualPaidErr, setManualPaidErr] = useState<string | null>(null);

  const patchPassenger = useMutation({
    mutationFn: async (input: {
      passengerId: string;
      body: Record<string, unknown>;
    }) => {
      const raw = await apiPatchJson<unknown>(
        `/passengers/${input.passengerId}`,
        input.body,
      );
      return passengerWithStatusSchema.parse(raw);
    },
    onSuccess: async (_, vars) => {
      await qc.invalidateQueries({
        queryKey: queryKeys.passengers(tripId, false),
      });
      await qc.invalidateQueries({
        queryKey: queryKeys.passengers(tripId, true),
      });
      await qc.invalidateQueries({
        queryKey: queryKeys.payments(vars.passengerId),
      });
      await qc.invalidateQueries({
        queryKey: ["passengerAggregates", tripId],
      });
    },
  });

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={includeRemoved}
          onChange={(ev) => onIncludeRemovedChange(ev.target.checked)}
        />
        {ptBR.toggles.includeRemovedPassengers}
      </label>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[520px] border-separate border-spacing-0 text-left text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="border-b border-border p-2 font-medium whitespace-normal">
                {ptBR.fields.name}
              </th>
              <th className="border-b border-border p-2 font-medium whitespace-normal">
                {ptBR.fields.cpf}
              </th>
              <th className="border-b border-border p-2 font-medium whitespace-normal">
                {ptBR.fields.paymentStatus}
              </th>
              <th className="sticky right-0 z-[3] w-12 min-w-12 border-border border-b border-l bg-muted/40 p-2 text-right font-medium whitespace-normal">
                <span className="sr-only">{ptBR.aria.rowMenu}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="border-b border-border p-4 text-muted-foreground whitespace-nowrap"
                >
                  {ptBR.entities.passengers} — nenhum registro.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr
                  key={p.id}
                  className={cn(
                    "border-b border-border/80",
                    selectedPassengerId === p.id && "bg-muted/50",
                  )}
                  aria-selected={
                    selectedPassengerId === p.id ? true : undefined
                  }
                >
                  <td className="border-b border-border p-2 whitespace-nowrap">
                    {p.fullName}
                    {p.removedAt ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({ptBR.fields.removedPassenger})
                      </span>
                    ) : null}
                  </td>
                  <td className="border-b border-border p-2 tabular-nums whitespace-nowrap">
                    {p.cpf ?? "—"}
                  </td>
                  <td
                    className={`border-b border-border p-2 whitespace-nowrap ${statusToneClass(p.status)}`}
                  >
                    {statusLabel(p.status)}
                  </td>
                  <td
                    className={cn(
                      "sticky right-0 z-[2] w-12 min-w-12 border-border border-b border-l p-2 whitespace-nowrap align-middle",
                      selectedPassengerId === p.id
                        ? "bg-muted/50"
                        : "bg-background",
                    )}
                  >
                    <div className="flex justify-end">
                      <RowKebabMenu ariaLabel={ptBR.aria.rowMenu}>
                      {!p.removedAt ? (
                        <Link
                          role="menuitem"
                          {...passengerEditLink({
                            tripId,
                            passengerId: p.id,
                            schoolId,
                          })}
                          className="rounded px-2 py-1.5 text-sm hover:bg-muted"
                        >
                          {ptBR.actions.edit} {ptBR.entities.passenger}
                        </Link>
                      ) : null}
                      <Link
                        role="menuitem"
                        {...paymentsIndexLink({
                          tripId,
                          passengerId: p.id,
                          schoolId,
                        })}
                        className="rounded px-2 py-1.5 text-sm hover:bg-muted"
                      >
                        {ptBR.actions.paymentHistory}
                      </Link>
                      {!p.removedAt ? (
                        <Link
                          role="menuitem"
                          {...paymentsNewLink({
                            tripId,
                            passengerId: p.id,
                            schoolId,
                          })}
                          className="rounded px-2 py-1.5 text-sm hover:bg-muted"
                        >
                          {ptBR.actions.newPayment}
                        </Link>
                      ) : null}
                      {!p.removedAt ? (
                        <PassengerManualPaidMenuItems
                          tripId={tripId}
                          passenger={p}
                          onManualPaidError={setManualPaidErr}
                        />
                      ) : null}
                      {p.removedAt ? (
                        <button
                          type="button"
                          role="menuitem"
                          className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted"
                          disabled={patchPassenger.isPending}
                          onClick={() =>
                            patchPassenger.mutate({
                              passengerId: p.id,
                              body: { removed: false },
                            })
                          }
                        >
                          {ptBR.actions.restore}
                        </button>
                      ) : (
                        <button
                          type="button"
                          role="menuitem"
                          className="w-full rounded px-2 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10"
                          disabled={patchPassenger.isPending}
                          onClick={() =>
                            patchPassenger.mutate({
                              passengerId: p.id,
                              body: { removed: true },
                            })
                          }
                        >
                          {ptBR.actions.delete}
                        </button>
                      )}
                      </RowKebabMenu>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {manualPaidErr ? (
        <p className="text-sm text-red-600" role="alert">
          {manualPaidErr}
        </p>
      ) : null}
      {patchPassenger.error instanceof ApiError ? (
        <p className="text-sm text-red-600" role="alert">
          Falha ao atualizar passageiro.
        </p>
      ) : null}
    </div>
  );
}
