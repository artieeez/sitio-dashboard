import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { PassengerRowActions } from "@/components/trips/PassengerRowActions";
import { Button } from "@/components/ui/button";
import { RowKebabMenu } from "@/components/ui/row-kebab-menu";
import { ApiError, apiPatchJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  type PassengerWithStatus,
  type PaymentStatus,
  passengerWithStatusSchema,
} from "@/lib/schemas/passenger";
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
}) {
  const { tripId, rows, includeRemoved, onIncludeRemovedChange } = props;
  const qc = useQueryClient();

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
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="p-2 font-medium">{ptBR.fields.fullName}</th>
              <th className="p-2 font-medium">{ptBR.fields.cpf}</th>
              <th className="p-2 font-medium">{ptBR.fields.paymentStatus}</th>
              <th className="p-2 font-medium">
                {ptBR.fields.manualPaidWithoutInfo}
              </th>
              <th className="p-2 font-medium">
                <span className="sr-only">{ptBR.aria.rowMenu}</span>
              </th>
              <th className="p-2 font-medium">{ptBR.actions.restore}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-muted-foreground">
                  {ptBR.entities.passengers} — nenhum registro.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="border-b border-border/80">
                  <td className="p-2">
                    {p.fullName}
                    {p.removedAt ? (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({ptBR.fields.removedPassenger})
                      </span>
                    ) : null}
                  </td>
                  <td className="p-2 tabular-nums">{p.cpf ?? "—"}</td>
                  <td className={`p-2 ${statusToneClass(p.status)}`}>
                    {statusLabel(p.status)}
                  </td>
                  <td className="p-2 align-top">
                    <PassengerRowActions tripId={tripId} passenger={p} />
                  </td>
                  <td className="p-2">
                    <RowKebabMenu ariaLabel={ptBR.aria.rowMenu}>
                      <Link
                        role="menuitem"
                        to="/trips/$tripId/passengers/$passengerId/payments"
                        params={{ tripId, passengerId: p.id }}
                        className="rounded px-2 py-1.5 text-sm hover:bg-muted"
                      >
                        {ptBR.actions.paymentHistory}
                      </Link>
                      {!p.removedAt ? (
                        <Link
                          role="menuitem"
                          to="/trips/$tripId/passengers/$passengerId/payments/new"
                          params={{ tripId, passengerId: p.id }}
                          className="rounded px-2 py-1.5 text-sm hover:bg-muted"
                        >
                          {ptBR.actions.newPayment}
                        </Link>
                      ) : null}
                    </RowKebabMenu>
                  </td>
                  <td className="p-2">
                    {p.removedAt ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={patchPassenger.isPending}
                        onClick={() =>
                          patchPassenger.mutate({
                            passengerId: p.id,
                            body: { removed: false },
                          })
                        }
                      >
                        {ptBR.actions.restore}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={patchPassenger.isPending}
                        onClick={() =>
                          patchPassenger.mutate({
                            passengerId: p.id,
                            body: { removed: true },
                          })
                        }
                      >
                        {ptBR.actions.delete}
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {patchPassenger.error instanceof ApiError ? (
        <p className="text-sm text-red-600" role="alert">
          Falha ao atualizar passageiro.
        </p>
      ) : null}
    </div>
  );
}
