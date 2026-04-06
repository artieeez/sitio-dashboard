import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { apiDelete, apiJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { paymentSchema } from "@/lib/schemas/payment";
import { cn } from "@/lib/utils";
import { ptBR } from "@/messages/pt-BR";
import { PaymentForm } from "./PaymentForm";

function brlMinor(minor: number): string {
  return (minor / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function PassengerPaymentHistory(props: {
  tripId: string;
  passengerId: string;
  /** When set, new payments are blocked server-side; show context copy. */
  removedAt?: string | null;
}) {
  const { tripId, passengerId, removedAt } = props;
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const list = useQuery({
    queryKey: queryKeys.payments(passengerId),
    queryFn: async () => {
      const raw = await apiJson<unknown>(`/passengers/${passengerId}/payments`);
      return z.array(paymentSchema).parse(raw);
    },
  });

  const remove = useMutation({
    mutationFn: async (paymentId: string) => {
      await apiDelete(`/payments/${paymentId}`);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: queryKeys.payments(passengerId),
      });
      await qc.invalidateQueries({
        queryKey: queryKeys.passengers(tripId, false),
      });
      await qc.invalidateQueries({
        queryKey: queryKeys.passengers(tripId, true),
      });
      await qc.invalidateQueries({
        queryKey: ["passengerAggregates", tripId],
      });
    },
  });

  const editing = list.data?.find((p) => p.id === editingId);

  return (
    <div
      className={`flex flex-col gap-4 ${removedAt ? "rounded-lg border border-amber-600/50 bg-amber-50/40 p-3 dark:border-amber-500/40 dark:bg-amber-950/30" : ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium">{ptBR.entities.payments}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {!removedAt ? (
            <Link
              to="/trips/$tripId/passengers/$passengerId/payments/new"
              params={{ tripId, passengerId }}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "no-underline",
              )}
            >
              {ptBR.actions.newPayment}
            </Link>
          ) : null}
          <Link
            to="/trips/$tripId"
            params={{ tripId }}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "no-underline",
            )}
          >
            ← {ptBR.entities.trip}
          </Link>
        </div>
      </div>
      {removedAt ? (
        <p className="text-sm text-amber-800 dark:text-amber-200" role="status">
          {ptBR.fields.removedPassenger}: histórico somente leitura; novos
          pagamentos não são permitidos.
        </p>
      ) : null}
      {list.isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : list.isError ? (
        <p className="text-sm text-red-600" role="alert">
          Não foi possível carregar os pagamentos.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="p-2 font-medium">{ptBR.fields.paidOn}</th>
                <th className="p-2 font-medium">{ptBR.fields.amount}</th>
                <th className="p-2 font-medium">{ptBR.fields.location}</th>
                <th className="p-2 font-medium">{ptBR.fields.payerIdentity}</th>
                <th className="p-2 font-medium">⋯</th>
              </tr>
            </thead>
            <tbody>
              {list.data?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-muted-foreground">
                    Nenhum pagamento registrado.
                  </td>
                </tr>
              ) : (
                list.data?.map((p) => (
                  <tr key={p.id} className="border-b border-border/80">
                    <td className="p-2 tabular-nums">{p.paidOn}</td>
                    <td className="p-2 tabular-nums">
                      {brlMinor(p.amountMinor)}
                    </td>
                    <td className="p-2">{p.location}</td>
                    <td className="p-2">{p.payerIdentity}</td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setEditingId((id) => (id === p.id ? null : p.id))
                          }
                        >
                          {ptBR.actions.edit}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={remove.isPending}
                          onClick={() => {
                            if (
                              globalThis.confirm("Excluir este pagamento?") !==
                              true
                            ) {
                              return;
                            }
                            remove.mutate(p.id);
                          }}
                        >
                          {ptBR.actions.delete}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {editing && editingId ? (
        <PaymentForm
          key={editingId}
          tripId={tripId}
          passengerId={passengerId}
          mode="edit"
          payment={editing}
          onCancel={() => setEditingId(null)}
          onSuccess={() => setEditingId(null)}
        />
      ) : null}
    </div>
  );
}
