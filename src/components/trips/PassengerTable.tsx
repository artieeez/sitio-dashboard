import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { PassengerManualPaidMenuItems } from "@/components/trips/passenger-manual-paid-menu-items";
import { BooleanFilterChip } from "@/components/ui/boolean-filter-chip";
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
  /** When set, row click and arrow keys move the detail pane (same pattern as school trips list). */
  onPassengerRowNavigate?: (passengerId: string) => void;
}) {
  const {
    tripId,
    rows,
    includeRemoved,
    onIncludeRemovedChange,
    selectedPassengerId = null,
    schoolId,
    onPassengerRowNavigate,
  } = props;
  const qc = useQueryClient();
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);
  const [manualPaidErr, setManualPaidErr] = useState<string | null>(null);
  const rowNav = onPassengerRowNavigate;

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
      <div className="flex flex-wrap items-center gap-2">
        <BooleanFilterChip
          checked={includeRemoved}
          onCheckedChange={onIncludeRemovedChange}
        >
          {ptBR.toggles.includeRemovedPassengers}
        </BooleanFilterChip>
      </div>
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
              rows.map((p, rowIndex) => (
                <tr
                  key={p.id}
                  ref={(el) => {
                    rowRefs.current[rowIndex] = el;
                  }}
                  tabIndex={rowNav ? 0 : undefined}
                  className={cn(
                    "border-b border-border/80",
                    selectedPassengerId === p.id && "bg-muted/50",
                    rowNav && "cursor-pointer outline-none",
                  )}
                  aria-selected={
                    selectedPassengerId === p.id ? true : undefined
                  }
                  aria-label={rowNav ? p.fullName : undefined}
                  onClick={rowNav ? () => rowNav(p.id) : undefined}
                  onKeyDown={
                    rowNav
                      ? (ev) => {
                          const idx = rows.findIndex((r) => r.id === p.id);
                          if (idx < 0) return;
                          if (ev.key === "ArrowDown") {
                            ev.preventDefault();
                            const next = Math.min(idx + 1, rows.length - 1);
                            rowRefs.current[next]?.focus();
                            rowNav(rows[next].id);
                          } else if (ev.key === "ArrowUp") {
                            ev.preventDefault();
                            const prev = Math.max(idx - 1, 0);
                            rowRefs.current[prev]?.focus();
                            rowNav(rows[prev].id);
                          } else if (ev.key === "Home") {
                            ev.preventDefault();
                            rowRefs.current[0]?.focus();
                            rowNav(rows[0].id);
                          } else if (ev.key === "End") {
                            ev.preventDefault();
                            const last = rows.length - 1;
                            rowRefs.current[last]?.focus();
                            rowNav(rows[last].id);
                          } else if (ev.key === "Enter" || ev.key === " ") {
                            ev.preventDefault();
                            rowNav(p.id);
                          }
                        }
                      : undefined
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
                  {/* biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation only; menu items handle their own keyboard activation */}
                  <td
                    className={cn(
                      "sticky right-0 z-[2] w-12 min-w-12 border-border border-b border-l p-2 whitespace-nowrap align-middle",
                      selectedPassengerId === p.id
                        ? "bg-muted/50"
                        : "bg-background",
                    )}
                    onClick={(e) => e.stopPropagation()}
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
